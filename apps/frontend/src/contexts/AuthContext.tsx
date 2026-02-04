import { createContext, useContext, ReactNode } from 'react';
import { authClient, useSession } from '@/lib/auth-client';

interface User {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  role?: string;
}

interface Session {
  user: User;
  session: {
    id: string;
    expiresAt: Date;
  };
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: sessionData, isPending: loading } = useSession();

  const user = sessionData?.user || null;
  const session = sessionData || null;

  const signInWithGoogle = async () => {
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: 'http://localhost:5173/',
    });
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });
      if (result.error) {
        return { error: new Error(result.error.message) };
      }
      // Redirigir después del login exitoso
      window.location.href = '/';
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    try {
      const result = await authClient.signUp.email({
        email,
        password,
        name,
      });
      if (result.error) {
        return { error: new Error(result.error.message) };
      }
      // Redirigir después del registro exitoso
      window.location.href = '/';
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = '/login';
        },
      },
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user: user as User | null,
        session: session as Session | null,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
