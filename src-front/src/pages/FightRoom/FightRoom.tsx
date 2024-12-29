import { useEffect, useState } from "react";
import WorldCloud from "../../components/WordCloud/WordCloud";
import { usePlayerInfo } from "../../hooks/usePlayerInfo";
import BasePage from "../../components/BasePage/BasePage";
import styles from "./FightRoom.module.css";

function FightRoom() {
  // const inputRef = useRef<HTMLInputElement>(null);
  const [fightId, setFightId] = useState<string>();
  const [userId, setUserId] = useState<string>();

  const userInfo = usePlayerInfo();
  useEffect(() => {
    setUserId(userInfo?.username ?? "");
  }, [userInfo]);

  useEffect(() => {
    const queryParameters = new URLSearchParams(window.location.search);
    setFightId(queryParameters.get("fightId") as string);
  }, [fightId, userId]);

  return (
    <BasePage bodyNamespace="fight">
      {userId == null || fightId == null ? (
        <div className={styles.loading}>Loading...</div>
      ) : (
        <WorldCloud userId={userId} fightId={fightId} />
      )}
    </BasePage>
  );
}

export default FightRoom;
