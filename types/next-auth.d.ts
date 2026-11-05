import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    role: "student" | "lecturer" | "facility_staff";
    identity_number?: string | null;
    phone_number?: string | null;
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      role: "student" | "lecturer" | "facility_staff";
      identity_number?: string | null;
      phone_number?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "student" | "lecturer" | "facility_staff";
    identity_number?: string | null;
    phone_number?: string | null;
  }
}

