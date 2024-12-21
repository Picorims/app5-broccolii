import { useEffect, useRef } from "react";
import WorldCloud from "../../components/WordCloud/WordCloud";

function FightRoom() {
  const queryParameters = new URLSearchParams(window.location.search)
  const refFightId = useRef<string>("");
  const refUserId = useRef<string>("");

  useEffect(() => {
    refFightId.current = queryParameters.get("fightId") as string
    refUserId.current = queryParameters.get("userId") as string

    console.log("args : ", refFightId.current, refUserId.current);
    
    
  });

  return <WorldCloud 
  userId={refUserId.current}
  fightId={refFightId.current}/>;
}

export default FightRoom;
