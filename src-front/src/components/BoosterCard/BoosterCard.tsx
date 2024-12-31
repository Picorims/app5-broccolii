import React, { useState } from "react";
import styles from "./BoosterCard.module.css";

import beetrootImage from "../../assets/boosterCard/beetroot.png";
import butternutImage from "../../assets/boosterCard/butternut.png";
import carrotImage from "../../assets/boosterCard/carrot.png";
import eggplantImage from "../../assets/boosterCard/eggplant.png";
import farmerImage from "../../assets/boosterCard/farmer.png";
import soilbagImage from "../../assets/boosterCard/soilbag.png";

import emptyCardImage from "../../assets/boosterCard/empty_card.png";

import beetrootStatsImage from "../../assets/boosterCard/beetroot_stats.png";
import butternutStatsImage from "../../assets/boosterCard/butternut_stats.png";
import carrotStatsImage from "../../assets/boosterCard/carrot_stats.png";

import { API } from "../../lib/api";

interface BoosterCardProps {
  onClick: () => void;
  username: string;
}

const BoosterCard: React.FC<BoosterCardProps> = ({ username }) => {
  // Constants for image mapping
  const CARD_NAME_AND_IMAGE_MAP = {
    butternut: butternutImage,
    beetroot: beetrootImage,
    carrot: carrotImage,
    eggplant: eggplantImage,
    farmer: farmerImage,
    soilbag: soilbagImage,
  };

  let owned_cards = {};

  const STATS_MAP = {
    [butternutImage]: butternutStatsImage,
    [beetrootImage]: beetrootStatsImage,
    [carrotImage]: carrotStatsImage,
  };

  const [visibleStats, setStatsVisible] = useState<string | null>(null); // Show or Hide stats
  const [animating, setAnimating] = useState<boolean>(false); // Show and Hide stats animations

  // State to manage the current images for each card
  const initialImages = {
    booster1: emptyCardImage,
    booster2: emptyCardImage,
    booster3: emptyCardImage,
  };

  const [cardImages, setCardImages] = useState<{ [key: string]: string }>(
    initialImages,
  );

  // Manage dropdown visibility for each card
  const [dropdownVisible, setDropdownVisible] = useState<{
    [key: string]: boolean;
  }>({
    booster1: false,
    booster2: false,
    booster3: false,
  });

  const handleImageClick = async (cardName: string) => {
    console.log("Clicked Equip Slot", cardName);
    // If the clicked image is emptyCardImage, show dropdown to choose an image
    if (cardImages[cardName] === emptyCardImage) {
      const resp = await API.getCards(username);
      const respJson = await resp.json();
      console.log("Equip Slot respJson: ", respJson.cards_owned_ids, 'of', username);
      owned_cards = respJson.cards_owned_ids;
      console.log("Owned cards: ", owned_cards);
      setDropdownVisible((prev) => ({
        ...prev,
        [cardName]: !prev[cardName],
      }));
    } else {
      // Otherwise, toggle stats display
      toggleStatsVisibility(cardName);
    }
  };

  const toggleStatsVisibility = (cardName: string) => {
    if (visibleStats === cardName) {
      setAnimating(true);
      setTimeout(() => {
        setStatsVisible(null);
        setAnimating(false);
      }, 200); // Transition duration (0.2s)
    } else {
      setStatsVisible(cardName);
    }
  };

  // Handle image selection from dropdown
  const handleChooseImage = (
    cardName: string,
    imageKey: keyof typeof CARD_NAME_AND_IMAGE_MAP,
  ) => {
    console.log("Choosing card", imageKey);
    setCardImages((prev) => ({
      ...prev,
      [cardName]: CARD_NAME_AND_IMAGE_MAP[imageKey],
    }));
    setDropdownVisible((prev) => ({
      ...prev,
      [cardName]: false,
    }));
  };

  const handleRemoveCard = (cardName: string) => {
    console.log("Unequipping card", cardName);
    setCardImages((prev) => ({
      ...prev,
      [cardName]: emptyCardImage, // Replace the image with the empty card
    }));
  };

  return (
    <div className={styles.boosterContainer}>
      {Object.keys(cardImages).map((cardName) => (
        <div key={cardName} className={styles.boostercard}>
          <img
            src={cardImages[cardName]}
            alt={cardName}
            className={styles.boosterImage}
            onClick={() => handleImageClick(cardName)}
          />
          {cardImages[cardName] !== emptyCardImage && (
            <button
              className={styles.closeButton}
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering the card click
                handleRemoveCard(cardName);
              }}
            >
              ✖
            </button>
          )}

          {/* Dropdown menu for choosing an image */}
          {dropdownVisible[cardName] && (
            <div className={styles.dropdownMenu}>
              {Object.keys(CARD_NAME_AND_IMAGE_MAP).map((key) => (
                <img
                  key={key}
                  src={CARD_NAME_AND_IMAGE_MAP[key as keyof typeof CARD_NAME_AND_IMAGE_MAP]}
                  alt={key}
                  className={styles.dropdownImage}
                  onClick={() =>
                    handleChooseImage(cardName, key as keyof typeof CARD_NAME_AND_IMAGE_MAP)
                  }
                />
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Stats display */}
      {Object.keys(cardImages).map((cardName) => {
        const statsImage = STATS_MAP[cardImages[cardName]];
        return (
          <div
            key={cardName}
            className={`${styles.statsContainer} ${
              visibleStats === cardName && !animating
                ? styles.show
                : animating && visibleStats === cardName
                  ? styles.hide
                  : ""
            }`}
          >
            {visibleStats === cardName && statsImage && (
              <img
                src={statsImage}
                alt={`${cardName} Stats`}
                className={styles.statsImage}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default BoosterCard;
