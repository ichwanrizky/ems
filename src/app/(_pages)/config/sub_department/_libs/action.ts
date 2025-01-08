"use server";

import { HandleError } from "@/libs/Error";
import prisma from "@/libs/Prisma";
import { AtasanProps, SubDepartmentProps } from "@/types";

export const getSubDepartmentMultipleDepartment = async (
  department_id: { value: number; label: string }[]
): Promise<{
  status: boolean;
  message: string;
  data: SubDepartmentProps[] | [];
}> => {
  try {
    const result = (await prisma.sub_department.findMany({
      where: {
        department_id: {
          in: department_id.map((item) => item.value),
        },
      },
    })) as SubDepartmentProps[];

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

export const getAtasan = async (): Promise<{
  status: boolean;
  message: string;
  data: AtasanProps[] | [];
}> => {
  try {
    const result = (await prisma.user.findMany({
      select: {
        id: true,
        pegawai: {
          select: {
            id: true,
            nama: true,
          },
        },
      },
      where: {
        is_deleted: false,
      },
      orderBy: {
        name: "asc",
      },
    })) as AtasanProps[];

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

export const getJenisIzin = async (): Promise<{
  status: boolean;
  message: string;
  data: any[] | [];
}> => {
  try {
    const result = await prisma.jenis_izin.findMany({
      orderBy: {
        jenis: "asc",
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

export const createSubDepartment = async (data: {
  department: number;
  nama_sub_department: string;
  leader: number | null;
  supervisor: number | null;
  manager: number | null;
  akses_izin: { value: string; label: string }[];
}): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const result = await prisma.sub_department.create({
      data: {
        department_id: data.department,
        nama_sub_department: data.nama_sub_department,
        leader: data.leader,
        supervisor: data.supervisor,
        manager: data.manager,
        akses_izin: {
          create: data.akses_izin?.map((item) => ({
            jenis_izin_kode: item.value,
          })),
        },
      },
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
    return HandleError(error) as any;
  }
};
