"use server";

import { HandleError } from "@/libs/Error";
import prisma from "@/libs/Prisma";
import { RiwayatIzinProps } from "@/types";

export const getRiwayatIzin = async (
  search?: string,
  filter?: {
    department: string;
    bulan: number | string;
    tahun: number | string;
  },
  currentPage?: number
): Promise<{
  status: boolean;
  message: string;
  data: RiwayatIzinProps[] | [];
  total_data: number;
}> => {
  try {
    const condition = {
      where: {
        status: {
          not: 0,
        },
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
    };

    const totalData = await prisma.pengajuan_izin.count({
      ...condition,
    });

    const itemPerPage = currentPage ? 10 : totalData;

    const result = (await prisma.pengajuan_izin.findMany({
      select: {
        id: true,
        uuid: true,
        tanggal: true,
        tahun: true,
        bulan: true,
        keterangan: true,
        jumlah_hari: true,
        jumlah_jam: true,
        jenis_izin: {
          select: {
            kode: true,
            jenis: true,
          },
        },
        pegawai: {
          select: {
            nama: true,
          },
        },
        user_approved: {
          select: {
            name: true,
          },
        },
        approve_date: true,
        status: true,
      },
      ...condition,
      orderBy: {
        tanggal: "desc",
      },
      skip: currentPage ? (currentPage - 1) * itemPerPage : 0,
      take: itemPerPage,
    })) as RiwayatIzinProps[];

    if (!result) {
      return {
        status: false,
        message: "Data not found",
        data: [],
        total_data: 0,
      };
    }

    const newData = result.map((item, index) => ({
      number: currentPage
        ? (Number(currentPage) - 1) * itemPerPage + index + 1
        : index + 1,
      ...item,
    }));

    return {
      status: true,
      message: "Data fetched successfully",
      data: newData,
      total_data: totalData,
    };
  } catch (error) {
    return HandleError(error) as any;
  }
};

export const deleteRiwayatIzin = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const result = await prisma.$transaction(async (prisma) => {
      await prisma.izin.deleteMany({
        where: {
          pengajuan_izin_id: id,
        },
      });

      await prisma.pengajuan_izin.delete({
        where: {
          id,
        },
      });

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
