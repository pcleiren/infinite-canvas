/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OFFLINE_BUILD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
