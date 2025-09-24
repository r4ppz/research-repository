import type { GoogleAccounts } from "./types";

declare global {
  interface Window {
    google?: {
      accounts: GoogleAccounts;
    };
  }
}
