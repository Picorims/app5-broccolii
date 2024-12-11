/*
  Copyright (c) 2024 Charly Schmidt aka Picorims<picorims.contact@gmail.com>,
  Alexis Hu, Olivier Proquez, Arnaud Bulteau, Maxime Le Bot

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

export class WebSocketConnection {
  private ws: WebSocket;
  private ready = false;
  constructor() {
    this.ws = new WebSocket(`ws://localhost:8000/api/v1/ws`);
    this.ws.onmessage = (e) => {
      console.log("message received: ", e.data);
    };
    this.ws.onopen = () => {
      console.log("connection opened");
      this.ready = true;
    };
    this.ws.onclose = () => {
      console.log("connection closed");
      this.ready = false;
    };
    this.ws.onerror = (e) => {
      console.error("connection error: ", e);
    };
  }
  sendMessage(message: string) {
    if (!this.ready) {
      console.error("connection not ready");
      return;
    }
    this.ws.send(message);
  }
  close() {
    this.ws.close();
  }
}
