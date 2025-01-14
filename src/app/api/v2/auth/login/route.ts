import { DateNowFormat } from "@/libs/DateFormat";
import prisma from "@/libs/Prisma";
import { NextResponse } from "next/server";

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { username, password } = body;

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

    const result = await prisma.user.findFirst({
      select: {
        id: true,
        username: true,
        password: true,
        pegawai: {
          select: {
            id: true,
            nama: true,
            position: true,
            department: {
              select: {
                nama_department: true,
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
        is_deleted: false,
        pegawai: {
          is_active: true,
          is_deleted: false,
        },
      },
    });

    // invalid username
    if (!result) {
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

    // check password
    const checkPassword = await bcrypt.compare(password, result.password);
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

    // session active
    if (
      result.session_mobile.length > 0 &&
      result.session_mobile[0].expired === false
    ) {
      return new NextResponse(
        JSON.stringify({
          status: false,
          message:
            "The session is active. Kindly report this to the administrator.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const data = {
      id: result.id,
      pegawai_id: result.pegawai?.id,
      username: result.username,
      name: result.pegawai?.nama?.toUpperCase(),
      position: result.pegawai?.position?.toUpperCase(),
      department: result.pegawai?.department?.nama_department?.toUpperCase(),
    };

    const token = await jwt.sign({ data: data }, process.env.JWT);

    // insert session
    const session = await prisma.session_mobile.create({
      data: {
        user_id: result.id,
        token: token,
        created_at: DateNowFormat(),
      },
    });

    if (!session) {
      return new NextResponse(
        JSON.stringify({
          status: false,
          message: "Something went wrong, please try again",
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
          ...data,
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
    return new NextResponse(
      JSON.stringify({
        status: false,
        message: "Internal server error",
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
