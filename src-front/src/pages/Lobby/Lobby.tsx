import { useNavigate } from "react-router-dom";
import styles from "./Lobby.module.css";
import Card from "../../components/Card/Card";
import { useEffect } from "react";
import { API } from "../../lib/api";
import { usePlayerInfo } from "../../hooks/usePlayerInfo";
import BasePage from "../../components/BasePage/BasePage";

// import { getEnv } from "../../environment";

export default function Lobby() {
  const navigate = useNavigate();

  const userInfo = usePlayerInfo();
  useEffect(() => {
    console.log(userInfo); // This is here so that the linter doesn't complain
  }, [userInfo]);
  
  const createRoom = async () => {
    const request = await API.createFight([]);
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
            <input type="text" />
          </div>
          <input type="checkbox" />
          ALL WORDS
          <input type="checkbox" />
          WORD START WITH B
          <input type="checkbox" />
          GREEN THINGS
          <input type="checkbox" />
          VEGETABLES
          <div className={styles.horizontalDiv}>
            <h3>Timer :</h3>
            <input type="number" />
          </div>
          <div className={styles.horizontalDiv}>
            <h3>Max players :</h3>
            <input type="number" className={styles.input} />
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
