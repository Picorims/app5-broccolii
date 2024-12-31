import styles from "./clickerHUD.module.css";

interface ClickerHUDProps {
  statNbBroccos: number;
  statClickvalue: number;
}

const ClickerHUD: React.FC<ClickerHUDProps> = ({
  statNbBroccos,
  statClickvalue: statClickValue,
}) => {
  return (
    <div className={styles.container}>
      <p className={styles.statBrocco}>{statNbBroccos} brocolis</p>
      <p className={styles.stat}>Generating {statClickValue} broccolis/click</p>
    </div>
  );
};

export default ClickerHUD;
