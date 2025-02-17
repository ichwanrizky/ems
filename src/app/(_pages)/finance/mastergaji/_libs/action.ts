"use server";

import { HandleError } from "@/libs/Error";
import prisma from "@/libs/Prisma";

type MasterGajiProps = {
  id: number;
  nama: string;
  status_nikah: string;
  type_gaji: string;
  master_gaji_pegawai: {
    id: number;
    nominal: number;
    komponen: {
      id: number;
      komponen: string;
    };
  }[];
};

type KomponenProps = {
  id: number;
  komponen: string;
};

export const getMasterGaji = async (
  search: string,
  filter: {
    department: string | number;
  }
): Promise<{
  status: boolean;
  message: string;
  data: MasterGajiProps[] | [];
  komponen: KomponenProps[] | [];
}> => {
  try {
    const result = await prisma.pegawai.findMany({
      select: {
        id: true,
        nama: true,
        status_nikah: true,
        type_gaji: true,
        master_gaji_pegawai: {
          select: {
            id: true,
            nominal: true,
            komponen: {
              select: {
                id: true,
                komponen: true,
              },
            },
          },
          orderBy: {
            komponen: {
              urut_tampil: "asc",
            },
          },
        },
      },
      where: {
        is_active: true,
        is_deleted: false,
        department_id: Number(filter.department),
        ...(search && {
          nama: {
            contains: search,
          },
        }),
      },
      orderBy: {
        nama: "asc",
      },
    });

    const komponenGaji = await prisma.komponen_gaji.findMany({
      select: {
        id: true,
        komponen: true,
      },
      where: {
        department_id: Number(filter.department),
        is_master: true,
      },
      orderBy: {
        urut_tampil: "asc",
      },
    });

    if (!result) {
      return {
        status: false,
        message: "Data not found",
        data: [],
        komponen: komponenGaji as KomponenProps[],
      };
    }

    const newData = result.map((item) => ({
      ...item,
      master_gaji_pegawai:
        item.master_gaji_pegawai.length > 0
          ? item.master_gaji_pegawai
          : komponenGaji.map((e) => ({
              id: Date.now() + Math.floor(Math.random() * 1000),
              nominal: 0,
              komponen: e,
            })),
    }));

    return {
      status: true,
      message: "Data fetched successfully",
      data: newData as MasterGajiProps[],
      komponen: komponenGaji as KomponenProps[],
    };
  } catch (error) {
    return HandleError(error) as any;
  }
};

export const updateMasterGaji = async (
  data: MasterGajiProps[]
): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const result = await prisma.$transaction(async (prisma) => {
      await Promise.all(
        data.map((item) =>
          prisma.pegawai.update({
            data: {
              type_gaji: item.type_gaji,
              master_gaji_pegawai: {
                deleteMany: {},
                create: item.master_gaji_pegawai.map((e) => ({
                  nominal: Number(e.nominal),
                  komponen_id: e.komponen.id,
                })),
              },
            },
            where: {
              id: item.id,
            },
          })
        )
      );

      return true;
    });

    if (!result) {
      return {
        status: false,
        message: "Edit data failed",
      };
    }

    return {
      status: true,
      message: "Edit data successfully",
    };
  } catch (error) {
    return HandleError(error) as any;
  }
};
