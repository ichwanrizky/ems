"use server";

import { HandleError } from "@/libs/Error";
import prisma from "@/libs/Prisma";

export type SlipThrDataProps = {
  id: number;
  uuid: string;
  bulan: number;
  tahun: number;
  thr: number;
  pph21: number;
  net_thr: number;
  pegawai: {
    nama: string;
    position: string;
  };
  department: {
    nama_department: string;
  };
};

export const getSlipThr = async (
  uuid: string
): Promise<{
  status: boolean;
  message: string;
  data: SlipThrDataProps | null;
}> => {
  try {
    const result = await prisma.thr.findFirst({
      select: {
        id: true,
        uuid: true,
        bulan: true,
        tahun: true,
        thr: true,
        pph21: true,
        net_thr: true,
        pegawai: {
          select: {
            nama: true,
            position: true,
          },
        },
        department: {
          select: {
            nama_department: true,
          },
        },
      },
      where: { uuid },
    });

    if (!result) {
      return { status: false, message: "Data not found", data: null };
    }

    return {
      status: true,
      message: "Data fetched successfully",
      data: result as SlipThrDataProps,
    };
  } catch (error) {
    return HandleError(error) as any;
  }
};
