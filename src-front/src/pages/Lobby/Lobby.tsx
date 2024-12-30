import { useNavigate } from "react-router-dom";
import styles from "./Lobby.module.css";
import Card from "../../components/Card/Card";
import { useEffect, useState } from "react";
import { API } from "../../lib/api";
import { usePlayerInfo } from "../../hooks/usePlayerInfo";
import BasePage from "../../components/BasePage/BasePage";

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

  const userInfo = usePlayerInfo();
  useEffect(() => {
    console.log(userInfo); // This is here so that the linter doesn't complain
  }, [userInfo]);
  
  const createRoom = async () => {
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
      <div className={styles.mainContainer}>
        <Card>
          <h1>ENTER A ROOM</h1>
          <input
            type="text"
            className={styles.searchBar}
            id="joinFightId"
          />{" "}
          <button onClick={() => joinRoom()} className={styles.button}>
            Join !
          </button>
        </Card>
        <Card>
          <h1>CREATE A ROOM</h1>
          <div className={styles.horizontalDiv}>
            <h3>Room name :</h3>
            <input type="text" onInput={(e) => setRoomName(e.currentTarget.value)} />
          </div>
          <input type="checkbox" onChange={(e) => setFlagAllWords(e.currentTarget.checked)} />
          ALL WORDS
          <input type="checkbox" onChange={(e) => setFlagWordsStartingWithB(e.currentTarget.checked)} />
          WORD START WITH B
          <input type="checkbox" onChange={(e) => setFlagGreenThings(e.currentTarget.checked)}/>
          GREEN THINGS
          <input type="checkbox" onChange={(e) => setFlagAgriculture(e.currentTarget.checked)}/>
          AGRICULTURE
          <div className={styles.horizontalDiv}>
            <h3>Lobby duration:</h3>
            <input type="number" onInput={(e) => setLobbyDuration(parseInt(e.currentTarget.value))} />
          </div>
          <div className={styles.horizontalDiv}>
            <h3>Game duration:</h3>
            <input type="number" onInput={(e) => setGameDuration(parseInt(e.currentTarget.value))} />
          </div>
          <div className={styles.horizontalDiv}>
            <h3>Word count:</h3>
            <input type="number" onInput={(e) => setWordCount(parseInt(e.currentTarget.value))} />
          </div>
          <div className={styles.horizontalDiv}>
            <button onClick={() => createRoom()} className={styles.button}>
              JOIN ROOM
            </button>
          </div>
        </Card>
      </div>
    </BasePage>
  );
}
