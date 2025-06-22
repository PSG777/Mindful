// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events",
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],

  callbacks: {
    async jwt({ token, account }) {
      // On first sign-in, persist both tokens from Google:
      if (account) {
        token.accessToken  = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt    = (account.expires_at ?? 0) * 1000;  // ms
      }

      // If the access token is expired, use the refresh token to fetch a new one:
      const now = Date.now();
      if (token.expiresAt && now > token.expiresAt - 60_000) {
        try {
          const url =
            "https://oauth2.googleapis.com/token" +
            `?client_id=${process.env.GOOGLE_CLIENT_ID}` +
            `&client_secret=${process.env.GOOGLE_CLIENT_SECRET}` +
            `&grant_type=refresh_token` +
            `&refresh_token=${token.refreshToken}`;

          const res = await fetch(url, { method: "POST" });
          const refreshed = await res.json();

          token.accessToken  = refreshed.access_token;
          token.expiresAt    = Date.now() + refreshed.expires_in * 1000;
          // keep the same refreshToken
        } catch (err) {
          console.error("Error refreshing Google access token", err);
        }
      }

      return token;
    },

    async session({ session, token }) {
      // Make both tokens available client-side if you need them:
      session.accessToken  = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

// export both GET and POST so Next.js can route OAuth flows correctly
export { handler as GET, handler as POST }; 