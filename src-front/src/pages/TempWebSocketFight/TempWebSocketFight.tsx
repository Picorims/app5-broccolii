/*
  Copyright (c) 2024 Charly Schmidt aka Picorims<picorims.contact@gmail.com>,
  Alexis Hu, Olivier Proquez, Arnaud Bulteau, Maxime Le Bot

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

import { useEffect, useRef, useState } from "react"
import { FightSession } from "../../lib/fight_session"

export default function TempWebSocketFight() {
    const fightSession = useRef<FightSession | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        setError("");
        console.log("Initializing session...");
        fightSession.current = new FightSession("alice", "test", () => {
            console.log("WebSocket open. Getting state...");
            fightSession.current?.requestGameState();
        });

        const session = fightSession.current;
        session.onErrorThen((err) => {
            setError(err);
        })

        return () => {
            fightSession.current?.close();
        }
    }, [error]);

    return <div>
        <h1>WebSocket Testing (temporary)</h1>
        {error !== "" && <div>
            <h2>Error</h2>
            <p>{error}</p>
        </div>}
    </div>
};
