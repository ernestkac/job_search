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
  return new Promise((resolve, reject) => {
    if (!window.google) {
      reject(new Error("Google Identity Services is not loaded."));
      return;
    }

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,

      callback: async (credentialResponse) => {
        try {
          const googleIdToken = credentialResponse.credential;

          if (!googleIdToken) {
            throw new Error("No Google ID token received.");
          }

          const apiResponse = await fetch("/auth/google", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              idToken: googleIdToken,
            }),
          });

          if (!apiResponse.ok) {
            throw new Error("Authentication failed.");
          }

          const data: LoginResponse = await apiResponse.json();

          localStorage.setItem("token", data.token);
          resolve(data);
        } catch (error) {
          reject(error);
        }
      },
    });

    window.google.accounts.id.prompt((notification) => {
      console.log(notification);
    });
  });
}

export function logout() {
  window.google.accounts.id.disableAutoSelect();
  localStorage.removeItem("token");
}

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
