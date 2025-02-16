"use server";
import { authOptions } from "@/libs/AuthOptions";
import { HandleError } from "@/libs/Error";
import prisma from "@/libs/Prisma";
import { OvertimeMonthlyProps } from "@/types";
import { getServerSession } from "next-auth";

type PegawaiAbsen = {
  id: number;
  nama: string;
};
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

export const getPegawaiOvertime = async (
  department: number | string
): Promise<{
  status: boolean;
  message: string;
  data: PegawaiAbsen[] | [];
}> => {
  try {
    const session: any = await getServerSession(authOptions);

    const result = (await prisma.pegawai.findMany({
      select: {
        id: true,
        nama: true,
      },
      where: {
        is_active: true,
        is_deleted: false,
        department_id: Number(department),
        sub_department_id: {
          in: session.user.access_sub_department.map(
            (item: any) => item.sub_department.id
          ),
        },
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
