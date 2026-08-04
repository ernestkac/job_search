export interface Candidate {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_photo?: string;
}

export interface LoginResponse {
  token: string;
  candidate: Candidate;
}

export async function loginWithGoogle(): Promise<LoginResponse> {
  return requestGoogleCodeFlow({
    scope: "openid email profile",
    prompt: "select_account",
    include_granted_scopes: true,
    access_type: "offline",
    endpoint: "/auth/google",
    onSuccess: (data: LoginResponse) => {
      localStorage.setItem("token", data.token);
      return data;
    },
    errorMessage: "Google sign-in was cancelled.",
  });
}

export async function authorizeGmailWithGoogle(): Promise<void> {
  await requestGoogleCodeFlow({
    scope: "https://www.googleapis.com/auth/gmail.send",
    prompt: "select_account",
    include_granted_scopes: true,
    access_type: "offline",
    endpoint: "/auth/google/gmail",
    authHeader: true,
    errorMessage: "Gmail authorization was cancelled.",
  });
}

async function requestGoogleCodeFlow<T>(config: {
  scope: string;
  prompt: string;
  include_granted_scopes: boolean;
  access_type: string;
  endpoint: string;
  authHeader?: boolean;
  onSuccess?: (data: T) => T | void;
  errorMessage: string;
}): Promise<T> {
  return new Promise((resolve, reject) => {
    if (!window.google?.accounts?.oauth2) {
      reject(new Error("Google Identity Services is not loaded."));
      return;
    }

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      reject(new Error("Google client ID is not configured."));
      return;
    }

    const codeClient = window.google.accounts.oauth2.initCodeClient({
      client_id: clientId,
      scope: config.scope,
      ux_mode: "popup",
      prompt: config.prompt,
      include_granted_scopes: config.include_granted_scopes,
      access_type: config.access_type,
      callback: async (response: {
        code?: string;
        error?: string;
        error_description?: string;
      }) => {
        try {
          if (response.error) {
            if (
              response.error === "popup_closed_by_user" ||
              response.error === "access_denied" ||
              response.error === "user_cancelled"
            ) {
              reject(new Error(config.errorMessage));
              return;
            }

            reject(
              new Error(
                `Google authorization failed: ${response.error_description || response.error}`,
              ),
            );
            return;
          }

          const authorizationCode = response.code;
          if (!authorizationCode) {
            reject(new Error("No authorization code was returned by Google."));
            return;
          }

          const headers: Record<string, string> = {
            "Content-Type": "application/json",
          };
          const token = localStorage.getItem("token");
          if (config.authHeader && token) {
            headers.Authorization = `Bearer ${token}`;
          }

          const apiResponse = await fetch(config.endpoint, {
            method: "POST",
            headers,
            body: JSON.stringify({
              code: authorizationCode,
            }),
          });

          if (!apiResponse.ok) {
            let message = "Authentication failed.";
            try {
              const errorBody = await apiResponse.json();
              message = errorBody.error || errorBody.message || message;
            } catch {
              // Ignore JSON parsing failures and use the default message.
            }
            reject(new Error(message));
            return;
          }

          const data: T = await apiResponse.json();
          const result = config.onSuccess ? config.onSuccess(data) : data;
          resolve((result ?? data) as T);
        } catch (error) {
          reject(
            error instanceof Error
              ? error
              : new Error("Unable to complete Google authentication."),
          );
        }
      },
    });

    codeClient.requestCode();
  });
}

export function logout() {
  if (window.google?.accounts?.id?.disableAutoSelect) {
    window.google.accounts.id.disableAutoSelect();
  }
  localStorage.removeItem("token");
}

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
