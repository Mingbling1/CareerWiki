# Empliq - Autenticación

> Guía de implementación de autenticación con Better Auth.

## 📋 Índice

1. [Arquitectura de Auth](#arquitectura-de-auth)
2. [Configuración de Better Auth](#configuración-de-better-auth)
3. [Implementación en NestJS](#implementación-en-nestjs)
4. [Implementación en React](#implementación-en-react)
5. [Proveedores de Autenticación](#proveedores-de-autenticación)

---

## Arquitectura de Auth

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FLUJO DE AUTH                               │
│                                                                     │
│  Usuario                                                            │
│     │                                                               │
│     │ 1. Click "Login con Email" o "Login con Google"              │
│     ▼                                                               │
│  ┌─────────────┐                                                   │
│  │   React     │                                                   │
│  │   (SPA)     │                                                   │
│  └──────┬──────┘                                                   │
│         │                                                          │
│         │ 2. authClient.signIn.email() o signIn.social()          │
│         ▼                                                          │
│  ┌─────────────────┐                                               │
│  │    NestJS       │                                               │
│  │  /api/auth/*    │──── Better Auth Handler                      │
│  └────────┬────────┘                                               │
│           │                                                        │
│           │ 3. Valida credenciales o redirect OAuth               │
│           ▼                                                        │
│  ┌─────────────────┐                                               │
│  │   PostgreSQL    │                                               │
│  │  (users,        │                                               │
│  │   sessions,     │                                               │
│  │   accounts)     │                                               │
│  └────────┬────────┘                                               │
│           │                                                        │
│           │ 4. Devuelve session token                             │
│           ▼                                                        │
│  ┌─────────────┐                                                   │
│  │   React     │ 5. Cookie de sesión + User data                  │
│  │   (SPA)     │                                                   │
│  └─────────────┘                                                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Configuración de Better Auth

### Instalación

```bash
# Backend (NestJS)
npm install better-auth @prisma/client

# Frontend (React)
npm install better-auth
```

### Variables de Entorno

```env
# .env del backend
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
BETTER_AUTH_URL=http://localhost:4000
DATABASE_URL=postgresql://user:password@localhost:5432/empliq

# OAuth Providers (opcional)
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
```

---

## Implementación en NestJS

### 1. Configuración del servidor de auth

**`/apps/api/src/infrastructure/auth/auth.ts`**

```typescript
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:4000',
  basePath: '/api/auth',
  secret: process.env.BETTER_AUTH_SECRET,
  
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
  },
  
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 días
    updateAge: 60 * 60 * 24, // 1 día
  },
  
  trustedOrigins: [
    'http://localhost:5173',
    'http://localhost:3000',
  ],
});
```

### 2. Controller de NestJS

**`/apps/api/src/infrastructure/auth/auth.controller.ts`**

```typescript
import { Controller, All, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { auth } from './auth';
import { toNodeHandler } from 'better-auth/node';

@Controller('auth')
export class AuthController {
  private handler = toNodeHandler(auth);

  @All('*')
  async handleAuth(@Req() req: Request, @Res() res: Response) {
    return this.handler(req, res);
  }
}
```

### 3. Tablas de Base de Datos

Better Auth requiere estas tablas (Prisma schema):

```prisma
model User {
  id            String    @id
  name          String
  email         String    @unique
  emailVerified Boolean   @default(false) @map("email_verified")
  image         String?
  role          String    @default("user")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  
  sessions      Session[]
  accounts      Account[]

  @@map("users")
}

model Session {
  id        String   @id
  userId    String   @map("user_id")
  token     String   @unique
  expiresAt DateTime @map("expires_at")
  ipAddress String?  @map("ip_address")
  userAgent String?  @map("user_agent")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model Account {
  id                   String    @id
  userId               String    @map("user_id")
  accountId            String    @map("account_id")
  providerId           String    @map("provider_id")
  accessToken          String?   @map("access_token")
  refreshToken         String?   @map("refresh_token")
  accessTokenExpiresAt DateTime? @map("access_token_expires_at")
  refreshTokenExpiresAt DateTime? @map("refresh_token_expires_at")
  scope                String?
  password             String?
  createdAt            DateTime  @default(now()) @map("created_at")
  updatedAt            DateTime  @updatedAt @map("updated_at")
  
  user                 User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("accounts")
}

model Verification {
  id         String   @id
  identifier String
  value      String
  expiresAt  DateTime @map("expires_at")
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  @@map("verifications")
}
```

---

## Implementación en React

### 1. Cliente de Auth

**`/apps/web/src/lib/auth-client.ts`**

```typescript
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: 'http://localhost:4000',
  basePath: '/api/auth',
  fetchOptions: {
    credentials: 'include',
  },
});

export const { 
  signIn, 
  signUp, 
  signOut, 
  useSession,
  getSession,
} = authClient;
```

### 2. Context de Auth

**`/apps/web/src/contexts/AuthContext.tsx`**

```typescript
import { createContext, useContext, ReactNode } from 'react';
import { authClient, useSession } from '@/lib/auth-client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: sessionData, isPending: loading } = useSession();

  const signInWithGoogle = async () => {
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: '/',
    });
  };

  const signInWithEmail = async (email: string, password: string) => {
    const result = await authClient.signIn.email({ email, password });
    if (result.error) {
      return { error: new Error(result.error.message) };
    }
    window.location.href = '/';
    return { error: null };
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    const result = await authClient.signUp.email({ email, password, name });
    if (result.error) {
      return { error: new Error(result.error.message) };
    }
    window.location.href = '/';
    return { error: null };
  };

  // ... resto del contexto
}
```

### 3. Uso en Componentes

```tsx
import { useAuth } from '@/contexts/AuthContext';

function LoginButton() {
  const { signInWithGoogle, signInWithEmail, user, loading } = useAuth();

  if (loading) return <Spinner />;
  
  if (user) {
    return <p>Hola, {user.name}</p>;
  }

  return (
    <>
      <button onClick={signInWithGoogle}>
        Continuar con Google
      </button>
      <form onSubmit={(e) => {
        e.preventDefault();
        signInWithEmail(email, password);
      }}>
        <input type="email" />
        <input type="password" />
        <button type="submit">Iniciar sesión</button>
      </form>
    </>
  );
}
```

---

## Proveedores de Autenticación

### Email/Password ✅
- Registro con email y contraseña
- Login con email y contraseña
- Contraseñas hasheadas con bcrypt

### Google OAuth ✅
- Requiere configurar credenciales en Google Cloud Console
- Callback URL: `http://localhost:4000/api/auth/callback/google`

### LinkedIn OAuth (Post-MVP)
- Similar a Google
- Callback URL: `http://localhost:4000/api/auth/callback/linkedin`

---

## Endpoints de Auth

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/sign-up/email` | Registro con email |
| POST | `/api/auth/sign-in/email` | Login con email |
| GET | `/api/auth/sign-in/social` | Iniciar OAuth |
| GET | `/api/auth/callback/:provider` | Callback OAuth |
| GET | `/api/auth/get-session` | Obtener sesión actual |
| POST | `/api/auth/sign-out` | Cerrar sesión |

---

## Seguridad

- ✅ Cookies httpOnly para tokens de sesión
- ✅ CORS configurado para orígenes confiables
- ✅ Contraseñas hasheadas con bcrypt
- ✅ Tokens de sesión con expiración
- ✅ Refresh automático de sesiones

---

## Referencias

- [Better Auth Docs](https://www.better-auth.com/docs/introduction)
- [Better Auth + NestJS](https://www.better-auth.com/docs/integrations/nest-js)
- [Better Auth + React](https://www.better-auth.com/docs/integrations/react)
