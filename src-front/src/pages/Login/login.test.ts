/*
  Copyright (c) 2024 Charly Schmidt aka Picorims<picorims.contact@gmail.com>,
  Alexis Hu, Olivier Proquez, Arnaud Bulteau, Maxime Le Bot

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

import { API } from "../../lib/api";

// ASSUMING THE USER IS LOGGED IN
// Automated tests are currently not in place.
// Copy the following snippet after the login function succeeds.

// testing login
const resp = await API.authTest();
if (resp.ok) {
  console.log("Login test successful");
  console.log(await resp.text());

  console.log("Testing timeout with 1min access token");
  setTimeout(async () => {
    // testing timeout with 1min access token
    const resp = await API.authTest();
    console.log(resp.ok);

    //testing refresh token
    if (!resp.ok) {
      console.log("Testing refresh token");
      const success = await API.refreshToken();
      if (success) {
        console.log("Refresh token successful");
        console.log("test auth again.");
        const resp = await API.authTest();
        console.log(resp.ok);
        if (resp.ok) {
          console.log("testing logout");
          await API.logout();
          const resp = await API.authTest();
          console.log(resp.ok);
          if (!resp.ok) {
            console.log("Logout successful");
            console.log("ensure refresh token is invalid");
            const success = await API.refreshToken();
            console.log(success);
            if (!success) {
              console.log("Refresh token invalidation successful");
            }
          }
        }
      }
    }
  }, 1000 * 61);
}
