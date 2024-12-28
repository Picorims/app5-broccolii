import { useEffect, useState } from "react";
import WorldCloud from "../../components/WordCloud/WordCloud";
import { usePlayerInfo } from "../../hooks/usePlayerInfo";

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

  if (userId == null || fightId == null) {
    return <div>Loading...</div>;
  }
  return <WorldCloud userId={userId} fightId={fightId} />;
}

export default FightRoom;
