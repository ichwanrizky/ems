"use server";
import { HandleError } from "@/libs/Error";
import prisma from "@/libs/Prisma";

type PphProps = {
  id: number;
  gaji: number;
  pph21: number;
  pegawai: {
    id: number;
    nama: string;
    npwp: string;
  };
};

export const getPph = async (
  search?: string,
  filter?: {
    department: string | number;
    tahun: string | number;
    bulan: string | number;
  }
): Promise<{
  status: boolean;
  message: string;
  data: PphProps[] | [];
}> => {
  try {
    const result = await prisma.pph21.findMany({
      select: {
        id: true,
        gaji: true,
        pph21: true,
        pegawai: {
          select: {
            id: true,
            nama: true,
            npwp: true,
          },
        },
      },
      where: {
        department_id: Number(filter?.department),
        bulan: Number(filter?.bulan),
        tahun: Number(filter?.tahun),
        ...(search && {
          pegawai: {
            nama: {
              contains: search,
            },
          },
        }),
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
      data: result as PphProps[],
    };
  } catch (error) {
    return HandleError(error) as any;
  }
};
