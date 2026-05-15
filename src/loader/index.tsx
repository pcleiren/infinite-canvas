import * as React from "react";
import styles from "./style.module.css";

export function PageLoader({
  progress,
  maxWaitMs,
}: {
  progress: number;
  /** Dismiss loader after this time even if progress stays below 100 (offline / file://). */
  maxWaitMs?: number;
}) {
  const [show, setShow] = React.useState(true);
  const [minTimeElapsed, setMinTimeElapsed] = React.useState(false);
  const [maxWaitElapsed, setMaxWaitElapsed] = React.useState(false);
  const visualRef = React.useRef(0);
  const [visualProgress, setVisualProgress] = React.useState(0);

  React.useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    if (maxWaitMs === undefined) {
      return;
    }
    const timer = setTimeout(() => setMaxWaitElapsed(true), maxWaitMs);
    return () => clearTimeout(timer);
  }, [maxWaitMs]);

  React.useEffect(() => {
    let raf: number;

    const animate = () => {
      const diff = progress - visualRef.current;

      if (diff > 0.1) {
        // Lerp toward target, faster when further behind
        visualRef.current += diff * 0.08;
        setVisualProgress(visualRef.current);
        raf = requestAnimationFrame(animate);
      } else {
        // Snap when close enough
        visualRef.current = progress;
        setVisualProgress(progress);
      }
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [progress]);

  const loadComplete = progress === 100 && visualProgress >= 99.5;
  const shouldDismiss = minTimeElapsed && (loadComplete || maxWaitElapsed);

  React.useEffect(() => {
    if (shouldDismiss) {
      const t = setTimeout(() => setShow(false), 200);
      return () => clearTimeout(t);
    }
  }, [shouldDismiss]);

  if (!show) {
    return null;
  }

  const isHidden = shouldDismiss;

  return (
    <div className={`${styles.overlay} ${isHidden ? styles.hidden : styles.visible}`}>
      <div className={styles.progressBarContainer}>
        <div className={styles.progressBarFill} style={{ transform: `scaleX(${visualProgress / 100})` }} />
      </div>
    </div>
  );
}
