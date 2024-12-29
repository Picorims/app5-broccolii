import { useEffect, useState } from "react";
import styles from "./PasswordStrenghtChecker.module.css";

interface PasswordStrengthCheckerProps {
  password: string;
}

export function PasswordStrengthChecker({
  password,
}: PasswordStrengthCheckerProps) {
  const [strength, setStrength] = useState(0);

  useEffect(() => {
    const calculateStrength = (password: string) => {
      let score = 0;
      const tests = [/[0-9]/, /[a-z]/, /[A-Z]/, /[^0-9a-zA-Z]/];

      if (password.length >= 6) {
        tests.forEach((test) => {
          if (test.test(password)) score++;
        });
      }
      setStrength(score);
    };

    calculateStrength(password);
  }, [password]); // is called every time the password change

  const strengthColors = [
    "#D73F40",
    "#DC6551",
    "#F2B84F",
    "#BDE952",
    "#3ba62f",
  ];
  const strengthWidths = ["1%", "25%", "50%", "75%", "100%"];

  return (
    <div className={styles.container}>
      <div
        className={styles.bar}
        style={{
          width: strengthWidths[strength],
          backgroundColor: strengthColors[strength],
        }}
      ></div>
    </div>
  );
}
