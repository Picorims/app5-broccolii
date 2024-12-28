import React, { useState } from "react";
import styles from "./BoosterCard.module.css";

import beetrootImage from "../../assets/boosterCard/beetrootImage.png";
import butternutImage from "../../assets/boosterCard/ButternutImage.png";
import carrotImage from "../../assets/boosterCard/CarrotImage.png";

import emptyCardImage from "../../assets/boosterCard/emptyCardImage.png";

import beetrootStatsImage from "../../assets/boosterCard/beetrootStatsImage.png";
import butternutStatsImage from "../../assets/boosterCard/ButternutStatsImage.png";
import carrotStatsImage from "../../assets/boosterCard/CarrotStatsImage.png";

const BoosterCard: React.FC<{ onClick: () => void }> = () => {
  // Constants for image mapping
  const IMAGE_MAP = {
    butternut: butternutImage,
    beetroot: beetrootImage,
    carrot: carrotImage,
  };

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

  const handleImageClick = (cardName: string) => {
    // If the clicked image is emptyCardImage, show dropdown to choose an image
    if (cardImages[cardName] === emptyCardImage) {
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
    imageKey: keyof typeof IMAGE_MAP,
  ) => {
    setCardImages((prev) => ({
      ...prev,
      [cardName]: IMAGE_MAP[imageKey],
    }));
    setDropdownVisible((prev) => ({
      ...prev,
      [cardName]: false,
    }));
  };

  const handleRemoveCard = (cardName: string) => {
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
              {Object.keys(IMAGE_MAP).map((key) => (
                <img
                  key={key}
                  src={IMAGE_MAP[key as keyof typeof IMAGE_MAP]}
                  alt={key}
                  className={styles.dropdownImage}
                  onClick={() =>
                    handleChooseImage(cardName, key as keyof typeof IMAGE_MAP)
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
