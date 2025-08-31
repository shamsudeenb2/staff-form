import CredentialsProvider from "next-auth/providers/credentials";
import { getServerSession } from "next-auth/next";
// import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/components/lib/db";
import bcrypt from "bcryptjs";
import axios from "axios";
import { NextAuthOptions } from "next-auth";

/**
 * Simple in-memory rate limiter for login attempts.
 * For production use a persistent store (Redis) so rate-limiting works across processes.
 */
declare global {
  // eslint-disable-next-line no-var
  var __nipost_login_attempts__: Map<string, { count: number; first: number }> | undefined;
}
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 6;

function getAttemptsStore() {
  if (!global.__nipost_login_attempts__) {
    global.__nipost_login_attempts__ = new Map();
  }
  return global.__nipost_login_attempts__;
}

function incrementAttempts(key: string) {
  const store = getAttemptsStore();
  const now = Date.now();
  const entry = store.get(key);
  if (!entry) {
    store.set(key, { count: 1, first: now });
    return { count: 1, first: now };
  }
  // reset if window expired
  if (now - entry.first > ATTEMPT_WINDOW_MS) {
    store.set(key, { count: 1, first: now });
    return { count: 1, first: now };
  }
  entry.count += 1;
  store.set(key, entry);
  return entry;
}

function resetAttempts(key: string) {
  const store = getAttemptsStore();
  store.delete(key);
}




// ...authConfig,
// export const authOptions={  
//    adapter: PrismaAdapter(prisma),
//     providers: [
//       CredentialsProvider({
//         name: "Credentials",
//         credentials: {
//           email: {},
//           password: {},
//         },
//         async authorize(credentials) {
//           const user = await prisma.user.findUnique({
//             where: { email: credentials?.email },
//           });

//           console.log("login user", user)
  
//           if (!user || !credentials?.password) return null;
//           const isValid = await bcrypt.compare(credentials.password, user.password);
//           if (!isValid) return null;
  
//           return user;
//         },
//       }),
//     ],
//     callbacks: {
//       async jwt({ token, user }) {
//         if (user) {
//           token.role = user.role;
//           token.id = user.id;
//         }
//         return token;
//       },
//       async session({ session, token }) {
//         if (token) {
//           session.user.id = token.id;
//           session.user.role = token.role;
//         }
//         return session;
//       },
//     },
//     pages: {
//       signIn: "/login",
//     },
//     session: {
//       strategy: "jwt",
//     },
//     secret: process.env.NEXTAUTH_SECRET,
//   };



// const getSession = () => getServerSession(authOptions)

// export { getSession }

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { type: "email", label: "Email" },
        password: { type: "password", label: "Password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          return null;
        }
        
        // This is the user object that will be returned to the JWT callback
        return {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const getSession = () => getServerSession(authOptions);