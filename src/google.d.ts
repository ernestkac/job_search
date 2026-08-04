interface GoogleAccountsId {
  disableAutoSelect: () => void;
}

interface GoogleOAuth2CodeClient {
  requestCode: () => void;
}

interface GoogleOAuth2Client {
  initCodeClient: (config: {
    client_id: string;
    scope: string;
    ux_mode: "popup";
    prompt: string;
    include_granted_scopes: boolean;
    access_type: string;
    callback: (response: {
      code?: string;
      error?: string;
      error_description?: string;
    }) => void;
  }) => GoogleOAuth2CodeClient;
}

interface GoogleAccounts {
  id: GoogleAccountsId;
  oauth2: GoogleOAuth2Client;
}

interface GoogleLibrary {
  accounts: GoogleAccounts;
}

interface Window {
  google?: GoogleLibrary;
}

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
