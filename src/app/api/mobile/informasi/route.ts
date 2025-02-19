import { checkSessionMobile } from "@/libs/CheckSessionMobile";
import { NextResponse } from "next/server";
import prisma from "@/libs/Prisma";
import { HandleErrorMobile } from "@/libs/ErrorMobile";
import { ConvertDateZeroHours } from "@/libs/ConvertDate";
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

    const dataAbsenNow = await prisma.absen.findFirst({
      where: {
        pegawai_id: session[1].pegawaiId,
        tanggal: ConvertDateZeroHours(DateNowFormat()),
      },
    });

    if (!dataAbsenNow) {
      var dataAbsen = {
        absen_masuk: "Belum Absen",
        absen_pulang: "Belum Absen",
      };
    } else {
      var dataAbsen = {
        absen_masuk: dataAbsenNow.absen_masuk
          ? new Date(dataAbsenNow.tanggal as any).toLocaleString(
              "id-ID",
              optionsDate2
            ) +
            " " +
            new Date(dataAbsenNow.absen_masuk)
              .toLocaleString("id-ID", optionsDate)
              .replaceAll(".", ":")
          : "Belum Absen",
        absen_pulang: dataAbsenNow.absen_pulang
          ? new Date(dataAbsenNow.tanggal as any).toLocaleString(
              "id-ID",
              optionsDate2
            ) +
            " " +
            new Date(dataAbsenNow.absen_pulang)
              .toLocaleString("id-ID", optionsDate)
              .replaceAll(".", ":")
          : "Belum Absen",
      };
    }

    const dataInfo = await prisma.pegawai.findFirst({
      select: {
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
      where: {
        id: session[1].pegawaiId,
      },
    });

    if (!dataInfo) {
      return new NextResponse(
        JSON.stringify({
          status: false,
          message: "Data not found",
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new NextResponse(
      JSON.stringify({
        status: true,
        message: "Success",
        data: {
          dataAbsen,
          dataInfo: {
            tanggal: new Date(DateNowFormat()).toLocaleString(
              "id-ID",
              optionsDate3
            ),
            shift:
              new Date(dataInfo.shift?.jam_masuk as any)
                .toLocaleString("id-ID", optionsDate)
                .replaceAll(".", ":") +
              " - " +
              new Date(dataInfo.shift?.jam_pulang as any)
                .toLocaleString("id-ID", optionsDate)
                .replaceAll(".", ":"),
            department: dataInfo.department?.nama_department.toUpperCase(),
          },
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

const optionsDate: any = {
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  timeZone: "UTC",
};

const optionsDate2: any = {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
};

const optionsDate3: any = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
};
