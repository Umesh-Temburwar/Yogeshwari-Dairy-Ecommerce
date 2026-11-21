/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_MOCK_API?: string;
  readonly VITE_BACKEND_URL?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_STORE_PHONE?: string;
  readonly VITE_STORE_NAME?: string;
  readonly VITE_FREE_DELIVERY_THRESHOLD?: string;
  readonly VITE_STANDARD_DELIVERY_FEE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
