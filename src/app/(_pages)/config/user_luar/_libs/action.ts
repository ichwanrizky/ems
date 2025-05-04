"use server";

import { DateNowFormat } from "@/libs/DateFormat";
import { HandleError } from "@/libs/Error";
import prisma from "@/libs/Prisma";
const bcrypt = require("bcrypt");

export const getUserLuar = async (
  search?: string,
  currentPage?: number
): Promise<{
  status: boolean;
  message: string;
  data:
    | {
        number: number;
        id: number;
        username: string;
        name: string;
        telp: string;
        roles: {
          id: number;
          role_name: string;
        };
      }[]
    | [];
  total_data: number;
}> => {
  try {
    const condition = {
      where: {
        is_deleted: false,
        is_userluar: true,
        ...(search && {
          OR: [
            {
              name: {
                contains: search,
              },
            },
            {
              username: {
                contains: search,
              },
            },
            {
              telp: {
                contains: search,
              },
            },
          ],
        }),
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
        name: true,
        telp: true,
        roles: {
          select: {
            id: true,
            role_name: true,
          },
        },
      },
      ...condition,
      orderBy: {
        name: "asc",
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
        name: string;
        telp: string;
        roles: {
          id: number;
          role_name: string;
        };
      }[],
      total_data: totalData,
    };
  } catch (error) {
    return HandleError(error) as any;
  }
};

export const getUserLuarId = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
  data: {
    id: number;
    username: string;
    name: string;
    telp: string;
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
        name: true,
        telp: true,
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
        is_userluar: true,
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
        name: string;
        telp: string;
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

export const createUserLuar = async (data: {
  name: string;
  telp: string;
  role_id: number | null;
  username: string;
  new_password: string;
  re_new_password: string;
}): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const username = await prisma.user.findFirst({
      where: {
        username: data.username,
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

    const result = await prisma.user.create({
      data: {
        name: data.name?.toUpperCase(),
        telp: data.telp || "",
        role_id: data.role_id,
        username: data.username,
        password: password,
        is_userluar: true,
        created_at: DateNowFormat(),
      },
    });

    if (!result) {
      return {
        status: false,
        message: "Create data failed",
      };
    }

    return {
      status: true,
      message: "Create data successfully",
    };
  } catch (error) {
    return HandleError(error);
  }
};

export const editUserLuar = async (data: {
  id: number;
  name: string;
  telp: string;
  role_id: number | null;
  username: string;
  new_password: string;
  re_new_password: string;
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
      },
      data: {
        name: data.name?.toUpperCase(),
        telp: data.telp || "",
        role_id: data.role_id,
        username: data.username,
        created_at: DateNowFormat(),
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

export const deleteUserLuar = async (
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
        is_userluar: true,
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

export const resetPasswordUserLuar = async (
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
        username: true,
      },
      where: {
        id,
        is_deleted: false,
        is_userluar: true,
      },
    });

    if (!user) {
      return {
        status: false,
        message: "User not found",
      };
    }

    const password = await bcrypt.hash(user.username, 10);

    const result = await prisma.user.update({
      where: {
        id,
        is_deleted: false,
        is_userluar: true,
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
