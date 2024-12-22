import { useNavigate } from 'react-router-dom';
import styles from "./Lobby.module.css";
import Card from '../../components/Card/Card';
import { useState } from 'react';

import { getEnv } from "../../environment";

export default function Lobby() {
  const navigate = useNavigate();
  //const refLink = useRef<string>();
  const [fightID, setFightID] = useState<string>("");
  const [userID, setUserID] = useState<string>("");
  
  const createRoom = () => {
    const newId = Math.random().toString(36).substring(2,7); /* random id generator */
    setFightID(newId)
  }
  
  const createRoomDebug = async () => {
    const debugFightIdInput = document.getElementById('debugFightId') as HTMLInputElement; // Type assertion
    const debugFightId = debugFightIdInput?.value;
    setFightID(debugFightId)

    const debugUserIdInput = document.getElementById('debugUserId') as HTMLInputElement; // Type assertion
    const debugUserId = debugUserIdInput?.value;
    setUserID(debugUserId)

    //create the room
    /* const url = `${getEnv().backendUrl}/api/v1/fight/create`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: ""
    });
    console.log("response :", response); */

    //I want the next part of the code to be executed only when the first part is finished (async)
    
    

    //afterwards, join the room
    navigate('/fight?fightId=' + debugFightId + "&userId=" + debugUserId);
  }

  const joinRoom = () => {
    console.log("test");
    
  }

  return <>
    <div className={styles.mainContainer}>
      <Card>
        <h1>ENTER A ROOM</h1>
        <input type="text" className={styles.searchBar}/> {/*placeholder for a searchbar*/}
      </Card>
      <Card>
        <h1>CREATE A ROOM</h1>
        <div className={styles.horizontalDiv}>
          <h3>Room name :</h3>
          <input type="text"/>
        </div>
        <input type="checkbox"/>ALL WORDS
        <input type="checkbox"/>WORD START WITH B
        <input type="checkbox"/>GREEN THINGS
        <input type="checkbox"/>VEGETABLES
        <div className={styles.horizontalDiv}>
          <h3>Timer :</h3>
          <input type="number"/>
        </div>
        <div className={styles.horizontalDiv}>
          <h3>Max players :</h3>
          <input type="number"/>
        </div>
        <div className={styles.horizontalDiv}>
          <h3>Room link :</h3>
          <h3>{fightID}</h3>
        </div>
        <div className={styles.tempDebug}>
          <input type="text" id="debugFightId" />fightId
          <input type="text" id="debugUserId" />userId
          <button onClick={() => createRoomDebug()}></button>
        </div>
        
      </Card>
    </div>
  </>
}