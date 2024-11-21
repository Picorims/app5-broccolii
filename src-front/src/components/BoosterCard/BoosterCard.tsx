import React, { useState } from "react";
import styles from "./BoosterCard.module.css"; // Importation du fichier CSS pour la mise en page.

import beetrootImage from "../../assets/boosterCard/beetrootImage.png";
import beetrootStatsImage from "../../assets/boosterCard/beetrootStatsImage.png"; // Importation de l'image des statistiques

const BoosterCard: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const [isStatsVisible, setIsStatsVisible] = useState(false); // État pour afficher/cacher les statistiques

  const handleImageClick = () => {
    setIsStatsVisible((prev) => !prev); // Inverse la visibilité à chaque clic
    onClick(); // Appelle la fonction onClick passée en props
  };

  return (
    <div>
      {/* BoosterCard */}
      <div className={styles.boostercard} onClick={handleImageClick}>
        <img src={beetrootImage} alt="Booster" className={styles.boosterImage} />
      </div>

      {/* Image des statistiques */}
      {isStatsVisible && (
        <div className={styles.statsContainer}>
          <img
            src={beetrootStatsImage}
            alt="Beetroot Stats"
            className={styles.statsImage}
          />
        </div>
      )}
    </div>
  );
};

export default BoosterCard;
