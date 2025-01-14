"use server";

import { HandleError } from "@/libs/Error";
import prisma from "@/libs/Prisma";
import { AbsenProps } from "@/types";

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
  data: AbsenProps[] | [];
}> => {
  try {
    const result = (await prisma.pegawai.findMany({
      select: {
        id: true,
        nama: true,
        absen: {
          select: {
            id: true,
            tanggal: true,
            absen_masuk: true,
            absen_pulang: true,
            late: true,
          },
          where: {
            bulan: filter.bulan,
            tahun: filter.tahun,
            pegawai_id: Number(filter.pegawai),
          },
        },
      },
      where: {
        is_active: true,
        is_deleted: false,
        id: Number(filter.pegawai),
      },
      orderBy: {
        nama: "asc",
      },
    })) as AbsenProps[];

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
