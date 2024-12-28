/*
  Copyright (c) 2024 Charly Schmidt aka Picorims<picorims.contact@gmail.com>,
  Alexis Hu, Olivier Proquez, Arnaud Bulteau, Maxime Le Bot

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

import { getEnv } from "../environment";
import { JsonLike, JsonObject } from "./types";

type ClientEvent =
  | "requestGameState"
  | "submitLetter"
  | "submitEraseLetter"
  | "submit";
type ServerEvent =
  | "sendGameState"
  | "error"
  | "wordsFound"
  | "scoresUpdated"
  | "acknowledgeLetter"
  | "wonPrize"
  | "acknowledgeLetterErased"
  | "acknowledgeSubmit";
type EventType = ClientEvent | ServerEvent;

interface BaseEventParams {
  type: EventType;
  userID: string;
  fightID: string;
}

type RequestGameStateEvent = Record<string, never>; // empty
interface SubmitLetterEvent {
  letter: string;
}
type SubmitEraseLetterEvent = Record<string, never>; // empty
type SubmitEvent = Record<string, never>; // empty

type Event<T> = T extends "requestGameState"
  ? RequestGameStateEvent
  : T extends "submitLetter"
    ? SubmitLetterEvent
    : T extends "submitEraseLetter"
      ? SubmitEraseLetterEvent
      : T extends "submit"
        ? SubmitEvent
        : never;

interface ErrorResponse {
  message: string;
}

interface GameStateResponse {
  scores: Record<string, number>;
  availableWords: string[];
  wordsBestProgress: Record<string, number>;
  gameEndEpochMs: number;
  gameStartEpochMs: number;
  gameRunning: boolean;
}

interface AcknowledgeLetterResponse {
  accepted: boolean;
  currentState: string;
}

type AcknowledgeLetterErasedResponse = AcknowledgeLetterResponse;

interface AcknowledgeSubmitResponse {
  success: boolean;
  testedState: string;
}

interface WordsFoundResponse {
  words: string[];
}

interface scoresUpdatedResponse {
  scores: Record<string, number>;
}

/**
 * Handles the backend communication for a fight session.
 */
export class FightSession {
  private userID: string;
  private fightID: string;
  private ws: WebSocket;
  private ready = false;
  private onSendGameState: (state: GameStateResponse) => void = () => {};
  private onError: (msg: string) => void = () => {};
  private onWordsFound: (words: string[]) => void = () => {};
  private onScoresUpdated: (scores: Record<string, number>) => void = () => {};
  private onAcknowledgeLetter: (
    accepted: boolean,
    currentState: string,
  ) => void = () => {};
  private onAcknowledgeLetterErased: (
    accepted: boolean,
    currentState: string,
  ) => void = () => {};
  private onAcknowledgeSubmit: (success: boolean, testedState: string) => void =
    () => {};
  private onPrizeReceived: (prize: unknown /*TODO define*/) => void = () => {};

  /**
   * Open the connection.
   * Any call to functions before the socket is ready will throw an error.
   *
   * @param userID
   * @param fightID
   * @param onReady called once the session is opened.
   */
  constructor(userID: string, fightID: string, onReady: () => void) {
    this.userID = userID;
    this.fightID = fightID;
    this.ws = new WebSocket(
      `${getEnv().backendWebSocketUrl}/api/v1/fight/${fightID}/ws`,
    );
    this.ws.addEventListener("open", () => {
      this.ready = true;
      onReady();
    });
    this.ws.addEventListener("error", () => {
      console.error("Fight session closed unexpectedly.");
      this.ready = false;
    });
    this.ws.addEventListener("close", () => {
      console.info("Fight session closed.");
    });
    this.ws.addEventListener("message", (e) => {
      try {
        const json = JSON.parse(e.data);
        this.handleEvent(json);
      } catch {
        console.warn("Could not parse server event.", e.data);
      }
    });
  }

  /**
   * Synchronize the local state with the server state (which is the truth).
   * Must be called at least once at initialization.
   */
  requestGameState() {
    this.sendEvent("requestGameState", {});
  }

  private assertReady() {
    if (!this.ready) {
      throw new Error("WebSocket not ready");
    }
  }

  private sendEvent<T extends ClientEvent>(
    eventType: T,
    eventPayload: Event<T>,
  ) {
    this.assertReady();
    const event: BaseEventParams & Event<T> = {
      type: eventType,
      userID: this.userID,
      fightID: this.fightID,
      ...eventPayload,
    };
    this.ws.send(JSON.stringify(event));
  }

  private handleEvent(event: JsonLike) {
    if (!event || typeof event !== "object") {
      throw new Error("Invalid data.");
    }
    const e = event as JsonObject;
    if (!e["type"]) {
      throw new Error(
        "No event type specified by the server in the received data.",
      );
    }

    const eventType = e["type"] as ServerEvent;
    switch (eventType) {
      case "error": {
        const payload = e as unknown as ErrorResponse;
        this.onError(payload.message);
        break;
      }
      case "sendGameState": {
        const payload = e as unknown as GameStateResponse;
        this.onSendGameState(payload);
        break;
      }
      case "wordsFound": {
        const payload = e as unknown as WordsFoundResponse;
        this.onWordsFound(payload.words);
        break;
      }
      case "scoresUpdated": {
        const payload = e as unknown as scoresUpdatedResponse;
        this.onScoresUpdated(payload.scores);
        break;
      }
      case "acknowledgeLetter": {
        const payload = e as unknown as AcknowledgeLetterResponse;
        this.onAcknowledgeLetter(payload.accepted, payload.currentState);
        break;
      }
      case "acknowledgeLetterErased": {
        const payload = e as unknown as AcknowledgeLetterErasedResponse;
        this.onAcknowledgeLetterErased(payload.accepted, payload.currentState);
        break;
      }
      case "acknowledgeSubmit": {
        const payload = e as unknown as AcknowledgeSubmitResponse;
        this.onAcknowledgeSubmit(payload.success, payload.testedState);
        break;
      }
      case "wonPrize": {
        this.onPrizeReceived(e);
        break;
      }
      default: {
        console.warn("Unknown event type", eventType);
      }
    }
  }

  onSendGameStateThen(f: (state: GameStateResponse) => void) {
    this.onSendGameState = f;
  }
  onErrorThen(f: (msg: string) => void) {
    this.onError = f;
  }
  onWordsFoundThen(f: (words: string[]) => void) {
    this.onWordsFound = f;
  }
  onScoresUpdatedThen(f: (scores: Record<string, number>) => void) {
    this.onScoresUpdated = f;
  }
  onAcknowledgeLetterThen(
    f: (accepted: boolean, currentState: string) => void,
  ) {
    this.onAcknowledgeLetter = f;
  }
  onAcknowledgeLetterErasedThen(
    f: (accepted: boolean, currentState: string) => void,
  ) {
    this.onAcknowledgeLetterErased = f;
  }
  onAcknowledgeSubmitThen(f: (success: boolean, testedState: string) => void) {
    this.onAcknowledgeSubmit = f;
  }
  onPrizeReceivedThen(f: (prize: unknown /*TODO define*/) => void) {
    this.onPrizeReceived = f;
  }

  submitLetter(letter: string) {
    if (letter.length !== 1) {
      throw new Error("Invalid letter (only one character is allowed).");
    }
    this.sendEvent("submitLetter", { letter: letter });
  }
  submitEraseLetter() {
    this.sendEvent("submitEraseLetter", {});
  }
  submitWord() {
    this.sendEvent("submit", {});
  }

  close() {
    this.ws.close();
    this.ready = false;
  }
}
