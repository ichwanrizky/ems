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
    console.log(search);
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

    return {
      status: true,
      message: "Data fetched successfully",
      data: result as MasterGajiProps[],
      komponen: komponenGaji as KomponenProps[],
    };
  } catch (error) {
    return HandleError(error) as any;
  }
};
