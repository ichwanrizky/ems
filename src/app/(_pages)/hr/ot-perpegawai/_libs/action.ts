"use server";
import { HandleError } from "@/libs/Error";
import prisma from "@/libs/Prisma";
import { OvertimeMonthlyProps } from "@/types";

export const getOvertimePegawai = async (filter: {
  bulan: number;
  tahun: number;
  pegawai: string | number;
}): Promise<{
  status: boolean;
  message: string;
  data: OvertimeMonthlyProps[] | [];
}> => {
  try {
    const result = await prisma.overtime.findMany({
      select: {
        id: true,
        tanggal: true,
        pegawai: {
          select: {
            nama: true,
          },
        },
        jam: true,
        total: true,
        is_holiday: true,
      },
      where: {
        pegawai_id: Number(filter.pegawai),
        bulan: Number(filter.bulan),
        tahun: Number(filter.tahun),
      },
      orderBy: {
        tanggal: "asc",
      },
    });

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
      data: result as OvertimeMonthlyProps[],
    };
  } catch (error) {
    return HandleError(error) as any;
  }
};

export const deleteOvertimePegawai = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const result = await prisma.$transaction(async (prisma) => {
      const resultDelete = await prisma.overtime.delete({
        select: {
          pegawai_id: true,
          pengajuan_overtime_id: true,
        },
        where: {
          id,
        },
      });

      if (!resultDelete) return false;

      await prisma.pengajuan_overtime_pegawai.deleteMany({
        where: {
          pengajuan_overtime_id: resultDelete.pengajuan_overtime_id,
          pegawai_id: resultDelete.pegawai_id,
        },
      });

      if (!resultDelete) return false;

      return true;
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
