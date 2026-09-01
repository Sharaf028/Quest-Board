import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  session: {
    strategy: "database",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        (session.user as { id: string }).id = user.id;
      }
      return session;
    },
  },
  events: {
    // NextAuth only saves name/email/image once, on first sign-in, and never
    // re-syncs them from Google on later logins. This keeps the profile
    // photo (and name) current every time the user signs in.
    async signIn({ user, profile }) {
      const googleProfile = profile as { name?: string; picture?: string } | undefined;
      if (!googleProfile || !user.id) return;

      const nextName = googleProfile.name;
      const nextImage = googleProfile.picture;

      if ((nextName && nextName !== user.name) || (nextImage && nextImage !== user.image)) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            ...(nextName ? { name: nextName } : {}),
            ...(nextImage ? { image: nextImage } : {}),
          },
        });
      }
    },
  },
  pages: {},
};
