"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Sprout, ArrowRight, CreditCard, LoaderCircle } from "lucide-react";
import type { ForestData } from "@/lib/forest/model";
import { demoForest } from "@/lib/forest/demo";
interface ForestContextValue {
  data: ForestData | null;
  error: string;
  refresh: () => Promise<void>;
  openLogin: () => void;
  logout: () => Promise<void>;
  previewMeal: (weight: number | null) => void;
}
const Context = createContext<ForestContextValue | null>(null);
export function useForest() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("ForestProvider required");
  return ctx;
}
export function ForestProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ForestData | null>(null),
    [error, setError] = useState("");
  const [login, setLogin] = useState(false),
    [card, setCard] = useState(""),
    [loginError, setLoginError] = useState(""),
    [busy, setBusy] = useState(false);
  const extras = useRef<number[]>([]),
    live = useRef(false);
  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/forest", { cache: "no-store" });
      if (response.status === 401) {
        live.current = false;
        setData(demoForest(extras.current));
        setError("");
        return;
      }
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Bağlantı kurulamadı.");
      live.current = true;
      setData(result);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bağlantı kurulamadı.");
    }
  }, []);
  useEffect(() => {
    void refresh();
    const timer = setInterval(() => {
      if (live.current && !document.hidden) void refresh();
    }, 30000);
    const visible = () => {
      if (!document.hidden && live.current) void refresh();
    };
    document.addEventListener("visibilitychange", visible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [refresh]);
  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setLoginError("");
    try {
      const response = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardID: card }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      await refresh();
      setLogin(false);
      setCard("");
    } catch (e) {
      setLoginError(e instanceof Error ? e.message : "Giriş yapılamadı.");
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    try {
      const response = await fetch("/api/session", { method: "DELETE" });
      if (!response.ok) throw new Error("Çıkış yapılamadı.");
      live.current = false;
      extras.current = [];
      setData(demoForest());
      setError("");
    } catch {
      setError("Çıkış yapılamadı. Tekrar dene.");
    }
  }
  const value: ForestContextValue = {
    data,
    error,
    refresh,
    openLogin: () => setLogin(true),
    logout,
    previewMeal: (weight) => {
      if (live.current) return;
      extras.current = weight === null ? [] : [...extras.current, weight];
      setData(demoForest(extras.current));
    },
  };
  return (
    <Context.Provider value={value}>
      {children}
      <Dialog open={login} onOpenChange={setLogin}>
        <DialogContent className="forest-login sm:max-w-md">
          <div className="login-symbol">
            <Sprout size={30} />
          </div>
          <DialogTitle className="text-2xl">Kartımla giriş</DialogTitle>
          <DialogDescription className="sr-only">
            Öğrenci kartınla giriş yap.
          </DialogDescription>
          <form onSubmit={signIn}>
            <label htmlFor="card-number">Öğrenci kartı numarası</label>
            <div className="card-input">
              <CreditCard size={19} />
              <input
                id="card-number"
                value={card}
                onChange={(e) => setCard(e.target.value)}
                placeholder="Kart numaran"
                autoComplete="off"
                maxLength={128}
                required
              />
            </div>
            {loginError && (
              <p className="form-error" role="alert">
                {loginError}
              </p>
            )}
            <button className="forest-button" disabled={busy}>
              {busy ? (
                <LoaderCircle className="animate-spin" size={17} />
              ) : (
                <>
                  Ormanıma gir <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </Context.Provider>
  );
}
