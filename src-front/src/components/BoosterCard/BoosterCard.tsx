import styles from "./BoosterCard.module.css"; // Importation du fichier CSS pour la mise en page.
import beetrootImage from "../../assets/boosterCard/beetrootImage.png";

const BoosterCard: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <div className={styles.boostercard} onClick={onClick}>
      <img src={beetrootImage} alt="Booster" className={styles.boosterImage} />
    </div>
  );
};

export default BoosterCard;
