import React, { useState } from "react";
import styles from "./BroccoliiButton.module.css";

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

const BroccoliiButton: React.FC<BroccoliiButtonProps> = ({
  image,
  text,
  onClick,
}) => {
  const [plusOnes, setPlusOnes] = useState<PlusOne[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLImageElement>) => {
    const id = Date.now(); // Unique ID for each "+1"

    // Get the click position relative to the image
    const rect = (e.target as HTMLImageElement).getBoundingClientRect();
    const clickX = e.clientX - rect.left; // X coordinate relative to the image
    const clickY = e.clientY - rect.top; // Y coordinate relative to the image

    // Convert to percentages (for better scaling across different screen sizes)
    const top = (clickY / rect.height) * 100;
    const left = (clickX / rect.width) * 100;

    setPlusOnes((prev) => [...prev, { id, top, left }]);

    onClick();

    // Remove the "+1" after 5 seconds
    setTimeout(() => {
      setPlusOnes((prev) => prev.filter((plusOne) => plusOne.id !== id));
    }, 5000);
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
          {/* TODO: update to a variable that handle booster effect */}
          +1
        </span>
      ))}
    </div>
  );
};

export default BroccoliiButton;
