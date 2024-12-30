/*
  Copyright (c) 2024 Charly Schmidt aka Picorims<picorims.contact@gmail.com>,
  Alexis Hu, Olivier Proquez, Arnaud Bulteau, Maxime Le Bot

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

import { useEffect, useRef, useState } from "react";
import BroccoliiButton from "../../components/BroccoliiButton/BroccoliiButton";
import BoosterCard from "../../components/BoosterCard/BoosterCard";
import ClickerHUD from "../../components/ClickerHUD/clickerHUD";
import styles from "./ClickerPage.module.css";

import image1 from "../../assets/broccolii/broccolii(1).png";
import image2 from "../../assets/broccolii/broccolii(2).png";
import image3 from "../../assets/broccolii/broccolii(3).png";
import image4 from "../../assets/broccolii/broccolii(4).png";
import { API } from "../../lib/api";
import Button from "../../components/Button/Button";
import { useNavigate } from "react-router";
import { usePlayerInfo } from "../../hooks/usePlayerInfo";
import BasePage from "../../components/BasePage/BasePage";

const ClickerPage = () => {
  const [statNbBroccos, setStatNbBroccos] = useState<number>(0);
  const [statClickrate, setStatClickrate] = useState<number>(0);

  // Array of objects representing images and their corresponding texts.
  const items = [
    { id: 1, image: image1, text: ": )" },
    { id: 2, image: image2, text: "> 0 <" },
    { id: 3, image: image3, text: '"Woof Woof" in broccolii' },
    { id: 4, image: image4, text: ".__." },
  ];

  const [currentItem, setCurrentItem] = useState(items[0]);
  const username = useRef<string>("");
  const navigate = useNavigate();

  // Function to switch to a random image (not the current one) when the button is clicked.
  const handleBroccoliiClick = async () => {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * items.length);
    } while (items[randomIndex].id === currentItem.id); // Ensure it's not the current image.

    setCurrentItem(items[randomIndex]);

    const resp = await API.patchClick(username.current);
    const respJson = await resp.json();
    console.log("respJson: ", respJson);
    setStatClickrate(respJson.broccolis);
  };

  const handleBoosterClick = () => {
    console.log("BoosterCard clicked!");
  };

  const userInfo = usePlayerInfo();
  useEffect(() => {
    username.current = userInfo?.username ?? "";
  });

  return (
    <BasePage bodyNamespace="clicker">
      <div className={styles.container}>
        <ClickerHUD
          statNbBroccos={statNbBroccos}
          statClickrate={statClickrate}
        />
        <h1>Page Clicker</h1>
        <BroccoliiButton
          image={currentItem.image}
          text={currentItem.text}
          onClick={handleBroccoliiClick}
        />

        <BoosterCard onClick={handleBoosterClick} />
      </div>
      <Button
        type="button"
        variant="primary"
        onClick={() => navigate("/lobby")}
      >
        Fight!
      </Button>
      {/* Example of how to change the displayed stats */}
      <Button
        type="button"
        variant="primary"
        onClick={() => {
          setStatNbBroccos(statNbBroccos + 10);
        }}
      >
        Change brocos
      </Button>
      <Button
        type="button"
        variant="primary"
        onClick={() => {
          setStatClickrate(statClickrate + 10);
        }}
      >
        Change rate
      </Button>
    </BasePage>
  );
};

export default ClickerPage;
