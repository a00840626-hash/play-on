import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface FakeUser { id: string; email: string; }
interface AuthCtx {
  session: { user: FakeUser } | null;
  user: FakeUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const STORAGE_KEY = "playon:demo-user";

const getOrCreateUser = (): FakeUser => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const u: FakeUser = {
    id: (crypto as any).randomUUID ? crypto.randomUUID() : `u-${Date.now()}`,
    email: "demo@playon.app",
  };
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(u)); } catch {}
  return u;
};

const Ctx = createContext<AuthCtx>({ session: null, user: null, loading: true, signOut: async () => {} });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FakeUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getOrCreateUser());
    setLoading(false);
  }, []);

  return (
    <Ctx.Provider
      value={{
        session: user ? { user } : null,
        user,
        loading,
        signOut: async () => {
          try { localStorage.removeItem(STORAGE_KEY); } catch {}
          setUser(null);
        },
      }}
    >
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => useContext(Ctx);
