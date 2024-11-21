import React, { useState } from "react";
import styles from "./BoosterCard.module.css";

// Importation des images
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
    butternut: butternutImage,
    beetroot: beetrootImage,
    carrot: carrotImage,
  };

  const [cardImages, setCardImages] = useState(initialImages);

  const handleImageClick = (cardName: string) => {
    // If the clicked image is emptyCardImage, reset to the original image
    if (cardImages[cardName as keyof typeof cardImages] === emptyCardImage) {
      setCardImages((prevImages) => ({
        ...prevImages,
        [cardName]: initialImages[cardName as keyof typeof initialImages],
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

  const handleRemoveCard = (cardName: string) => {
    setCardImages((prevImages) => ({
      ...prevImages,
      [cardName]: emptyCardImage, // Replace the image with the empty card
    }));
  };

  return (
    <div className={styles.boosterContainer}>
      {/* Booster #1 - Butternut */}
      <div className={styles.boostercard}>
        <img
          src={cardImages.butternut}
          alt="Butternut"
          className={styles.boosterImage}
          onClick={() => handleImageClick("butternut")}
        />
        {cardImages.butternut !== emptyCardImage && (
          <button
            className={styles.closeButton}
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering the card click
              handleRemoveCard("butternut");
            }}
          >
            ✖
          </button>
        )}
      </div>

      {/* Booster #2 - Beetroot */}
      <div className={styles.boostercard}>
        <img
          src={cardImages.beetroot}
          alt="Beetroot"
          className={styles.boosterImage}
          onClick={() => handleImageClick("beetroot")}
        />
        {cardImages.beetroot !== emptyCardImage && (
          <button
            className={styles.closeButton}
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering the card click
              handleRemoveCard("beetroot");
            }}
          >
            ✖
          </button>
        )}
      </div>

      {/* Booster #3 - Carrot */}
      <div className={styles.boostercard}>
        <img
          src={cardImages.carrot}
          alt="Carrot"
          className={styles.boosterImage}
          onClick={() => handleImageClick("carrot")}
        />
        {cardImages.carrot !== emptyCardImage && (
          <button
            className={styles.closeButton}
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering the card click
              handleRemoveCard("carrot");
            }}
          >
            ✖
          </button>
        )}
      </div>

      {/* Stats display or hidden OnClick */}
      <div
        className={`${styles.statsContainer} ${
          visibleStats === "butternut" && !animating
            ? styles.show
            : animating && visibleStats === "butternut"
            ? styles.hide
            : ""
        }`}
      >
        {visibleStats === "butternut" && (
          <img
            src={butternutStatsImage}
            alt="Butternut Stats"
            className={styles.statsImage}
          />
        )}
      </div>

      <div
        className={`${styles.statsContainer} ${
          visibleStats === "beetroot" && !animating
            ? styles.show
            : animating && visibleStats === "beetroot"
            ? styles.hide
            : ""
        }`}
      >
        {visibleStats === "beetroot" && (
          <img
            src={beetrootStatsImage}
            alt="Beetroot Stats"
            className={styles.statsImage}
          />
        )}
      </div>

      <div
        className={`${styles.statsContainer} ${
          visibleStats === "carrot" && !animating
            ? styles.show
            : animating && visibleStats === "carrot"
            ? styles.hide
            : ""
        }`}
      >
        {visibleStats === "carrot" && (
          <img
            src={carrotStatsImage}
            alt="Carrot Stats"
            className={styles.statsImage}
          />
        )}
      </div>
    </div>
  );
};

export default BoosterCard;
