"""
Copyright (c) 2024 Charly Schmidt aka Picorims<picorims.contact@gmail.com>,
Alexis Hu, Olivier Proquez, Arnaud Bulteau, Maxime Le Bot

This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at http://mozilla.org/MPL/2.0/.
"""

import json
import time
from fastapi import APIRouter, WebSocket, WebSocketDisconnect


router = APIRouter()

sessions = {}

class FightSession():
    def __init__(self, fight_id, player_list):
        self._fight_id = fight_id
        self._players = [player for player in player_list]
        self._players_sessions = {}
        self._scores = {player: 0 for player in player_list}
        self._words_to_find = ["word", "broccoli", "tomato", "bee", "beekeeper"]
        self._words_found = []
        self._word_best_progress = {}
        self._game_end_epoch = int(time.time() + 60)
    
    def add_player_session(self, session: WebSocket, name: str):
        if name in self._players_sessions:
            raise Exception("This player already has a session.")
        self._players_sessions[name] = session
        
    def remove_player_session(self, name):
        if name not in self._players_sessions:
            raise Exception("This player does not have a session.")
        self._players_sessions.pop(name, None)
        
    async def handle_event(self, event, websocket: WebSocket):
        if f"type" not in event:
            raise Exception("Non existent type.")
        if f"fightID" not in event:
            raise Exception("Missing fight ID")
        if f"userID" not in event:
            raise Exception("Missing userID")
        
        if not event["fightID"] == self._fight_id:
            await self._send_error_event(websocket, "Non matching fight session.")
            await websocket.close()
            return
        if event["userID"] not in self._players:
            await self._send_error_event(websocket, "Player not in fight session.")
            await websocket.close()
            return
        
        if event["type"] == "requestGameState":
            await self._handle_request_game_state(websocket)
            
    async def _handle_request_game_state(self, websocket: WebSocket):
        state = {}    
        state["scores"] = {player: score for player, score in self._scores.items()}
        state["availableWords"] = [word for word in self._words_to_find]
        state["wordsBestProgress"] = {word: progress for word, progress in self._word_best_progress.items()}
        state["gameEndEpoch"] = self._game_end_epoch
        
        await websocket.send_text(build_json_event("sendGameState", state))
        
    async def _send_error_event(self, websocket: WebSocket, msg: str):
        response = {}
        response["message"] = msg
        event = build_json_event("error", response)
        await websocket.send_text(event)
            
    
        
sessions["test"] = FightSession("test", ["alice", "bob"])
        
@router.websocket("/fight/{fightId}/ws")
async def websocket_endpoint(fightId, websocket: WebSocket):
    await websocket.accept()
    user = None
    try:
        while True:
            data = await websocket.receive_text()
            data_obj = await get_json(websocket, data)
            if not data_obj is None:
                if fightId not in sessions:
                    print(f"Session {fightId} does not exist.")
                    payload = {}
                    payload["message"] = "Session does not exist."
                    await websocket.send_text(build_json_event("error", payload))
                    await websocket.close()
                    break
                else:    
                    await sessions[fightId].handle_event(data_obj, websocket)
    except WebSocketDisconnect:
        print("Client disconnected")
        try:
            sessions[fightId].remove_player_session(user)
        except Exception as e:
            print(f"Could not remove {user} from session {fightId}: {e}")

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
    print(data)
    obj = {key: value for key, value in data.items()}
    obj["type"] = event_type
    return json.dumps(obj)