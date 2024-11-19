import React, { useState } from 'react';
import styles from './BroccoliiButton.module.css';

interface BroccoliiButtonProps {
  image: string;
  text: string;
  onClick: () => void;
}

const BroccoliiButton: React.FC<BroccoliiButtonProps> = ({ image, text, onClick }) => {
  const [isClicked, setIsClicked] = useState(false);


  const handleClick = () => {
    setIsClicked((prevState) => !prevState);
    onClick();  // Appeler la fonction onClick passée en prop
  };

  return (
    <div className={styles.buttonContainer}>
      <p>{text}</p>
      <img
        src={image}
        alt={text}
        className={`${styles.buttonImage} ${isClicked ? styles.activeImage : ''}`}
        onClick={handleClick}
      />
    </div>
  );
};

export default BroccoliiButton;
