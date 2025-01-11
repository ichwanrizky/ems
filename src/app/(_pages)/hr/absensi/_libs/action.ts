"use server";

import { HandleError } from "@/libs/Error";
import prisma from "@/libs/Prisma";

export const getAbsensi = async (
  search?: string,
  filter?: {
    department?: string;
    sub_department?: string;
    date: Date;
  }
): Promise<{
  status: boolean;
  message: string;
  data: any[] | [];
}> => {
  try {
    const result = await prisma.absen.findMany({
      select: {
        id: true,
        tanggal: true,
        absen_masuk: true,
        absen_pulang: true,
        late: true,
        pegawai: {
          select: {
            id: true,
            nama: true,
          },
        },
      },
    });

    return {
      status: true,
      message: "Data fetched successfully",
      data: result,
    };
  } catch (error) {
    return HandleError(error) as any;
  }
};
