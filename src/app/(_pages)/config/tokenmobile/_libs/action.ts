"use server";

import { HandleError } from "@/libs/Error";
import prisma from "@/libs/Prisma";

export const getTokenMobile = async (
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
        token: string;
        user: {
          pegawai: {
            id: number;
            nama: string;
          };
        };
      }[]
    | [];
  total_data: number;
}> => {
  try {
    const condition = {
      where: {
        expired: false,
        user: {
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
      },
    };

    const totalData = await prisma.session_mobile.count({
      ...condition,
    });

    const itemPerPage = currentPage ? 10 : totalData;

    const result = await prisma.session_mobile.findMany({
      select: {
        id: true,
        token: true,
        user: {
          select: {
            pegawai: {
              select: {
                id: true,
                nama: true,
              },
            },
          },
        },
      },
      ...condition,
      orderBy: {
        user: {
          pegawai: {
            nama: "asc",
          },
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
        token: string;
        user: {
          pegawai: {
            id: number;
            nama: string;
          };
        };
      }[],
      total_data: totalData,
    };
  } catch (error) {
    return HandleError(error) as any;
  }
};

export const resetToken = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const result = await prisma.session_mobile.update({
      where: {
        id: id,
      },
      data: {
        expired: true,
      },
    });

    if (!result) {
      return {
        status: false,
        message: "Reset data failed",
      };
    }

    return {
      status: true,
      message: "Reset data successfully",
    };
  } catch (error) {
    return HandleError(error) as any;
  }
};
