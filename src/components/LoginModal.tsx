"use client";

import { authClient } from "@/lib/auth-client";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import {
  OgBadgeQuestionSection,
  useOgBadgeAnswer,
} from "@/components/OgBadgeQuestionSection";

type Provider = "google" | "apple" | "facebook" | "twitter";
type AuthMode = "signin" | "signup";

type LoginModalOptions = {
  mode?: AuthMode;
};

interface LoginModalContextValue {
  openLoginModal: (options?: LoginModalOptions) => void;
}

const LoginModalContext = createContext<LoginModalContextValue>({
  openLoginModal: () => {},
});

export function useLoginModal() {
  return useContext(LoginModalContext);
}

function GoogleIcon() {
  return (
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
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function LoginModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialMode, setInitialMode] = useState<AuthMode>("signin");

  const openLoginModal = useCallback((options?: LoginModalOptions) => {
    setInitialMode(options?.mode ?? "signin");
    setIsOpen(true);
  }, []);
  const closeLoginModal = useCallback(() => setIsOpen(false), []);

  return (
    <LoginModalContext.Provider value={{ openLoginModal }}>
      {children}
      {isOpen && (
        <LoginModalContent onClose={closeLoginModal} initialMode={initialMode} />
      )}
    </LoginModalContext.Provider>
  );
}

function LoginModalContent({
  onClose,
  initialMode,
}: {
  onClose: () => void;
  initialMode: AuthMode;
}) {
  const pathname = usePathname();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [loading, setLoading] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const {
    secretAnswer,
    setSecretAnswer,
    showSecretField,
    setShowSecretField,
    persistPendingAnswer,
  } = useOgBadgeAnswer();

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  async function handleOAuth(provider: Provider) {
    setError(null);
    setLoading(provider);

    if (mode === "signup") {
      persistPendingAnswer();
    }

    try {
      await authClient.signIn.social({
        provider,
        callbackURL: pathname || "/",
      });
    } catch {
      setError(
        `${provider.charAt(0).toUpperCase() + provider.slice(1)} ${
          mode === "signup" ? "sign up" : "sign in"
        } failed. Please try again.`,
      );
      setLoading(null);
    }
  }

  const isSignUp = mode === "signup";

  return (
    <div
      className="fixed inset-0 z-200 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-xl border bg-card text-card-foreground shadow-lg">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-6 pt-6">
          <h2 className="text-lg font-semibold">
            {isSignUp ? "Create your account" : "Welcome back"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {isSignUp
              ? "Get started with Bumpity Road"
              : "Sign in to your account"}
          </p>

          <div className="mt-4 flex rounded-lg border p-1">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                !isSignUp
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                isSignUp
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign up
            </button>
          </div>
        </div>

        <div className="space-y-3 px-6 pb-6 pt-4">
          {isSignUp && (
            <OgBadgeQuestionSection
              secretAnswer={secretAnswer}
              onSecretAnswerChange={setSecretAnswer}
              showSecretField={showSecretField}
              onToggleShow={() => setShowSecretField((prev) => !prev)}
              className="mt-0"
            />
          )}

          {error && <div className="text-sm text-destructive">{error}</div>}

          <button
            type="button"
            onClick={() => handleOAuth("google")}
            disabled={loading !== null}
            className="inline-flex h-11 w-full items-center justify-center gap-3 rounded-md border bg-background px-4 py-2 text-sm font-medium shadow-xs transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
          >
            <GoogleIcon />
            {loading === "google"
              ? isSignUp
                ? "Signing up..."
                : "Signing in..."
              : isSignUp
                ? "Sign up with Google"
                : "Continue with Google"}
          </button>

          <p className="text-center text-xs text-muted-foreground">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => setMode(isSignUp ? "signin" : "signup")}
              className="text-foreground underline hover:text-primary"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
