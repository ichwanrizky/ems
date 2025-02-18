import { checkSessionMobile } from "@/libs/CheckSessionMobile";
import { NextResponse } from "next/server";
import prisma from "@/libs/Prisma";
import { HandleErrorMobile } from "@/libs/ErrorMobile";

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

    const result = await prisma.pengajuan_izin.findMany({
      select: {
        jenis_izin: {
          select: {
            jenis: true,
          },
        },
        keterangan: true,
        tanggal: true,
        status: true,
      },
      where: {
        pegawai_id: session[1].pegawaiId,
      },
      orderBy: {
        id: "desc",
      },
      take: 30,
    });

    if (!result) {
      return new NextResponse(
        JSON.stringify({
          status: false,
          message: "Data not found",
          data: [],
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const convertedData = result.map((item) => ({
      ...item,
      jenis_izin: item.jenis_izin.jenis,
      tanggal: new Date(item.tanggal as Date).toLocaleString(
        "id-ID",
        optionsDate
      ),
    }));

    return new NextResponse(
      JSON.stringify({
        status: true,
        message: "success",
        data: convertedData,
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

const optionsDate: any = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
};
