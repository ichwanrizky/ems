"use server";

import { AttendanceData } from "@/libs/AttendanceData";
import { authOptions } from "@/libs/AuthOptions";
import {
  ConvertDateZeroHours,
  DateMinus7Format,
  DatePlus7Format,
} from "@/libs/ConvertDate";
import { HandleError } from "@/libs/Error";
import prisma from "@/libs/Prisma";
import { AttendanceMonthlyProps } from "@/types";
import { getServerSession } from "next-auth";

type PegawaiAbsen = {
  id: number;
  nama: string;
};

export const getPegawaiAbsen = async (
  department: number | string
): Promise<{
  status: boolean;
  message: string;
  data: PegawaiAbsen[] | [];
}> => {
  try {
    const result = (await prisma.pegawai.findMany({
      select: {
        id: true,
        nama: true,
      },
      where: {
        is_active: true,
        is_deleted: false,
        department_id: Number(department),
      },
      orderBy: {
        nama: "asc",
      },
    })) as PegawaiAbsen[];

    if (!result) {
      return {
        status: false,
        message: "Data not found",
        data: [],
      };
    }

    return {
      status: true,
      message: "Data fetched successfully",
      data: result,
    };
  } catch (error) {
    return HandleError(error) as any;
  }
};

export const getAbsensiPerpegawai = async (filter: {
  bulan: number;
  tahun: number;
  pegawai: string | number;
}): Promise<{
  status: boolean;
  message: string;
  data: AttendanceMonthlyProps[] | [];
}> => {
  try {
    const result = await AttendanceData(
      Number(filter.tahun),
      Number(filter.bulan),
      Number(filter.pegawai)
    );

    if (!result) {
      return {
        status: false,
        message: "Data not found",
        data: [],
      };
    }

    return {
      status: true,
      message: "Data fetched successfully",
      data: result as AttendanceMonthlyProps[],
    };
  } catch (error) {
    return HandleError(error) as any;
  }
};

export const createAbsensiPerpegawai = async (data: {
  date: string | Date;
  pegawai_id: number;
  absen_masuk: string;
  absen_pulang: string;
}): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const session: any = await getServerSession(authOptions);

    const [hours_masuk, minutes_masuk, seconds_masuk] = data.absen_masuk
      .split(":")
      .map(Number);

    const [hours_pulang, minutes_pulang, seconds_pulang] = data.absen_pulang
      .split(":")
      .map(Number);

    const absen_masuk = new Date(data.date as Date);
    absen_masuk.setHours(hours_masuk, minutes_masuk, seconds_masuk);

    const absen_pulang = new Date(data.date as Date);
    absen_pulang.setHours(hours_pulang, minutes_pulang, seconds_pulang);

    const result = await prisma.$transaction(async (prisma) => {
      const shift = await prisma.pegawai.findFirst({
        select: {
          shift_id: true,
          shift: {
            select: {
              jam_masuk: true,
            },
          },
        },
        where: {
          id: data.pegawai_id,
        },
      });

      if (!shift) {
        return false;
      }

      const jam_masuk_department = shift.shift?.jam_masuk as Date;
      jam_masuk_department.setFullYear(
        ConvertDateZeroHours(data.date as Date).getFullYear()
      );
      jam_masuk_department.setMonth(
        ConvertDateZeroHours(data.date as Date).getMonth()
      );
      jam_masuk_department.setDate(
        ConvertDateZeroHours(data.date as Date).getDate()
      );

      const absenMasukWithoutSecond = ConvertDateZeroHours(data.date as Date);
      absenMasukWithoutSecond.setHours(
        DatePlus7Format(absen_masuk as Date).getHours(),
        DatePlus7Format(absen_masuk as Date).getMinutes()
      );

      const difference =
        (absenMasukWithoutSecond as any) - (jam_masuk_department as any);

      const differenceInMinutes = Math.round(difference / 60000);

      let late = 0;
      if (differenceInMinutes > 0) late = differenceInMinutes;

      await prisma.absen.create({
        data: {
          pegawai_id: data.pegawai_id,
          tanggal: ConvertDateZeroHours(data.date as Date),
          shift_id: shift.shift_id,
          bulan: ConvertDateZeroHours(data.date as Date).getMonth() + 1,
          tahun: ConvertDateZeroHours(data.date as Date).getFullYear(),
          ...(data.absen_masuk && {
            absen_masuk: DatePlus7Format(absen_masuk as Date),
            ket_masuk: `ABSEN MANUAL BY: ${session.user.username}`,
          }),
          ...(data.absen_pulang && {
            absen_pulang: DatePlus7Format(absen_pulang as Date),
            ket_pulang: `ABSEN MANUAL BY: ${session.user.username}`,
          }),
          late,
        },
      });

      return true;
    });

    if (!result) {
      return {
        status: false,
        message: "Add data failed",
      };
    }

    return {
      status: true,
      message: "Add data successfully",
    };
  } catch (error) {
    return HandleError(error) as any;
  }
};

