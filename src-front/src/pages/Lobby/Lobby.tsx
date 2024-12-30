import { useNavigate } from "react-router-dom";
import styles from "./Lobby.module.css";
import Card from "../../components/Card/Card";
import { useEffect, useState } from "react";
import { API } from "../../lib/api";
import { usePlayerInfo } from "../../hooks/usePlayerInfo";
import BasePage from "../../components/BasePage/BasePage";
import Button from "../../components/Button/Button";
import LabeledInput from "../../components/LabeledInput/LabeledInput";

// import { getEnv } from "../../environment";

export default function Lobby() {
  const navigate = useNavigate();
  const [flagAllWords, setFlagAllWords] = useState(true);
  const [flagWordsStartingWithB, setFlagWordsStartingWithB] = useState(false);
  const [flagGreenThings, setFlagGreenThings] = useState(false);
  const [flagAgriculture, setFlagAgriculture] = useState(false);
  const [lobbyDuration, setLobbyDuration] = useState(60);
  const [gameDuration, setGameDuration] = useState(60);
  const [wordCount, setWordCount] = useState(200);
  const [roomName, setRoomName] = useState("");
  const LOBBY_DURATION_MIN = 10;
  const GAME_DURATION_MIN = 10;
  const WORD_COUNT_MIN = 1;

  const userInfo = usePlayerInfo();
  useEffect(() => {
    console.log(userInfo); // This is here so that the linter doesn't complain
  }, [userInfo]);

  useEffect(() => {
    if (
      flagAgriculture &&
      flagGreenThings &&
      flagWordsStartingWithB &&
      flagAllWords
    ) {
      setFlagAllWords(() => true);
      setFlagAgriculture(() => false);
      setFlagGreenThings(() => false);
      setFlagWordsStartingWithB(() => false);
    } else if (
      flagAllWords &&
      (flagAgriculture || flagGreenThings || flagWordsStartingWithB)
    ) {
      setFlagAllWords(() => false);
    }
  }, [flagAllWords, flagAgriculture, flagGreenThings, flagWordsStartingWithB]);

  const createRoom = async () => {
    if (
      !flagAllWords &&
      !flagWordsStartingWithB &&
      !flagGreenThings &&
      !flagAgriculture
    ) {
      alert("Please select at least one word category.");
      return;
    }

    if (lobbyDuration < LOBBY_DURATION_MIN) {
      alert(`Lobby duration must be at least ${LOBBY_DURATION_MIN} seconds.`);
      return;
    }
    if (gameDuration < GAME_DURATION_MIN) {
      alert(`Game duration must be at least ${GAME_DURATION_MIN} seconds.`);
      return;
    }
    if (wordCount < WORD_COUNT_MIN) {
      alert(`Word count must be at least ${WORD_COUNT_MIN}.`);
      return;
    }

    const request = await API.createFight({
      name: roomName,
      players_list: [],
      game_duration_seconds: gameDuration,
      lobby_duration_seconds: lobbyDuration,
      word_count: wordCount,
      word_flags: {
        all_words: flagAllWords,
        words_starting_with_b: flagWordsStartingWithB,
        green_things: flagGreenThings,
        agriculture: flagAgriculture,
      },
    });
    if (!request.ok || request.status >= 400) {
      console.error("Error creating room");
      alert("Error creating room, your session may have expired.");
      return;
    }
    const response = await request.json();
    navigate("/fight?fightId=" + response["fightId"]);
  };

  const joinRoom = async () => {
    const input = document.getElementById("joinFightId") as HTMLInputElement;
    const fightIdJoin = input.value;
    //TODO check if the room exists before trying to join it

    navigate("/fight?fightId=" + fightIdJoin);
  };

  return (
    <BasePage bodyNamespace="lobby">
      <h1>Fight lobby</h1>
      <div className={styles.mainContainer}>
        <Card>
          <h2>ENTER A ROOM</h2>
          <LabeledInput label="Room ID" type="text" id="joinFightId" />
          <Button type="button" variant="secondary" onClick={() => joinRoom()}>
            JOIN!
          </Button>
        </Card>
        <Card>
          <h2>CREATE A ROOM</h2>
          <LabeledInput
            label="Room name"
            type="text"
            value={roomName}
            onInput={(e) => setRoomName(e.currentTarget.value)}
          />
          <fieldset>
            <legend>Enabled words</legend>
            <LabeledInput
              label="All words"
              type="checkbox"
              checked={flagAllWords}
              onChange={(e) => setFlagAllWords(e.currentTarget.checked)}
            />
            <LabeledInput
              label="Words starting with B"
              type="checkbox"
              checked={flagWordsStartingWithB}
              onChange={(e) =>
                setFlagWordsStartingWithB(e.currentTarget.checked)
              }
            />
            <LabeledInput
              label="Green things"
              type="checkbox"
              checked={flagGreenThings}
              onChange={(e) => setFlagGreenThings(e.currentTarget.checked)}
            />
            <LabeledInput
              label="Agriculture"
              type="checkbox"
              checked={flagAgriculture}
              onChange={(e) => setFlagAgriculture(e.currentTarget.checked)}
            />
          </fieldset>
          <LabeledInput
            label="Lobby duration"
            type="number"
            min={LOBBY_DURATION_MIN.toString()}
            value={lobbyDuration}
            onInput={(e) => setLobbyDuration(parseInt(e.currentTarget.value))}
          />
          <LabeledInput
            label="Game duration"
            type="number"
            min={GAME_DURATION_MIN.toString()}
            value={gameDuration}
            onInput={(e) => setGameDuration(parseInt(e.currentTarget.value))}
          />
          <LabeledInput
            label="Word count"
            type="number"
            min={WORD_COUNT_MIN.toString()}
            value={wordCount}
            onInput={(e) => setWordCount(parseInt(e.currentTarget.value))}
          />
          <Button type="button" variant="primary" onClick={() => createRoom()}>
            CREATE ROOM
          </Button>
        </Card>
      </div>
    </BasePage>
  );
}
