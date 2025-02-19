import { checkSessionMobile } from "@/libs/CheckSessionMobile";
import { NextResponse } from "next/server";
import prisma from "@/libs/Prisma";
import { HandleErrorMobile } from "@/libs/ErrorMobile";
import { DateNowFormat } from "@/libs/DateFormat";

export async function GET(req: Request) {
  try {
    const authorization = req.headers.get("Authorization");
    const session = await checkSessionMobile(authorization);
    if (!session[0]) {
      return new NextResponse(
        JSON.stringify({
          status: false,
          message: "Unauthorized",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const checkAksesIzin = await prisma.pegawai.findFirst({
      select: {
        sub_department: {
          include: {
            akses_izin: true,
          },
        },
      },
      where: {
        id: session[1].pegawaiId,
        sub_department: {
          akses_izin: {
            some: {},
          },
        },
      },
    });

    if (!checkAksesIzin) {
      return new NextResponse(
        JSON.stringify({
          status: false,
          message: "Unauthorized",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const existSession = await prisma.request_session_izin.findFirst({
      where: {
        pegawai_id: session[1].pegawaiId,
        AND: [
          {
            expired_at: {
              gte: DateNowFormat(),
            },
          },
          {
            expired: false,
          },
        ],
      },
    });

    if (existSession) {
      return new NextResponse(
        JSON.stringify({
          status: true,
          message: "Request Success",
          data: {
            ...existSession,
            url: `${process.env.NEXTAUTH_URL}/pengajuan-izin/${existSession.uuid}`,
          },
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const expiredDate = new Date(DateNowFormat());
    expiredDate.setHours(expiredDate.getHours() + 1);

    const createSession = await prisma.request_session_izin.create({
      data: {
        pegawai_id: session[1].pegawaiId,
        created_at: DateNowFormat(),
        expired_at: expiredDate,
      },
    });

    if (!createSession) {
      return new NextResponse(
        JSON.stringify({
          status: false,
          message: "Request Failed",
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
        message: "Request Success",
        data: {
          ...createSession,
          url: `${process.env.NEXTAUTH_URL}/pengajuan-izin/${createSession.uuid}`,
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
    return HandleErrorMobile(error);
  }
}
