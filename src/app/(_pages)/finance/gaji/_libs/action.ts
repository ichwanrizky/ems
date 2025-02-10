"use server";
import { HandleError } from "@/libs/Error";
import prisma from "@/libs/Prisma";

export const getPegawaiGaji = async (
  department_id: number,
  bulan: number,
  tahun: number
): Promise<{
  status: boolean;
  message: string;
  data:
    | {
        id: number;
        nama: string;
      }[];
}> => {
  try {
    const result = await prisma.pegawai.findMany({
      select: {
        id: true,
        nama: true,
      },
      where: {
        is_active: true,
        is_deleted: false,
        department_id: department_id,
        gaji_pegawai: {
          none: {
            bulan: bulan,
            tahun: tahun,
          },
        },
      },
      orderBy: {
        nama: "asc",
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
      data: result,
    };
  } catch (error) {
    return HandleError(error) as any;
  }
};
