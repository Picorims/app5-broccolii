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
    const [scores, setScores] = useState<Record<string, number>>({});
    const [availableWords, setAvailableWords] = useState<string[]>([]);
    const [wordsBestProgress, setWordsBestProgress] = useState<Record<string, number>>({});
    const [gameEndEpoch, setGameEndEpoch] = useState(0);

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
        });
        session.onSendGameStateThen((state) => {
            console.log("Received state", state);
            setScores(state.scores);
            setAvailableWords(state.availableWords);
            setWordsBestProgress(state.wordsBestProgress);
            setGameEndEpoch(state.gameEndEpoch);
        });
        session.onAcknowledgeLetterThen((accepted, currentState) => {
            console.log("Letter acknowledged", accepted, currentState);
        });
        session.onAcknowledgeLetterErasedThen((accepted, currentState) => {
            console.log("Letter erased acknowledged", accepted, currentState);
        });
        session.onAcknowledgeSubmitThen((success, testedState) => {
            console.log("Submit acknowledged", success, testedState);
        });
        session.onWordsFoundThen((words) => {
            console.log("Words found", words);
        });
        session.onScoresUpdatedThen((scores) => {
            console.log("Scores updated", scores);
        });

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
        <p>
            Scores: {JSON.stringify(scores)}
        </p>
        <p>
            Available words: {availableWords.join(", ")}
        </p>
        <p>
            Words best progress: {JSON.stringify(wordsBestProgress)}
        </p>
        <p>
            Game end epoch: {gameEndEpoch}
        </p>
    </div>
};
