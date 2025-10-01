/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PIZZA_SERVICE_URL: string;
  readonly VITE_PIZZA_FACTORY_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
