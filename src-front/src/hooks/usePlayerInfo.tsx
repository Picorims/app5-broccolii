/*
  Copyright (c) 2024 Charly Schmidt aka Picorims<picorims.contact@gmail.com>,
  Alexis Hu, Olivier Proquez, Arnaud Bulteau, Maxime Le Bot

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { API, UserInfo } from "../lib/api";

/**
 * Hook that fetches the API for user info. Redirects to login if not logged in.
 * @returns the current user info
 */
export function usePlayerInfo() {
  const [userInfo, setUserInfo] = useState<null | UserInfo>(null);
  const navigate = useNavigate();
  useEffect(() => {
    async function getCurrentUserInfo() {
      if (localStorage.getItem("refresh_token") === null) {
        navigate("/login");
        return;
      }

      const refresh_token_expire = localStorage.getItem("refresh_token_expire");
      if (refresh_token_expire === null) {
        navigate("/login");
        return;
      }

      const expire_date = new Date(parseFloat(refresh_token_expire));
      const now = new Date();

      if (now > expire_date) {
        navigate("/login");
        return;
      }

      const resp = await API.getCurrentUserInfo();
      if (resp === null) {
        navigate("/login");
      } else if (resp.ok) {
        const data = await resp.json();
        setUserInfo(data);
      }
    }

    getCurrentUserInfo();
  }, [navigate]);
  return userInfo;
}
