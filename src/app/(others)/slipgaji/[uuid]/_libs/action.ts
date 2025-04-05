"use server";

import { HandleError } from "@/libs/Error";
import prisma from "@/libs/Prisma";
import { SlipGajiDataProps } from "@/types";

export const getSlipGaji = async (
  uuid: string
): Promise<{
  status: boolean;
  message: string;
  data: SlipGajiDataProps | null;
}> => {
  try {
    const result = await prisma.gaji_pegawai.findFirst({
      select: {
        tahun: true,
        bulan: true,
        pegawai: {
          select: {
            id: true,
            nama: true,
            status_nikah: true,
            position: true,
          },
        },
        department: {
          select: {
            nama_department: true,
          },
        },
        gaji: {
          orderBy: {
            urut: "asc",
          },
        },
      },
      where: {
        uuid: uuid,
      },
    });

    if (!result) {
      return {
        status: false,
        message: "Data not found",
        data: null,
      };
    }

    let nominalThr = 0;
    const thr = await prisma.thr.findFirst({
      select: {
        net_thr: true,
      },
      where: {
        pegawai_id: result.pegawai.id,
        tahun: result.tahun,
        bulan: result.bulan,
      },
    });
    if (thr) {
      nominalThr = thr.net_thr;
    }

    const finalResult = {
      ...result,
      thr: nominalThr,
    };

    return {
      status: true,
      message: "Data fetched successfully",
      data: finalResult as SlipGajiDataProps,
    };
  } catch (error) {
    return HandleError(error) as any;
  }
};
