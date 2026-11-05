import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { createAdminClient } from "@/lib/supabase/admin";

export const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 hari
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Akun Civitas UNESA",
      credentials: {
        identifier: { label: "Email atau NIM / NIP", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          throw new Error("Email/NIM dan kata sandi wajib diisi");
        }

        const identifier = credentials.identifier.trim();
        const supabase = createAdminClient();

        // Cari pengguna berdasarkan email (case-insensitive) ATAU identity_number (NIM/NIP)
        const { data: user, error } = await supabase
          .from("users")
          .select("id, name, email, role, identity_number, phone_number, image, password")
          .or(`email.ilike.${identifier},identity_number.eq.${identifier}`)
          .maybeSingle();

        if (error) {
          console.error("Database query error during auth:", error);
          throw new Error("Terjadi gangguan server autentikasi.");
        }

        if (!user) {
          throw new Error("Pengguna tidak ditemukan. Periksa Email atau NIM/NIP Anda.");
        }

        if (!user.password) {
          throw new Error("Akun ini belum memiliki kata sandi aktif.");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) {
          throw new Error("Kata sandi yang Anda masukkan salah.");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          identity_number: user.identity_number,
          phone_number: user.phone_number,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.identity_number = user.identity_number;
        token.phone_number = user.phone_number;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.identity_number = token.identity_number;
        session.user.phone_number = token.phone_number;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "safa_unesa_default_development_secret_32chars_min",
};

