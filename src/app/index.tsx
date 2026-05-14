import * as React from "react";
import manifest from "~/src/artworks/manifest.json";
import styles from "~/src/app/style.module.css";
import { Frame } from "~/src/frame";
import { InfiniteCanvas } from "~/src/infinite-canvas";
import type { MediaItem } from "~/src/infinite-canvas/types";
import { PageLoader } from "~/src/loader";

const heroBackgroundUrl = `${import.meta.env.BASE_URL}eddie-laan-hero.png`;

export function App() {
  const [media] = React.useState<MediaItem[]>(manifest);
  const [textureProgress, setTextureProgress] = React.useState(0);

  if (!media.length) {
    return <PageLoader progress={0} />;
  }

  return (
    <div
      className={styles.appShell}
      style={
        {
          "--hero-image": `url(${JSON.stringify(heroBackgroundUrl)})`,
        } as React.CSSProperties
      }
    >
      <Frame />
      <PageLoader progress={textureProgress} />
      <InfiniteCanvas media={media} onTextureProgress={setTextureProgress} />
    </div>
  );
}
