import { NextResponse } from "next/server";
import prisma from "@/libs/Prisma";
import { DateNowFormat } from "@/libs/DateFormat";

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

export async function POST(req: Request) {
  try {
    const body = await req.formData();
    const username = body.get("username")?.toString();
    const password = body.get("password")?.toString();

    if (!username || !password) {
      return new NextResponse(
        JSON.stringify({
          status: false,
          message: "Missing username and password",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const getUser = await prisma.user.findFirst({
      include: {
        pegawai: {
          select: {
            id: true,
            nama: true,
            department: {
              select: {
                nama_department: true,
              },
            },
            shift: {
              select: {
                jam_masuk: true,
                jam_pulang: true,
              },
            },
          },
        },
        session_mobile: {
          select: {
            expired: true,
          },
          orderBy: {
            id: "desc",
          },
          take: 1,
        },
      },
      where: {
        username: username,
        pegawai_id: {
          not: null,
        },
        pegawai: {
          is_active: true,
          is_deleted: false,
        },
      },
    });

    // invalid username
    if (!getUser) {
      return new NextResponse(
        JSON.stringify({
          status: false,
          message: "Invalid username or password",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // session active
    if (
      getUser.session_mobile.length > 0 &&
      getUser.session_mobile[0].expired === false
    ) {
      return new NextResponse(
        JSON.stringify({
          status: false,
          message: "Session active",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // check password
    const checkPassword = await bcrypt.compare(password, getUser.password);

    // invalid password
    if (!checkPassword) {
      return new NextResponse(
        JSON.stringify({
          status: false,
          message: "Invalid username or password",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // new json
    const newDataUser = {
      id: getUser.id,
      username: getUser.username,
      pegawaiId: getUser.pegawai?.id,
      pegawaiName: getUser.pegawai?.nama.toUpperCase(),
      department: getUser.pegawai?.department?.nama_department.toUpperCase(),
    };

    // generate token
    const token = await jwt.sign({ data: newDataUser }, process.env.JWT);

    // insert session
    const session = await prisma.session_mobile.create({
      data: {
        user_id: getUser.id,
        token: token,
        created_at: DateNowFormat(),
      },
    });

    if (!session) {
      return new NextResponse(
        JSON.stringify({
          status: false,
          message: "Failed to create session",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new NextResponse(
      JSON.stringify({
        status: true,
        message: "Login success",
        data: {
          ...newDataUser,
          accessToken: token,
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    if (error instanceof Error) {
      return new NextResponse(
        JSON.stringify({
          status: false,
          message: error.message,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new NextResponse(
      JSON.stringify({
        status: false,
        message: "Internal Server Error, Please try again later",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