export const editAbsensiPerpegawai = async (data: {
  date: string | Date;
  pegawai_id: number;
  absen_id: string | number;
  absen_masuk: string;
  absen_pulang: string;
}): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const session: any = await getServerSession(authOptions);

    const [hours_masuk, minutes_masuk, seconds_masuk] = data.absen_masuk
      .split(":")
      .map(Number);

    const [hours_pulang, minutes_pulang, seconds_pulang] = data.absen_pulang
      .split(":")
      .map(Number);

    const absen_masuk = new Date(data.date as Date);
    absen_masuk.setHours(hours_masuk, minutes_masuk, seconds_masuk);

    const absen_pulang = new Date(data.date as Date);
    absen_pulang.setHours(hours_pulang, minutes_pulang, seconds_pulang);

    const result = await prisma.$transaction(async (prisma) => {
      const shift = await prisma.pegawai.findFirst({
        select: {
          shift_id: true,
          shift: {
            select: {
              jam_masuk: true,
            },
          },
        },
        where: {
          id: data.pegawai_id,
        },
      });

      if (!shift) {
        return false;
      }

      const jam_masuk_department = shift.shift?.jam_masuk as Date;
      jam_masuk_department.setFullYear(
        ConvertDateZeroHours(data.date as Date).getFullYear()
      );
      jam_masuk_department.setMonth(
        ConvertDateZeroHours(data.date as Date).getMonth()
      );
      jam_masuk_department.setDate(
        ConvertDateZeroHours(data.date as Date).getDate()
      );

      const absenMasukWithoutSecond = ConvertDateZeroHours(data.date as Date);
      absenMasukWithoutSecond.setHours(
        DatePlus7Format(absen_masuk as Date).getHours(),
        DatePlus7Format(absen_masuk as Date).getMinutes()
      );

      const difference =
        (absenMasukWithoutSecond as any) - (jam_masuk_department as any);

      const differenceInMinutes = Math.round(difference / 60000);

      let late = 0;
      if (differenceInMinutes > 0) late = differenceInMinutes;

      await prisma.absen.update({
        where: {
          id: Number(data.absen_id),
        },
        data: {
          pegawai_id: data.pegawai_id,
          tanggal: ConvertDateZeroHours(data.date as Date),
          shift_id: shift.shift_id,
          bulan: ConvertDateZeroHours(data.date as Date).getMonth() + 1,
          tahun: ConvertDateZeroHours(data.date as Date).getFullYear(),
          ...(data.absen_masuk
            ? {
                absen_masuk: DatePlus7Format(absen_masuk as Date),
                ket_masuk: `ABSEN MANUAL BY: ${session.user.username}`,
              }
            : {
                absen_masuk: null,
                ket_masuk: `ABSEN MANUAL BY: ${session.user.username}`,
              }),
          ...(data.absen_pulang
            ? {
                absen_pulang: DatePlus7Format(absen_pulang as Date),
                ket_pulang: `ABSEN MANUAL BY: ${session.user.username}`,
              }
            : {
                absen_pulang: null,
                ket_pulang: `ABSEN MANUAL BY: ${session.user.username}`,
              }),
          late,
        },
      });

      return true;
    });

    if (!result) {
      return {
        status: false,
        message: "Edit data failed",
      };
    }

    return {
      status: true,
      message: "Edit data successfully",
    };
  } catch (error) {
    return HandleError(error) as any;
  }
};

export const deleteAbsensiPerpegawai = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const result = await prisma.absen.delete({
      where: {
        id,
      },
    });

    if (!result) {
      return {
        status: false,
        message: "Delete data failed",
      };
    }

    return {
      status: true,
      message: "Delete data successfully",
    };
  } catch (error) {
    return HandleError(error);
  }
};
