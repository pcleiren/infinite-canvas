import * as React from "react";
import manifest from "~/src/artworks/manifest.json";
import styles from "~/src/app/style.module.css";
import { Frame } from "~/src/frame";
import { InfiniteCanvas } from "~/src/infinite-canvas";
import type { MediaItem } from "~/src/infinite-canvas/types";
import { PageLoader } from "~/src/loader";

function heroPhotoHref(): string {
  if (typeof window !== "undefined") {
    try {
      return new URL("eddie-laan-hero.png", window.location.href).href;
    } catch {
      /* fall through */
    }
  }
  return `${import.meta.env.BASE_URL}eddie-laan-hero.png`;
}

export function App() {
  const [media] = React.useState<MediaItem[]>(manifest);
  const [textureProgress, setTextureProgress] = React.useState(0);
  const [heroSrc] = React.useState(heroPhotoHref);

  if (!media.length) {
    return <PageLoader progress={0} />;
  }

  return (
    <div className={styles.appShell}>
      <div className={styles.heroBackdrop} aria-hidden="true">
        <img className={styles.heroImage} src={heroSrc} alt="" decoding="async" fetchPriority="high" />
        <div className={styles.heroTint} />
      </div>
      <div className={styles.appContent}>
        <Frame />
        <PageLoader progress={textureProgress} />
        <InfiniteCanvas media={media} onTextureProgress={setTextureProgress} />
      </div>
    </div>
  );
}
