/*
  Copyright (c) 2024 Charly Schmidt aka Picorims<picorims.contact@gmail.com>,
  Alexis Hu, Olivier Proquez, Arnaud Bulteau, Maxime Le Bot

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

import { getEnv } from "../environment";

export interface UserInfo {
  username: string;
}

// export interface FightConfig {

export interface WordFlags {
  all_words: boolean;
  words_starting_with_b: boolean;
  green_things: boolean;
  agriculture: boolean;
}

export interface FightSessionConfig {
  name: string;
  players_list: string[];
  word_count: number;
  lobby_duration_seconds: number;
  game_duration_seconds: number;
  word_flags: WordFlags;
}

/**
 * Contains static methods for interacting with the API.
 *
 * For details on the API, see the API documentation.
 */
export class API {
  public static register(login: string, password: string) {
    const url = `${getEnv().backendUrl}/api/v1/user/register`;
    console.log("[API] [POST] " + url);

    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: login,
        password: password,
      }),
    });
  }

  public static login(login: string, password: string) {
    const url = `${getEnv().backendUrl}/api/v1/user/login`;
    console.log("[API] [POST] " + url);

    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: login,
        password: password,
      }),
    });
  }

  public static authTest() {
    const url = `${getEnv().backendUrl}/api/v1/user/auth_test`;
    console.log("[API] [GET] " + url);

    return fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
  }

  public static async refreshToken(): Promise<boolean> {
    const url = `${getEnv().backendUrl}/api/v1/user/refresh_token`;
    console.log("[API] [GET] " + url);

    const resp = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("refresh_token")}`,
      },
    });

    if (resp.ok) {
      const json = await resp.json();
      localStorage.setItem("access_token", json.access_token);
      localStorage.setItem("refresh_token", json.refresh_token);
      return true;
    } else {
      return false;
    }
  }

  public static logout() {
    const url = `${getEnv().backendUrl}/api/v1/user/logout`;
    console.log("[API] [GET] " + url);

    fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }

  public static getCurrentUserInfo() {
    if (
      localStorage.getItem("access_token") === "undefined" ||
      localStorage.getItem("access_token") === null ||
      localStorage.getItem("access_token") === undefined
    ) {
      return Promise.resolve(null);
    }
    const url = `${getEnv().backendUrl}/api/v1/user/me`;
    console.log("[API] [GET] " + url);

    return fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
  }

  public static async createFight(config: FightSessionConfig) {
    const url = `${getEnv().backendUrl}/api/v1/fight/create`;

    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: JSON.stringify(config),
    });
  }

  public static patchClick(username: string) {
    const url = `${getEnv().backendUrl}/api/v1/user/click`;
    console.log("[API] [PATCH] " + url);

    return fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: JSON.stringify({
        username: username,
      }),
    });
  }

  public static async addCard(username: string, cardId: string) {
    const url = `${getEnv().backendUrl}/api/v1/card/add`;

    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        cardId: cardId,
      }),
    });
  }

  public static async equipCard(username: string, cardId: string) {
    const url = `${getEnv().backendUrl}/api/v1/card/equip`;

    return fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        cardId: cardId,
      }),
    });
  }

  public static async unequipCard(username: string, cardId: string) {
    const url = `${getEnv().backendUrl}/api/v1/card/unequip`;

    return fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        cardId: cardId,
      }),
    });
  }
}
