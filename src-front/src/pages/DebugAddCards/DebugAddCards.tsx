import { API } from "../../lib/api";
import styles from "./DebugAddCards.module.css";

export default function DebugAddCards() {
  async function obtainCard() {
    const inputName = document.getElementById(
      "obtainInputUsername",
    ) as HTMLInputElement;
    const inputCard = document.getElementById(
      "obtainInputCard",
    ) as HTMLInputElement;
    const username = inputName.value;
    const cardId = inputCard.value;

    const res = await API.addCard(username, cardId);
    const ress = await res.json();
    console.log(ress);
  }

  async function equipCard() {
    const inputName = document.getElementById(
      "equipInputUsername",
    ) as HTMLInputElement;
    const inputCard = document.getElementById(
      "equipInputCard",
    ) as HTMLInputElement;
    const username = inputName.value;
    const cardId = inputCard.value;

    const res = await API.equipCard(username, cardId);
    const ress = await res.json();
    console.log(ress);
  }

  async function unequipCard() {
    const inputName = document.getElementById(
      "unequipInputUsername",
    ) as HTMLInputElement;
    const inputCard = document.getElementById(
      "unequipInputCard",
    ) as HTMLInputElement;
    const username = inputName.value;
    const cardId = inputCard.value;

    const res = await API.unequipCard(username, cardId);
    const ress = await res.json();
    console.log(ress);
  }

  return (
    <div className={styles.tout}>
      <div>
        <h2>Obtain card</h2>
        <input type="text" id="obtainInputUsername" />
        <input type="number" id="obtainInputCard" />
        <button onClick={() => obtainCard()}>obtain a card</button>
      </div>

      <div>
        <h2>Equip card</h2>
        <input type="text" id="equipInputUsername" />
        <input type="number" id="equipInputCard" />
        <button onClick={() => equipCard()}>equip a card</button>
      </div>

      <div>
        <h2>Unequip card</h2>
        <input type="text" id="unequipInputUsername" />
        <input type="number" id="unequipInputCard" />
        <button onClick={() => unequipCard()}>unequip a card</button>
      </div>
    </div>
  );
}
