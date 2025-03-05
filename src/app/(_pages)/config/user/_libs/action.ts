"use server";

import { HandleError } from "@/libs/Error";
import prisma from "@/libs/Prisma";

export const getUser = async (
  search?: string,
  filter?: {
    department: string | number;
  },
  currentPage?: number
): Promise<{
  status: boolean;
  message: string;
  data:
    | {
        number: number;
        id: number;
        username: string;
        pegawai: {
          id: number;
          nama: string;
          telp: string;
        };
      }[]
    | [];
  total_data: number;
}> => {
  try {
    const condition = {
      where: {
        is_deleted: false,
        pegawai: {
          is_deleted: false,
          is_active: true,
          department_id: Number(filter?.department),
          ...(search && {
            nama: {
              contains: search,
            },
          }),
        },
      },
    };

    const totalData = await prisma.user.count({
      ...condition,
    });

    const itemPerPage = currentPage ? 10 : totalData;

    const result = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        pegawai: {
          select: {
            id: true,
            nama: true,
            telp: true,
          },
        },
      },
      ...condition,
      orderBy: {
        pegawai: {
          nama: "asc",
        },
      },
      skip: currentPage ? (currentPage - 1) * itemPerPage : 0,
      take: itemPerPage,
    });

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
      data: newData as {
        number: number;
        id: number;
        username: string;
        pegawai: {
          id: number;
          nama: string;
          telp: string;
        };
      }[],
      total_data: totalData,
    };
  } catch (error) {
    return HandleError(error) as any;
  }
};

export const getUserId = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
  data: {
    id: number;
    username: string;
    pegawai: {
      id: number;
      nama: string;
      telp: string;
    };
  } | null;
}> => {
  try {
    const result = await prisma.user.findFirst({
      select: {
        id: true,
        username: true,
        pegawai: {
          select: {
            id: true,
            nama: true,
            telp: true,
          },
        },
      },
      where: {
        id: id,
        is_deleted: false,
        pegawai: {
          is_active: true,
          is_deleted: false,
        },
      },
      orderBy: {
        pegawai: {
          nama: "asc",
        },
      },
    });

    if (!result) {
      return {
        status: false,
        message: "Data not found",
        data: null,
      };
    }

    return {
      status: true,
      message: "Data fetched successfully",
      data: result as {
        id: number;
        username: string;
        pegawai: {
          id: number;
          nama: string;
          telp: string;
        };
      },
    };
  } catch (error) {
    return HandleError(error) as any;
  }
};
