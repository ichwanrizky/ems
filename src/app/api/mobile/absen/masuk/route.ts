import { checkSessionMobile } from "@/libs/CheckSessionMobile";
import { NextResponse } from "next/server";
import prisma from "@/libs/Prisma";
import { DateNowFormat } from "@/libs/DateFormat";
import { ConvertDateZeroHours2, DatePlus7Format } from "@/libs/ConvertDate";
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
        shift: true,
      },
      where: {
        pegawai: {
          some: {
            id: session[1].pegawaiId,
          },
        },
      },
    });

    if (
      !dataDepartment ||
      !dataDepartment.latitude ||
      !dataDepartment.longitude
    ) {
      return new NextResponse(
        JSON.stringify({
          status: false,
          message: "Unauthorized, Department pegawai belum diset",
        }),
        {
          status: 400,
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
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (dataDepartment.id == 1) {
      // TODO: DEPT PANJI JAYA / FIX SHIFT

      if (!dataDepartment.pegawai[0].shift) {
        return new NextResponse(
          JSON.stringify({
            status: false,
            message: "Unauthorized, Shift pegawai belum diset",
          }),
          {
            status: 400,
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
            status: 400,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      const shiftTime = new Date(
        dataDepartment?.pegawai?.[0]?.shift?.jam_masuk as any
      );
      const hours = shiftTime.getUTCHours();
      const minutes = shiftTime.getUTCMinutes();
      const seconds = shiftTime.getUTCSeconds();

      let jam_masuk_department = new Date();
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
            status: 400,
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
            status: 400,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      let late = 0;
      if (differenceInMinutes > 0) late = differenceInMinutes;

      const libur = await prisma.tanggal_merah_list.findFirst({
        select: {
          id: true,
        },
        where: {
          tanggal_merah: {
            department_id: dataDepartment.id,
          },
          tanggal: ConvertDateZeroHours2(DateNowFormat()),
        },
      });

      if (libur) late = 0;

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
          message: "Berhasil absen masuk",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } else {
      // TODO: OTHER DEPT / FLEXIBLE SHIFT
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
            status: 400,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      const shiftQuery = `SELECT
        id,
          keterangan,
          jam_masuk,
          jam_pulang,
          ABS(
            TIMESTAMPDIFF(
              MINUTE,
              CURRENT_TIME (),
            STR_TO_DATE( jam_masuk, '%H:%i' ))) AS diff_minutes 
        FROM
          shift 
        WHERE
          department_id = ${dataDepartment.id} 
        ORDER BY
          diff_minutes ASC 
          LIMIT 1`;

      const shiftData = (await prisma.$queryRawUnsafe(shiftQuery)) as {
        id: number;
        keterangan: string;
        jam_masuk: any;
        jam_pulang: any;
        diff_minutes: number;
      }[];

      if (!shiftData[0]) {
        return new NextResponse(
          JSON.stringify({
            status: false,
            message: "Gagal, Shift pegawai belum diset",
          }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      const shiftTime = new Date(shiftData[0].jam_masuk as any);
      const hours = shiftTime.getUTCHours();
      const minutes = shiftTime.getUTCMinutes();
      const seconds = shiftTime.getUTCSeconds();

      let jam_masuk_department = new Date();
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
            status: 400,
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
            status: 400,
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
          shift_id: shiftData[0].id,
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
          message: "Berhasil absen masuk",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
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
