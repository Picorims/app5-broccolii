"""
Copyright (c) 2024 Charly Schmidt aka Picorims<picorims.contact@gmail.com>,
Alexis Hu, Olivier Proquez, Arnaud Bulteau, Maxime Le Bot

This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at http://mozilla.org/MPL/2.0/.
"""

import asyncio
import json
from threading import Timer
import time
import uuid
from pydantic import BaseModel
from fastapi.responses import JSONResponse
from fastapi import APIRouter, WebSocket, status, WebSocketDisconnect, HTTPException
from ..classes import get_random_word_list


router = APIRouter()

sessions = {}


class FightSession:
    def __init__(self, fight_id, player_list):
        self._fight_id = fight_id
        self._players = [player for player in player_list]
        self._players_sessions: dict[str, WebSocket] = {}
        self._players_typing_history = {player: [] for player in player_list}
        self._scores = {player: 0 for player in player_list}
        self._words_to_find = get_random_word_list(amount=100)
        self._words_found = []
        self._word_best_progress = {}
        self._game_start_wait_ms = 5_000
        self._game_duration_ms = 600_000
        self._game_start_epoch_ms = int(time.time() * 1000) + self._game_start_wait_ms
        self._game_end_epoch_ms = self._game_start_epoch_ms + self._game_duration_ms

        def end_game():
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(self._finish_game())
            loop.close()

        timer_delay_seconds = (self._game_start_wait_ms + self._game_duration_ms) / 1000
        Timer(timer_delay_seconds, end_game).start()
        print("Created fight session", self._fight_id)

    def toString(self):
        res = "FightSession : ["
        res += "\t_fight_id : " + self._fight_id + "\n"
        res += "\t_players : " + self._players.__str__() + "\n"
        res += "\t_players_sessions : " + self._players_sessions.__str__() + "\n"
        res += "\t_players_typing_history : " + self._players_typing_history.__str__() + "\n"
        res += "\t_scores : " + self._scores.__str__() + "\n"
        res += "\t_words_to_find : " + self._words_to_find.__str__() + "\n"
        res += "\t_words_found : " + self._words_found.__str__() + "\n"
        res += "\t_word_best_progress : " + self._word_best_progress.__str__() + "\n"
        res += "\t_game_end_epoch : " + self._game_end_epoch_ms.__str__() + "\n"
        res += "]"
        return res

    def add_player_session(self, session: WebSocket, name: str):
        if name in self._players_sessions:
            raise Exception("This player already has a session.")
        self._players_sessions[name] = session

    def player_has_session(self, name: str):
        return name in self._players_sessions

    def remove_player_session(self, name: str):
        """Remove a player from the session.

        If the game ended and there are no more players,
        the session is removed.

        Args:
            name (str): the player to remove.

        Raises:
            Exception: if the player do not have a session.
        """
        if name not in self._players_sessions:
            raise Exception("This player does not have a session.")
        self._players_sessions.pop(name, None)

        now_ms = int(time.time() * 1000)
        if len(self._players_sessions) == 0 and now_ms > self._game_end_epoch_ms:
            self.remove_self()

    def remove_self(self):
        """Closes the fight."""
        sessions.pop(self._fight_id, None)
        print("Removed fight session", self._fight_id)

    def add_player(self, userId: str, websocket: WebSocket):
        self._players.append(userId)
        self.add_player_session(websocket, userId)
        self._players_typing_history[userId] = []
        self._scores[userId] = 0
        return

    def find_user_from_ws(self, ws_to_find: WebSocket):
        print(ws_to_find)
        for ws in self._players_sessions:
            print("\t", self._players_sessions[ws])
            if self._players_sessions[ws] == ws_to_find:
                print("\t\tFound")
                return ws

    async def close_if_player_not_allowed(self, name, websocket):
        """If the player is allowed, do nothing and return False.
        Otherwise, send an error and close the connection, and return True.

        Args:
            name (string): userID
            websocket (WebSocket): socket to eventually close

        Returns:
            bool: session closed
        """
        """if name not in self._players:
            await self._send_error_event(websocket, "Player not in fight session.")
            await websocket.close()
            return True"""
        return False

    async def handle_event(self, event, websocket: WebSocket):
        """handle event. Returns False if the session was closed.

        Args:
            event (json): event object
            websocket (WebSocket): websocket to send data to

        Raises:
            Exception: Non existent type.
            Exception: Missing Fight ID.
            Exception: Missing User ID.

        Returns:
            bool: if the websocket was closed.
        """
        if "type" not in event:
            raise Exception("Non existent type.")
        if "fightID" not in event:
            raise Exception("Missing fight ID")
        if "userID" not in event:
            raise Exception("Missing userID")

        if not event["fightID"] == self._fight_id:
            await self._send_error_event(websocket, "Non matching fight session.")
            await websocket.close()
            return True
        if await self.close_if_player_not_allowed(event["userID"], websocket):
            return True

        # If the player isn't in the game, we add them
        if event["userID"] not in self._players:
            self.add_player(event["userID"], websocket)

        if not self.player_has_session(event["userID"]):
            self.add_player_session(websocket, event["userID"])

        if not (self._players_sessions[event["userID"]] == websocket):
            await self._send_error_event(websocket, "Player already has an open session.")
            self.remove_player_session(event["userID"])
            await websocket.close()
            return True

        if event["type"] == "requestGameState":
            await self._handle_request_game_state(websocket)
        elif event["type"] == "submitLetter":
            await self._handle_submit_letter(websocket, event["userID"], event["letter"])
        elif event["type"] == "submit":
            await self._handle_submit_word(websocket, event["userID"])
        elif event["type"] == "submitEraseLetter":
            await self._handle_erase_letter(websocket, event["userID"])
        else:
            await self._send_error_event(websocket, "Unknown event type.")
        return False

    async def _handle_request_game_state(self, websocket: WebSocket):
        state = {}
        state["scores"] = {player: score for player, score in self._scores.items()}
        state["availableWords"] = [word for word in self._words_to_find]
        state["wordsBestProgress"] = {
            word: progress for word, progress in self._word_best_progress.items()
        }
        state["gameEndEpochMs"] = self._game_end_epoch_ms
        state["gameStartEpochMs"] = self._game_start_epoch_ms
        state["gameRunning"] = await self._is_within_game_time()

        await websocket.send_text(build_json_event("sendGameState", state))

    async def _handle_submit_letter(self, websocket: WebSocket, userID: str, letter: str):
        if not await self._is_within_game_time(websocket):
            return

        self._players_typing_history[userID].append(letter)
        currentState = "".join(self._players_typing_history[userID])
        await websocket.send_text(
            build_json_event("acknowledgeLetter", {"accepted": True, "currentState": currentState})
        )
        await self._update_words_best_progress()

    async def _handle_erase_letter(self, websocket: WebSocket, userID: str):
        if not await self._is_within_game_time(websocket):
            return

        if len(self._players_typing_history[userID]) <= 0:
            await self._send_error_event(websocket, "No letter to erase.")
            return

        self._players_typing_history[userID].pop()
        currentState = "".join(self._players_typing_history[userID])
        await websocket.send_text(
            build_json_event(
                "acknowledgeLetterErased", {"accepted": True, "currentState": currentState}
            )
        )
        await self._update_words_best_progress()

    async def _handle_submit_word(self, websocket: WebSocket, userID: str):
        if not await self._is_within_game_time(websocket):
            return

        currentState = "".join(self._players_typing_history[userID])
        success = False
        if currentState in self._words_to_find:
            self._words_found.append(currentState)
            self._words_to_find.remove(currentState)
            self._scores[userID] += 1
            self._players_typing_history[userID] = []
            await self._update_words_best_progress()
            await self._broadcast(build_json_event("wordsFound", {"words": [currentState]}))
            await self._broadcast(
                build_json_event(
                    "scoresUpdated",
                    {"scores": {player: score for player, score in self._scores.items()}},
                )
            )
            success = True
        await websocket.send_text(
            build_json_event("acknowledgeSubmit", {"success": success, "testedState": currentState})
        )

    async def _send_error_event(self, websocket: WebSocket, msg: str):
        response = {}
        response["message"] = msg
        event = build_json_event("error", response)
        await websocket.send_text(event)

    async def _broadcast(self, msg: str):
        for _, session in self._players_sessions.items():
            await session.send_text(msg)

    async def _update_words_best_progress(self):
        self._word_best_progress = {}
        for player_progress in self._players_typing_history:
            if len(player_progress) > 0:
                for word in self._words_to_find:
                    if len(word) >= len(player_progress):
                        if word.startswith(player_progress):
                            current_best = self._word_best_progress.get(word, 0)
                            new_best = max(current_best, len(player_progress))
                            self._word_best_progress[word] = new_best
        await self._broadcast(
            build_json_event("sendWordsBestProgress", {"words": self._word_best_progress})
        )

    async def _is_within_game_time(self, websocket: WebSocket = None) -> bool:
        """Returns if the game is currently running.

        If a websocket is provided, sends a websocket error event
        if the game is not running.
        """
        now_ms = int(time.time() * 1000)
        if now_ms > self._game_end_epoch_ms:
            if websocket is not None:
                await self._send_error_event(websocket, "Game is over.")
            return False

        if now_ms < self._game_start_epoch_ms:
            if websocket is not None:
                await self._send_error_event(websocket, "Game has not started yet.")
            return False

        return True

    async def _finish_game(self):
        print("Game finished", self._fight_id)
        for player in self._players_sessions:
            prize = self._get_prize_of_player(player)
            await self._players_sessions[player].send_text(
                build_json_event("wonPrize", {"prize": prize})
            )

    def _get_prize_of_player(self, player):
        # TODO: implement
        return self._scores[player]


