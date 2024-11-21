import React, { useState } from "react";
import styles from "./BoosterCard.module.css"; // Importation du fichier CSS pour la mise en page.

// Importation des images
import beetrootImage from "../../assets/boosterCard/beetrootImage.png";
import butternutImage from "../../assets/boosterCard/ButternutImage.png";
import carrotImage from "../../assets/boosterCard/CarrotImage.png";

import beetrootStatsImage from "../../assets/boosterCard/beetrootStatsImage.png";
import butternutStatsImage from "../../assets/boosterCard/ButternutStatsImage.png";
import carrotStatsImage from "../../assets/boosterCard/CarrotStatsImage.png";

const BoosterCard: React.FC<{ onClick: () => void }> = () => {
  const [visibleStats, setIsStatsVisible] = useState<string | null>(null); // État pour afficher/cacher les statistiques

  const handleImageClick = (cardName: string) => {
    setIsStatsVisible((prev) => (prev === cardName ? null : cardName)); // Active ou désactive l'affichage des stats
  };

  return (
    <div className={styles.boosterContainer}>
      {/* Carte gauche - Butternut */}
      <div
        className={styles.boostercard}
        onClick={() => handleImageClick("butternut")}
      >
        <img src={butternutImage} alt="Butternut" className={styles.boosterImage} />
      </div>

      {/* Carte centrale - Beetroot */}
      <div
        className={styles.boostercard}
        onClick={() => handleImageClick("beetroot")}
      >
        <img src={beetrootImage} alt="Beetroot" className={styles.boosterImage} />
      </div>

      {/* Carte droite - Carrot */}
      <div
        className={styles.boostercard}
        onClick={() => handleImageClick("carrot")}
      >
        <img src={carrotImage} alt="Carrot" className={styles.boosterImage} />
      </div>

      {/* Stats affichées conditionnellement */}
      {visibleStats === "butternut" && (
        <div className={styles.statsContainer}>
          <img src={butternutStatsImage} alt="Butternut Stats" className={styles.statsImage} />
        </div>
      )}
      {visibleStats === "beetroot" && (
        <div className={styles.statsContainer}>
          <img src={beetrootStatsImage} alt="Beetroot Stats" className={styles.statsImage} />
        </div>
      )}
      {visibleStats === "carrot" && (
        <div className={styles.statsContainer}>
          <img src={carrotStatsImage} alt="Carrot Stats" className={styles.statsImage} />
        </div>
      )}
    </div>
  );
};

export default BoosterCard;
