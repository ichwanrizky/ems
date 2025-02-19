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

    const result = await prisma.gaji_pegawai.findMany({
      select: {
        tahun: true,
        bulan: true,
        nominal: true,
        publish: true,
        uuid: true,
        pegawai: {
          select: {
            id: true,
            nama: true,
            status_nikah: true,
            position: true,
          },
        },
        department: {
          select: {
            nama_department: true,
          },
        },
        gaji: {
          orderBy: {
            urut: "asc",
          },
        },
      },
      where: {
        pegawai_id: session[1].pegawaiId,
      },
      orderBy: [
        {
          tahun: "desc",
        },
        {
          bulan: "desc",
        },
      ],
      take: 12,
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

    const newData = result.map((item) => {
      return {
        bulan: monthNames(item.bulan),
        tahun: item.tahun,
        gaji: item.nominal,
        slipStatus: item.publish,
        url: `${process.env.NEXTAUTH_URL}/slipgaji/${item.uuid}`,
      };
    });

    return new NextResponse(
      JSON.stringify({
        status: true,
        message: "success",
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

const monthNames = (month: number) => {
  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Augustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  return monthNames[month - 1];
};