sessions["test"] = FightSession("test", ["alice", "bob"])


@router.websocket("/fight/{fightId}/ws")
async def websocket_endpoint(fightId, websocket: WebSocket):
    print(f"new connection to {fightId}")
    await websocket.accept()
    user = None
    try:
        while True:
            data = await websocket.receive_text()
            data_obj = await get_json(websocket, data)
            if data_obj is not None:
                if fightId not in sessions:
                    print(f"Session {fightId} does not exist.")
                    payload = {}
                    payload["message"] = "Session does not exist."
                    await websocket.send_text(build_json_event("error", payload))
                    await websocket.close()
                    break
                else:
                    websocket_closed = await sessions[fightId].handle_event(data_obj, websocket)
                    if websocket_closed:
                        break
    except WebSocketDisconnect:
        user = sessions[fightId].find_user_from_ws(websocket)
        print("Client disconnected")
        try:
            sessions[fightId].remove_player_session(user)
        except Exception as e:
            print(f"Could not remove {user} from session {fightId}: {e}")


class CreateFightSessionBody(BaseModel):
    players_list: list[str]


@router.post(
    "/fight/create",
    status_code=status.HTTP_201_CREATED,
    description="Creates a session.",
)
async def create_session(body: CreateFightSessionBody):
    # check that all API values are present
    print("CALL ROUTE", body)
    if body.players_list is None:
        print("Missing players_list")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing players_list")

    print("CREATION DE LA NOUVELLE SESSION")
    newFightId = str(uuid.uuid4())[:8]
    while newFightId in sessions:
        newFightId = str(uuid.uuid4())[:8]

    sessions[newFightId] = FightSession(newFightId, [])

    return JSONResponse(
        content={"status": "success", "message": "Game created", "fightId": newFightId},
        media_type="application/json",
    )


async def get_json(websocket: WebSocket, data: str):
    """parses JSON received, or send an error event if it fails.

    Args:
        websocket (WebSocket): client websocket
        data (str): data to parse

    Returns:
        any | None: parsed data, or None if it failed.
    """
    try:
        json_obj = json.loads(data)
        return json_obj
    except json.JSONDecodeError:
        await websocket.send_text(build_json_event("error", {"message": "Invalid JSON"}))
        return None


def build_json_event(event_type, data):
    """Generate a string of a JSON websocket event

    Args:
        event_type (str): type
        data (any): dictionary of key values to be stringified

    Returns:
        str: stringified JSON
    """
    # print(data)
    obj = {key: value for key, value in data.items()}
    obj["type"] = event_type
    return json.dumps(obj)
