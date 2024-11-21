import React, { useState } from "react";
import styles from "./BoosterCard.module.css";

// Importation des images
import beetrootImage from "../../assets/boosterCard/beetrootImage.png";
import butternutImage from "../../assets/boosterCard/ButternutImage.png";
import carrotImage from "../../assets/boosterCard/CarrotImage.png";

import beetrootStatsImage from "../../assets/boosterCard/beetrootStatsImage.png";
import butternutStatsImage from "../../assets/boosterCard/ButternutStatsImage.png";
import carrotStatsImage from "../../assets/boosterCard/CarrotStatsImage.png";

const BoosterCard: React.FC<{ onClick: () => void }> = () => {
  const [visibleStats, setIsStatsVisible] = useState<string | null>(null); // Show or Hide stats
  const [animating, setAnimating] = useState<boolean>(false); // Show and Hide stats animations

  const handleImageClick = (cardName: string) => {
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

  return (
    <div className={styles.boosterContainer}>
      {/* Booster #1 - Butternut */}
      <div
        className={styles.boostercard}
        onClick={() => handleImageClick("butternut")}
      >
        <img
          src={butternutImage}
          alt="Butternut"
          className={styles.boosterImage}
        />
      </div>

      {/* Booster #2 - Beetroot */}
      <div
        className={styles.boostercard}
        onClick={() => handleImageClick("beetroot")}
      >
        <img
          src={beetrootImage}
          alt="Beetroot"
          className={styles.boosterImage}
        />
      </div>

      {/* Booster #3 - Carrot */}
      <div
        className={styles.boostercard}
        onClick={() => handleImageClick("carrot")}
      >
        <img src={carrotImage} alt="Carrot" className={styles.boosterImage} />
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
