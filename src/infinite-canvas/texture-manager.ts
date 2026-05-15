import { resolveAssetUrl } from "@/lib/resolve-asset-url";
import * as THREE from "three";
import type { MediaItem } from "./types";

const textureCache = new Map<string, THREE.Texture>();
const loadCallbacks = new Map<string, Set<(tex: THREE.Texture) => void>>();
const httpLoader = new THREE.TextureLoader();
const loadingManager = THREE.DefaultLoadingManager;

function usesFileSafeImageLoader(): boolean {
  return (
    import.meta.env.VITE_OFFLINE_BUILD === "true" ||
    (typeof window !== "undefined" && window.location.protocol === "file:")
  );
}

function configureTexture(tex: THREE.Texture, fileSafe: boolean): void {
  if (fileSafe) {
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
  } else {
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = true;
    tex.anisotropy = 4;
  }
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
}

const isTextureLoaded = (tex: THREE.Texture): boolean => {
  const img = tex.image as HTMLImageElement | undefined;
  return img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0;
};

/** Image() without crossOrigin — required for WebGL textures on file:// */
function loadTextureViaImage(
  url: string,
  onLoad: (tex: THREE.Texture) => void,
  onError: (err: unknown) => void,
): THREE.Texture {
  const texture = new THREE.Texture();
  const image = new Image();

  loadingManager.itemStart(url);

  image.onload = () => {
    texture.image = image;
    configureTexture(texture, true);
    loadingManager.itemEnd(url);
    onLoad(texture);
  };

  image.onerror = () => {
    loadingManager.itemError(url);
    onError(new Error(`Image load failed: ${url}`));
  };

  image.src = url;
  return texture;
}

function startLoad(key: string): THREE.Texture {
  const fileSafe = usesFileSafeImageLoader();

  const finish = (tex: THREE.Texture) => {
    configureTexture(tex, fileSafe);
    loadCallbacks.get(key)?.forEach((cb) => {
      try {
        cb(tex);
      } catch (err) {
        console.error(`Callback failed: ${JSON.stringify(err)}`);
      }
    });
    loadCallbacks.delete(key);
  };

  const fail = (err: unknown) => {
    console.error("Texture load failed:", key, err);
    loadCallbacks.delete(key);
  };

  if (fileSafe) {
    return loadTextureViaImage(key, finish, fail);
  }

  return httpLoader.load(key, finish, undefined, fail);
}

export const getTexture = (item: MediaItem, onLoad?: (texture: THREE.Texture) => void): THREE.Texture => {
  const key = resolveAssetUrl(item.url);
  const existing = textureCache.get(key);

  if (existing) {
    if (onLoad) {
      if (isTextureLoaded(existing)) {
        onLoad(existing);
      } else {
        loadCallbacks.get(key)?.add(onLoad);
      }
    }
    return existing;
  }

  const callbacks = new Set<(tex: THREE.Texture) => void>();
  if (onLoad) callbacks.add(onLoad);
  loadCallbacks.set(key, callbacks);

  const texture = startLoad(key);
  textureCache.set(key, texture);
  return texture;
};
