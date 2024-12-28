import { useNavigate } from "react-router-dom";
import styles from "./Lobby.module.css";
import Card from "../../components/Card/Card";
import { useEffect, useState } from "react";
import { API } from "../../lib/api";
import { usePlayerInfo } from "../../hooks/usePlayerInfo";

// import { getEnv } from "../../environment";

export default function Lobby() {
  const navigate = useNavigate();
  //const refLink = useRef<string>();
  const [fightId, setFightID] = useState<string>("");

  const userInfo = usePlayerInfo();
  useEffect(() => {
    console.log(userInfo); // This is here so that the linter doesn't complain
  }, [userInfo]);

  useEffect(() => {
    const initializeFight = async () => {
      const request = await API.createFight([]);
      const response = await request.json();
      setFightID(response["fightId"]);
    };

    initializeFight();
  }, []); // Empty dependency array means this effect runs once on mount

  const createRoom = async () => {
    navigate("/fight?fightId=" + fightId);
  };

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
            <input type="number" className={styles.input} />
          </div>
          <div className={styles.horizontalDiv}>
            <h3>Room link :</h3>
            <h3>{fightId}</h3>
          </div>
          <div className={styles.horizontalDiv}>
            <button onClick={() => createRoom()} className={styles.button}>
              JOIN ROOM
            </button>
          </div>
        </Card>
      </div>
    </>
  );
}
