"use server";

import { HandleError } from "@/libs/Error";
import prisma from "@/libs/Prisma";
const bcrypt = require("bcrypt");

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
        is_userluar: false,
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
    roles: {
      id: number;
      role_name: string;
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
        roles: {
          select: {
            id: true,
            role_name: true,
          },
        },
      },
      where: {
        id: id,
        is_deleted: false,
        is_userluar: false,
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
        roles: {
          id: number;
          role_name: string;
        };
      },
    };
  } catch (error) {
    return HandleError(error) as any;
  }
};

export const editUser = async (data: {
  id: number;
  role_id: number | null;
  username: string;
  new_password?: string;
  re_new_password?: string;
}): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const username = await prisma.user.findFirst({
      where: {
        username: data.username,
        id: {
          not: data.id,
        },
      },
    });

    if (username) {
      return {
        status: false,
        message: "Username already exist",
      };
    }

    let password = "";
    if (data.new_password && data.re_new_password) {
      if (data.new_password !== data.re_new_password) {
        return {
          status: false,
          message: "Password not match",
        };
      }

      password = await bcrypt.hash(data.new_password, 10);

      if (!password) {
        return {
          status: false,
          message: "Edit data failed",
        };
      }
    }

    const result = await prisma.user.update({
      where: {
        id: data.id,
        is_userluar: false,
      },
      data: {
        username: data.username,
        role_id: data.role_id,
        ...(data.new_password && { password: password }),
      },
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
    return HandleError(error);
  }
};

export const deleteUser = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const result = await prisma.user.update({
      where: {
        id,
        is_deleted: false,
        is_userluar: false,
      },
      data: {
        is_deleted: true,
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

export const resetPassword = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const user = await prisma.user.findFirst({
      select: {
        id: true,
        telp: true,
      },
      where: {
        id,
        is_deleted: false,
        is_userluar: false,
      },
    });

    if (!user) {
      return {
        status: false,
        message: "User not found",
      };
    }

    const password = await bcrypt.hash(user.telp, 10);

    const result = await prisma.user.update({
      where: {
        id,
        is_deleted: false,
        is_userluar: false,
      },
      data: {
        password: password,
      },
    });

    if (!result) {
      return {
        status: false,
        message: "Reset password data failed",
      };
    }

    return {
      status: true,
      message: "Reset password data successfully",
    };
  } catch (error) {
    return HandleError(error) as any;
  }
};
