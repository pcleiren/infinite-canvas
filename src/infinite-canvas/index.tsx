import * as React from "react";
import { InfiniteCanvasScene } from "./scene";

const LazyInfiniteCanvasScene = React.lazy(() =>
  import("./scene").then((mod) => ({ default: mod.InfiniteCanvasScene })),
);

export function InfiniteCanvas(props: React.ComponentProps<typeof InfiniteCanvasScene>) {
  if (import.meta.env.VITE_OFFLINE_BUILD === "true") {
    return <InfiniteCanvasScene {...props} />;
  }

  return (
    <React.Suspense fallback={null}>
      <LazyInfiniteCanvasScene {...props} />
    </React.Suspense>
  );
}
