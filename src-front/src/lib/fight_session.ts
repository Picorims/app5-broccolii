/*
  Copyright (c) 2024 Charly Schmidt aka Picorims<picorims.contact@gmail.com>,
  Alexis Hu, Olivier Proquez, Arnaud Bulteau, Maxime Le Bot

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

import { getEnv } from "../environment";
import { JsonLike, JsonObject } from "./types";

type ClientEvent = "requestGameState";
type ServerEvent = "sendGameState" | "error";
type EventType = ClientEvent | ServerEvent;

interface BaseEventParams {
    type: EventType;
    userID: string;
    fightID: string;
}

type RequestGameStateEvent = Record<string, never>; // empty

type Event<T> = T extends "requestGameState" ? RequestGameStateEvent : never;

interface ErrorResponse {
    message: string;
}

/**
 * Handles the backend communication for a fight session.
 */
export class FightSession {
    private userID: string;
    private fightID: string;
    private ws: WebSocket;
    private ready = false;
    private onError: (msg: string) => void = () => { };

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
        this.ws = new WebSocket(`${getEnv().backendWebSocketUrl}/api/v1/fight/${fightID}/ws`);
        this.ws.addEventListener("open", () => {
            this.ready = true;
            onReady();
        });
        this.ws.addEventListener("error", () => {
            console.error("Fight session closed unexpectedly.");
            this.ready = false;
        })
        this.ws.addEventListener("close", () => {
            console.info("Fight session closed.");
        })
        this.ws.addEventListener("message", (e) => {
            try {
                const json = JSON.parse(e.data);
                this.handleEvent(json);
            } catch {
                console.warn("Could not parse server event.", e.data);
            }
        })
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

    private sendEvent<T extends ClientEvent>(eventType: T, eventPayload: Event<T>) {
        this.assertReady();
        const event: BaseEventParams & Event<T> = {
            type: eventType,
            userID: this.userID,
            fightID: this.fightID,
            ...eventPayload
        }
        this.ws.send(JSON.stringify(event));
    }

    private handleEvent(event: JsonLike) {
        console.log("received", event);
        if (!event || typeof event !== "object") {
            throw new Error("Invalid data.");
        }
        const e = event as JsonObject
        if (!e["type"]) {
            throw new Error("No event type specified by the server in the received data.");
        }

        const eventType = e["type"] as ServerEvent;
        switch (eventType) {
            case "error": {
                const payload = e as unknown as ErrorResponse;
                this.onError(payload.message);
                break;
            }
        }
    }

    onErrorThen(f: (msg: string) => void) {
        this.onError = f;
    }

    close() {
        this.ws.close();
        this.ready = false;
    }
}