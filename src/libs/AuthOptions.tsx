import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/libs/Prisma";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    // 1h
    maxAge: 60 * 60 * 8,
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

        const result = await prisma.user.findFirst({
          select: {
            id: true,
            username: true,
            roles: {
              select: {
                role_name: true,
                access_department: {
                  select: {
                    department: {
                      select: {
                        id: true,
                        nama_department: true,
                      },
                    },
                  },
                },
                access_sub_department: {
                  select: {
                    sub_department: {
                      select: {
                        id: true,
                        nama_sub_department: true,
                      },
                    },
                  },
                },
                access: {
                  select: {
                    menu: {
                      select: {
                        id: true,
                        menu: true,
                        path: true,
                      },
                    },
                    view: true,
                    insert: true,
                    update: true,
                    delete: true,
                  },
                  orderBy: [
                    {
                      menu: {
                        menu_group: {
                          urut: "asc",
                        },
                      },
                    },
                    {
                      menu: {
                        urut: "asc",
                      },
                    },
                  ],
                },
              },
            },
          },
          where: {
            username,
            password,
            is_deleted: false,
          },
        });

        if (result) {
          return {
            id: result.id.toString(),
            username: result.username,
            roles: result.roles,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile, user }: any) {
      if (account?.provider === "credentials") {
        token.id = user.id;
        token.username = user.username;
        token.roles = user.roles;
      }

      return token;
    },

    async session({ session, token }: any) {
      delete session.user.email;
      delete session.user.name;
      delete session.user.image;

      if ("id" in token) {
        session.user.id = token.id;
      }

      if ("username" in token) {
        session.user.username = token.username;
      }

      if ("roles" in token) {
        session.user.roles = token.roles;
      }

      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
};
