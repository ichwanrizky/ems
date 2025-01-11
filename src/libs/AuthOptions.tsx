import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/libs/Prisma";
const bcrypt = require("bcrypt");

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8, // 8 hours
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

        const result = await prisma.$transaction(async (prisma) => {
          const user = await prisma.user.findFirst({
            select: {
              id: true,
              username: true,
              password: true,
              roles: {
                select: {
                  id: true,
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
                          department_id: true,
                        },
                      },
                    },
                  },
                },
              },
            },
            where: {
              username,
              is_deleted: false,
            },
          });

          // check password
          const checkPassword = await bcrypt.compare(password, user?.password);

          const menu = await prisma.menu_group.findMany({
            select: {
              id: true,
              menu_group: true,
              group: true,
              parent_id: true,
              menu: {
                select: {
                  id: true,
                  menu: true,
                  path: true,
                  access: {
                    select: {
                      view: true,
                      insert: true,
                      update: true,
                      delete: true,
                    },
                  },
                },
                where: {
                  access: {
                    some: {
                      role_id: user?.roles?.id,
                    },
                  },
                },
                orderBy: {
                  urut: "asc",
                },
              },
            },
            where: {
              menu: {
                some: {
                  access: {
                    some: {
                      role_id: user?.roles?.id,
                    },
                  },
                },
              },
            },
            orderBy: [
              {
                urut: "asc",
              },
            ],
          });

          return { user, menu, checkPassword };
        });

        if (result.user && result.menu.length > 0 && result.checkPassword) {
          return {
            id: result.user.id.toString(),
            username: result.user.username,
            role_id: result.user.roles?.id,
            role_name: result.user.roles?.role_name,
            access_department: result.user.roles?.access_department,
            access_sub_department: result.user.roles?.access_sub_department,
            menu: result.menu,
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
        token.role_id = user.role_id;
        token.role_name = user.role_name;
        token.access_department = user.access_department;
        token.access_sub_department = user.access_sub_department;
        token.menu = user.menu;

        return token;
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

      if ("role_id" in token) {
        session.user.role_id = token.role_id;
      }

      if ("role_name" in token) {
        session.user.role_name = token.role_name;
      }

      if ("access_department" in token) {
        session.user.access_department = token.access_department;
      }

      if ("access_sub_department" in token) {
        session.user.access_sub_department = token.access_sub_department;
      }

      if ("menu" in token) {
        session.user.menu = token.menu;
      }

      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
};
