import React, { useState } from "react";
import {
  Briefcase,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  ArrowRight,
  Lock,
} from "lucide-react";
import { loginWithGoogle } from "../lib/googleauth";

interface LoginScreenProps {
  onLoginSuccess?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      onLoginSuccess?.();
    } catch (err: any) {
      console.error("Google Sign-in Error:", err);
      if (err?.code === "auth/popup-closed-by-user") {
        setError(
          "Sign-in popup was closed before completing auth. Please try again.",
        );
      } else if (err?.code === "auth/cancelled-popup-request") {
        setError("Sign-in request was cancelled. Please try again.");
      } else if (err?.message) {
        setError(err.message);
      } else {
        setError(
          "Failed to sign in with Google. Please check popup permissions and try again.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#2D2D2A] flex flex-col justify-between selection:bg-[#5A5A40] selection:text-white">
      {/* Header */}
      <header className="px-6 py-5 border-b border-[#D4D3C9] bg-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-[#5A5A40] flex items-center justify-center text-white font-serif font-bold text-xl shadow-xs">
            J
          </div>
          <div>
            <span className="font-semibold text-lg tracking-tight text-[#2D2D2A]">
              JobAssist{" "}
              <span className="text-[#5A5A40] font-serif italic">Malawi</span>
            </span>
            <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E5E5DF] text-[#5A5A40] border border-[#D4D3C9] uppercase tracking-wider">
              ICT Portal
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs font-medium text-[#5A5A40]">
          <Lock className="h-3.5 w-3.5" />
          <span>Secure Google Auth</span>
        </div>
      </header>

      {/* Main Content Card */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white border border-[#D4D3C9] rounded-3xl p-8 shadow-sm text-center">
          {/* Badge & Icon */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#E5E5DF] text-[#5A5A40] border border-[#D4D3C9] text-xs font-semibold mb-6">
            <Sparkles className="h-3.5 w-3.5 text-[#5A5A40]" />
            <span>AI-Powered ICT Job Matching</span>
          </div>

          {/* Heading */}
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#2D2D2A] mb-3">
            Welcome to JobAssist
          </h1>
          <p className="text-sm text-[#5A5A40] leading-relaxed mb-8">
            Please sign in with your Google account to access your personalised
            ICT job dashboard, AI compatibility analysis, and application
            tracking tools.
          </p>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs text-left flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign In Button */}
          <div className="space-y-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-2xl bg-white hover:bg-[#F8F7F4] active:bg-[#E5E5DF] text-[#2D2D2A] font-semibold text-sm border-2 border-[#D4D3C9] hover:border-[#5A5A40] shadow-xs transition flex items-center justify-center space-x-3 group disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-[#5A5A40] border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>
                {isLoading ? "Connecting to Google..." : "Sign in with Google"}
              </span>
              {!isLoading && (
                <ArrowRight className="h-4 w-4 text-[#5A5A40] group-hover:translate-x-0.5 transition-transform" />
              )}
            </button>
          </div>

          {/* Verification / Security note */}
          <div className="mt-8 pt-6 border-t border-[#D4D3C9] flex items-center justify-center space-x-2 text-xs text-[#5A5A40]/80">
            <ShieldCheck className="h-4 w-4 text-emerald-700" />
            <span>Google Authentication enabled for secure access</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-[#5A5A40]/70 border-t border-[#D4D3C9] bg-white">
        JobAssist Malawi &copy; {new Date().getFullYear()} &bull; Empowering ICT
        Professionals in Malawi
      </footer>
    </div>
  );
};
