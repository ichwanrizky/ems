"use server";

import { authOptions } from "@/libs/AuthOptions";
import { HandleError } from "@/libs/Error";
import prisma from "@/libs/Prisma";
import { ThrProps } from "@/types";
import { getServerSession } from "next-auth";

export const getThr = async (
  search: string,
  filter: {
    department: string | number;
    tahun: string | number;
    bulan: string | number;
  }
): Promise<{
  status: boolean;
  message: string;
  data: ThrProps[] | [];
}> => {
  try {
    const result = (await prisma.thr.findMany({
      select: {
        id: true,
        uuid: true,
        bulan: true,
        tahun: true,
        department_id: true,
        pegawai_id: true,
        thr: true,
        pph21: true,
        net_thr: true,
        pegawai: {
          select: {
            nama: true,
          },
        },
        department: {
          select: {
            nama_department: true,
          },
        },
      },
      where: {
        department_id: Number(filter.department),
        tahun: Number(filter.tahun),
        bulan: Number(filter.bulan),
        ...(search && {
          pegawai: {
            nama: {
              contains: search,
            },
          },
        }),
      },
      orderBy: {
        pegawai: {
          nama: "asc",
        },
      },
    })) as ThrProps[];

    return {
      status: true,
      message: "Data fetched successfully",
      data: result,
    };
  } catch (error) {
    return HandleError(error) as any;
  }
};

export const deleteThr = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const session: any = await getServerSession(authOptions);

    await prisma.thr.delete({
      where: { id },
    });

    return {
      status: true,
      message: "Data deleted successfully",
    };
  } catch (error) {
    return HandleError(error) as any;
  }
};

export const exportExcelThr = async (
  search: string,
  filter: {
    department: string | number;
    tahun: string | number;
    bulan: string | number;
  }
): Promise<{
  status: boolean;
  message: string;
  data: ThrProps[] | [];
}> => {
  return getThr(search, filter);
};
