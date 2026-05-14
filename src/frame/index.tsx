import styles from "./style.module.css";

export function Frame() {
  return (
    <header className={styles.frame}>
      <div className={styles.frame__stack}>
        <p className={styles.frame__tagline}>Thanks for everything</p>
        <h1 className={styles.frame__title}>Eddie Laan</h1>
      </div>
    </header>
  );
}
