import { useEffect, useState } from "react";
import WorldCloud from "../../components/WordCloud/WordCloud";

function FightRoom() {
  const queryParameters = new URLSearchParams(window.location.search)
  const [fightId, setFightId] = useState<string>();
  const [userId, setUserId] = useState<string>();

  useEffect(() => {
    setFightId(queryParameters.get("fightId") as string)
    setUserId(queryParameters.get("userId") as string)
  }, [fightId, userId]);

  if (userId == null || fightId == null) {
    return <div>Loading...</div>
  }
  return <WorldCloud userId={userId} fightId={fightId}/>;
}

export default FightRoom;
