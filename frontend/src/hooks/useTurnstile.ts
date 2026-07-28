import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback": () => void;
          "error-callback": () => void;
          theme: "dark" | "light";
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

type UseTurnstileOptions = {
  siteKey: string;
  onSuccess: (token: string) => void;
  onExpire: () => void;
  onError: () => void;
};

let scriptPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Turnstile script failed"));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export function useTurnstile({
  siteKey,
  onSuccess,
  onExpire,
  onError,
}: UseTurnstileOptions) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string>();

  useEffect(() => {
    let mounted = true;

    if (!siteKey || siteKey === "test-bypass") {
      onSuccess("test-bypass-token");
      return undefined;
    }

    void loadTurnstileScript()
      .then(() => {
        if (
          !mounted ||
          !containerRef.current ||
          !window.turnstile ||
          widgetIdRef.current
        )
          return;
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: onSuccess,
          "expired-callback": onExpire,
          "error-callback": onError,
          theme: "dark",
        });
      })
      .catch(onError);

    return () => {
      mounted = false;
      if (window.turnstile && widgetIdRef.current) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
  }, [onError, onExpire, onSuccess, siteKey]);

  return {
    containerRef,
    reset: () => window.turnstile?.reset(widgetIdRef.current),
  };
}
