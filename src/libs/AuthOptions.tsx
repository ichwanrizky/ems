import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

/**
 * Autentikasi dashboard.
 *
 * Sejak migrasi ke `ems-backend`, verifikasi kredensial TIDAK lagi dilakukan di
 * sini: `authorize()` meneruskannya ke `POST /api/auth/login` di backend, dan
 * backend yang memeriksa password, menurunkan hak akses department/sub
 * department, serta menyusun pohon menu.
 *
 * Yang dibawa pulang dan disimpan di session:
 *
 * - isi session seperti sebelumnya (id, username, name, role, akses, menu) —
 *   bentuknya sengaja dipertahankan supaya `page.tsx` dan komponen yang sudah
 *   ada tidak perlu diubah;
 * - `accessToken`, JWT terbitan backend yang dipakai `ApiClient` untuk setiap
 *   pemanggilan berikutnya.
 *
 * Session NextAuth tetap 8 jam, sama dengan masa berlaku token backend, supaya
 * keduanya kedaluwarsa bersamaan — session yang masih hidup dengan token yang
 * sudah mati hanya akan menghasilkan "Sesi berakhir" di setiap halaman.
 */

const BASE_URL = (process.env.BACKEND_URL || "").replace(/\/+$/, "");

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8, // 8 jam
  },
  secret: process.env.JWT,
  providers: [
    CredentialsProvider({
      name: "credentials",
      type: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        const { username, password } = credentials as {
          username: string;
          password: string;
        };

        if (!username || !password) return null;

        if (!BASE_URL) {
          console.error("BACKEND_URL belum diset — login tidak bisa diproses.");
          return null;
        }

        try {
          const response = await fetch(`${BASE_URL}/api/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({ username, password }),
            cache: "no-store",
          });

          const hasil = await response.json();

          // Backend membedakan kredensial salah (401) dari role tanpa menu
          // (403), tapi NextAuth hanya mengenal "boleh" dan "tidak" —
          // pesannya dicatat ke log server supaya tetap bisa ditelusuri.
          if (!hasil?.status || !hasil?.data?.accessToken) {
            console.warn(`Login ditolak untuk "${username}": ${hasil?.message ?? response.status}`);
            return null;
          }

          const data = hasil.data;

          return {
            id: String(data.id),
            username: data.username,
            name: data.name,
            role_id: data.role_id,
            role_name: data.role_name,
            access_department: data.access_department,
            access_sub_department: data.access_sub_department,
            menu: data.menu,
            accessToken: data.accessToken,
          } as any;
        } catch (error) {
          console.error("Gagal menghubungi backend saat login:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }: any) {
      if (account?.provider === "credentials") {
        token.id = user.id;
        token.username = user.username;
        token.name = user.name;
        token.role_id = user.role_id;
        token.role_name = user.role_name;
        token.access_department = user.access_department;
        token.access_sub_department = user.access_sub_department;
        token.menu = user.menu;
        token.accessToken = user.accessToken;
      }

      return token;
    },

    async session({ session, token }: any) {
      delete session.user.email;
      delete session.user.name;
      delete session.user.image;

      const bawa = [
        "id",
        "username",
        "name",
        "role_id",
        "role_name",
        "access_department",
        "access_sub_department",
        "menu",
        "accessToken",
      ];

      bawa.forEach((key) => {
        if (key in token) {
          session.user[key] = token[key];
        }
      });

      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
};
