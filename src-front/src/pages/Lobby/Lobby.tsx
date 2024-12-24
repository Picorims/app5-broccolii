import { useNavigate } from "react-router-dom";
import styles from "./Lobby.module.css";
import Card from "../../components/Card/Card";
import { useState } from "react";
import { API } from "../../lib/api";

// import { getEnv } from "../../environment";

export default function Lobby() {
  const navigate = useNavigate();
  //const refLink = useRef<string>();
  const [fightID, setFightID] = useState<string>("");
  const [userID, setUserID] = useState<string>("");

  // const createRoom = () => {
  //   const newId = Math.random().toString(36).substring(2,7); /* random id generator */
  //   setFightID(newId)
  // }

  const createRoomDebug = async () => {
    const debugFightIdInput = document.getElementById(
      "debugFightId",
    ) as HTMLInputElement; // Type assertion
    const debugFightId = debugFightIdInput?.value;
    setFightID(debugFightId);

    const debugUserIdInput = document.getElementById(
      "debugUserId",
    ) as HTMLInputElement; // Type assertion
    const debugUserId = debugUserIdInput?.value;
    setUserID(debugUserId);
    console.log(userID);

    const response = await API.createFight([]);

    const res = await response.json();
    console.log("response :", res);

    navigate("/fight?fightId=" + res["fightId"] + "&userId=" + debugUserId);
  };

  // const joinRoom = () => {
  //   console.log("test");

  // }

  return (
    <>
      <div className={styles.mainContainer}>
        <Card>
          <h1>ENTER A ROOM</h1>
          <input type="text" className={styles.searchBar} />{" "}
          {/*placeholder for a searchbar*/}
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
            <input type="number" />
          </div>
          <div className={styles.horizontalDiv}>
            <h3>Room link :</h3>
            <h3>{fightID}</h3>
          </div>
          <div className={styles.tempDebug}>
            <input type="text" id="debugFightId" />
            fightId
            <input type="text" id="debugUserId" />
            userId
            <button onClick={() => createRoomDebug()}></button>
          </div>
        </Card>
      </div>
    </>
  );
}
