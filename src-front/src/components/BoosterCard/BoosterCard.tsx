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
  const [visibleStats, setIsStatsVisible] = useState<string | null>(null); // Show or Hide stats
  const [animating, setAnimating] = useState<boolean>(false); // Show and Hide stats animations

  // State to manage the current images for each card
  const initialImages = {
    booster1: emptyCardImage,
    booster2: emptyCardImage,
    booster3: emptyCardImage,
  };

  const [cardImages, setCardImages] = useState<{ [key: string]: string }>(
    initialImages
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
      return;
    }

    // Otherwise, toggle stats display
    if (visibleStats === cardName) {
      setAnimating(true);
      setTimeout(() => {
        setIsStatsVisible(null);
        setAnimating(false);
      }, 200); // Transition duration (0.2s)
    } else {
      setIsStatsVisible(cardName);
    }
  };

  const handleChooseImage = (cardName: string, chosenImage: string) => {
    const selectedImage = {
      butternut: butternutImage,
      beetroot: beetrootImage,
      carrot: carrotImage,
    }[chosenImage];

    setCardImages((prevImages) => ({
      ...prevImages,
      [cardName]: selectedImage,
    }));

    // Hide the dropdown after selecting an image
    setDropdownVisible((prev) => ({
      ...prev,
      [cardName]: false,
    }));
  };

  const handleRemoveCard = (cardName: string) => {
    setCardImages((prevImages) => ({
      ...prevImages,
      [cardName]: emptyCardImage, // Replace the image with the empty card
    }));
  };

  const getStatsImage = (image: string) => {
    if (image === butternutImage) return butternutStatsImage;
    if (image === beetrootImage) return beetrootStatsImage;
    if (image === carrotImage) return carrotStatsImage;
    return null;
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
              <img
                src={butternutImage}
                alt="Butternut"
                className={styles.dropdownImage}
                onClick={() => handleChooseImage(cardName, "butternut")}
              />
              <img
                src={beetrootImage}
                alt="Beetroot"
                className={styles.dropdownImage}
                onClick={() => handleChooseImage(cardName, "beetroot")}
              />
              <img
                src={carrotImage}
                alt="Carrot"
                className={styles.dropdownImage}
                onClick={() => handleChooseImage(cardName, "carrot")}
              />
            </div>
          )}
        </div>
      ))}

      {/* Stats display */}
      {Object.keys(cardImages).map((cardName) => {
        const statsImage = getStatsImage(cardImages[cardName]);
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
