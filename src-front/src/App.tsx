/*
  Copyright (c) 2024 Charly Schmidt aka Picorims<picorims.contact@gmail.com>,
  Alexis Hu, Olivier Proquez, Arnaud Bulteau, Maxime Le Bot

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

import { useEffect } from "react";
import "./App.css";
import { useNavigate } from "react-router";

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/login");
  });

  return <div></div>;
}

export default App;
