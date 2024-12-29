import styles from "./clickerHUD.module.css";

interface ClickerHUDProps {
  statNbBroccos: number;
  statClickrate: number;
}

const ClickerHUD: React.FC<ClickerHUDProps> = ({
  statNbBroccos,
  statClickrate,
}) => {
  return (
    <div className={styles.container}>
      <p className={styles.statBrocco}>{statNbBroccos} brocolis</p>
      <p className={styles.stat}>Generating {statClickrate} broccolis/second</p>
    </div>
  );
};

export default ClickerHUD;
