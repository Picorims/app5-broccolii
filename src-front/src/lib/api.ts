/*
  Copyright (c) 2024 Charly Schmidt aka Picorims<picorims.contact@gmail.com>,
  Alexis Hu, Olivier Proquez, Arnaud Bulteau, Maxime Le Bot

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

import { getEnv } from "../environment";


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
}