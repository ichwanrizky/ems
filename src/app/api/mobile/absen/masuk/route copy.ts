import { checkSessionMobile } from "@/libs/CheckSessionMobile";
import { NextResponse } from "next/server";
import prisma from "@/libs/Prisma";
import { DateNowFormat } from "@/libs/DateFormat";
import {
  ConvertDateZeroHours,
  ConvertDateZeroHours2,
  DatePlus7Format,
} from "@/libs/ConvertDate";
import { HandleErrorMobile } from "@/libs/ErrorMobile";

export async function POST(req: Request) {
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

    const body = await req.formData();
    const latitude = body.get("latitude")?.toString();
    const longitude = body.get("longitude")?.toString();

    const dataDepartment = await prisma.department.findFirst({
      include: {
        pegawai: {
          where: {
            id: session[1].pegawaiId,
          },
          select: {
            shift: true,
          },
        },
      },
      where: {
        pegawai: {
          some: {
            id: session[1].pegawaiId,
          },
        },
      },
    });

    if (!dataDepartment || !dataDepartment.pegawai[0].shift) {
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

    const distance = calculateDistance(
      dataDepartment.latitude,
      dataDepartment.longitude,
      latitude,
      longitude
    );

    if (distance > Number(dataDepartment.radius)) {
      return new NextResponse(
        JSON.stringify({
          status: false,
          message: "Gagal, Anda belum berada di dalam zona absen",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const getAbsen = await prisma.absen.findFirst({
      where: {
        pegawai_id: session[1].pegawaiId,
        tanggal: ConvertDateZeroHours2(DateNowFormat()),
      },
    });

    if (getAbsen) {
      return new NextResponse(
        JSON.stringify({
          status: false,
          message: "Gagal, absen sudah dilakukan",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    let jam_masuk_department = new Date();

    const shiftTime = new Date(
      dataDepartment?.pegawai?.[0]?.shift?.jam_masuk as any
    );

    const hours = shiftTime.getUTCHours();
    const minutes = shiftTime.getUTCMinutes();
    const seconds = shiftTime.getUTCSeconds();

    jam_masuk_department.setHours(hours, minutes, seconds, 0);
    jam_masuk_department = DatePlus7Format(jam_masuk_department);

    const absenMasukWithoutSecond = new Date(DateNowFormat());
    absenMasukWithoutSecond.setSeconds(0);
    absenMasukWithoutSecond.setMilliseconds(0);

    const difference =
      (absenMasukWithoutSecond as any) - (jam_masuk_department as any);

    const differenceInMinutes = Math.round(difference / 60000);

    if (differenceInMinutes >= 300) {
      return new NextResponse(
        JSON.stringify({
          status: false,
          message: "Gagal, anda melewati batas jam absensi masuk",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (differenceInMinutes < -120) {
      return new NextResponse(
        JSON.stringify({
          status: false,
          message: "Gagal, anda belum dapat melakukan absensi masuk",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    let late = 0;
    if (differenceInMinutes > 0) late = differenceInMinutes;

    const createAbsen = await prisma.absen.create({
      data: {
        pegawai_id: session[1].pegawaiId,
        tanggal: ConvertDateZeroHours2(DateNowFormat()),
        absen_masuk: DateNowFormat(),
        shift_id: dataDepartment.pegawai[0]?.shift?.id
          ? dataDepartment.pegawai[0]?.shift?.id
          : 0,
        bulan: new Date(DateNowFormat()).getMonth() + 1,
        tahun: new Date(DateNowFormat()).getFullYear(),
        latitude: latitude,
        longitude: longitude,
        late: late,
      },
    });

    if (!createAbsen) {
      return new NextResponse(
        JSON.stringify({
          status: false,
          message: "Gagal melakukan absen",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new NextResponse(
      JSON.stringify({
        status: true,
        message: "Berhasil absen masuk",
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

function calculateDistance(lat1: any, lon1: any, lat2: any, lon2: any) {
  function toRad(x: any) {
    return (x * Math.PI) / 180;
  }

  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance * 1000;
}
