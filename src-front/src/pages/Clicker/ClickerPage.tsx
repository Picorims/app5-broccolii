/*
  Copyright (c) 2024 Charly Schmidt aka Picorims<picorims.contact@gmail.com>,
  Alexis Hu, Olivier Proquez, Arnaud Bulteau, Maxime Le Bot

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/


import React, { useState } from 'react';
import BroccoliiButton from "../../components/BroccoliiButton/BroccoliiButton";
import styles from './ClickerPage.module.css';

import image1 from "../../assets/broccolii/image1.png";
import image2 from "../../assets/broccolii/image2.png";
import image3 from "../../assets/broccolii/image3.png";

const ClickerPage = () => {

  // Array of objects representing images and their corresponding texts.
  const items = [
    { id: 1, image: image1, text: 'Texte pour image 1' },
    { id: 2, image: image2, text: 'Texte pour image 2' },
    { id: 3, image: image3, text: 'Texte pour image 3' },
  ];

  const [currentItem, setCurrentItem] = useState(items[0]);

  // Function to switch to the next image when the button is clicked.
  const handleClick = () => {
    setCurrentItem((prevItem) => {
      const nextIndex = (prevItem.id % items.length);
      return items[nextIndex];
    });
  };

  return (
    <div className={styles.container}>
      <h1>Page Clicker</h1>
      <BroccoliiButton image={currentItem.image} text={currentItem.text} onClick={handleClick} />
    </div>
  );
};

export default ClickerPage;
