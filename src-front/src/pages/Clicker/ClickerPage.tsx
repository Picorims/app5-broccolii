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
import styles from "./ClickerPage.module.css";

import image1 from "../../assets/broccolii/broccolii(1).png";
import image2 from "../../assets/broccolii/broccolii(2).png";
import image3 from "../../assets/broccolii/broccolii(3).png";
import image4 from "../../assets/broccolii/broccolii(4).png";
import { API } from "../../lib/api";
import Button from "../../components/Button/Button";
import { useNavigate } from "react-router";

const ClickerPage = () => {
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

  //Initialization of the page
  useEffect(() => {
    async function getCurrentUserInfo() {
      const resp = await API.getCurrentUserInfo();
      if (resp.ok) {
        const data = await resp.json();
        console.log(data);
        username.current = data.username;
      }
    }

    getCurrentUserInfo();
  });

  // Function to switch to a random image (not the current one) when the button is clicked.
  const handleBroccoliiClick = () => {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * items.length);
    } while (items[randomIndex].id === currentItem.id); // Ensure it's not the current image.

    setCurrentItem(items[randomIndex]);

    API.patchClick(username.current);
  };

  const handleBoosterClick = () => {
    console.log("BoosterCard clicked!");
  };

  useEffect(() => {
    async function getCurrentUserInfo() {
      const resp = await API.getCurrentUserInfo();
      if (resp.ok) {
        const data = await resp.json();
        console.log(data);
      }
    }

    getCurrentUserInfo();
  });

  return (
    <>
      <div className={styles.container}>
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
    </>
  );
};

export default ClickerPage;
