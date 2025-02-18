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

    const result = await prisma.absen.findMany({
      where: {
        pegawai_id: session[1].pegawaiId,
      },
      orderBy: {
        tanggal: "desc",
      },
      take: 70,
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

    const newData = result.map((item) => ({
      tanggal: new Date(item.tanggal as Date).toLocaleString(
        "id-ID",
        optionsDate2
      ),
      absenMasuk: item.absen_masuk
        ? new Date(item.absen_masuk as Date)
            .toLocaleString("id-ID", optionsDate)
            .replaceAll(".", ":")
        : "",
      absenPulang: item.absen_pulang
        ? new Date(item.absen_pulang as Date)
            .toLocaleString("id-ID", optionsDate)
            .replaceAll(".", ":")
        : "",
      late: item.late,
    }));

    return new NextResponse(
      JSON.stringify({
        status: true,
        message: "Success",
        data: newData,
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
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  timeZone: "UTC",
};

const optionsDate2: any = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
};
