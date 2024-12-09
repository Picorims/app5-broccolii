/*
  Copyright (c) 2024 Charly Schmidt aka Picorims<picorims.contact@gmail.com>,
  Alexis Hu, Olivier Proquez, Arnaud Bulteau, Maxime Le Bot

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import FightRoom from "./pages/FightRoom/FightRoom";
import LoginPage from "./pages/Login/LoginPage";
import ClickerPage from "./pages/Clicker/ClickerPage";
import TempWebSocketFight from "./pages/TempWebSocketFight/TempWebSocketFight";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/about",
    element: <h1>About</h1>,
  },
  {
    path: "/fight",
    element: <FightRoom />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/clicker",
    element: <ClickerPage />,
  },
  {
    path: "/ws",
    element: <TempWebSocketFight />,
  },
]);
