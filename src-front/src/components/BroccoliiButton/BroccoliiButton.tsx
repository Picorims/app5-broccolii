import React, { useState } from 'react';
import styles from './BroccoliiButton.module.css';

interface BroccoliiButtonProps {
  image: string;
  text: string;
  onClick: () => void;
}

interface PlusOne {
  id: number;
  top: number;
  left: number;
}

const BroccoliiButton: React.FC<BroccoliiButtonProps> = ({ image, text, onClick }) => {
  const [plusOnes, setPlusOnes] = useState<PlusOne[]>([]);

  const handleClick = () => {
    const id = Date.now(); // Unique ID for each "+1"

    // Generate random positions for the "+1" inside the image container
    const randomTop = Math.random() * 80; // Limit to 80% of the container height
    const randomLeft = Math.random() * 80; // Limit to 80% of the container width

    setPlusOnes((prev) => [
      ...prev,
      { id, top: randomTop, left: randomLeft },
    ]);

    onClick();

    // Remove the "+1" after 1 second
    setTimeout(() => {
      setPlusOnes((prev) => prev.filter((plusOne) => plusOne.id !== id));
    }, 1000);
  };

  return (
    <div className={styles.buttonContainer}>
      <p>{text}</p>
      <img
        src={image}
        alt={text}
        className={styles.buttonImage}
        onClick={handleClick}
      />
      {/* Render each "+1" */}
      {plusOnes.map(({ id, top, left }) => (
        <span
          key={id}
          className={styles.plusOne}
          style={{ top: `${top}%`, left: `${left}%` }}
        >
          +1
        </span>
      ))}
    </div>
  );
};

export default BroccoliiButton;
