"use server";

import { HandleError } from "@/libs/Error";
import prisma from "@/libs/Prisma";
import { MenuGroupProps, RolesProps } from "@/types";

export const getRoles = async (
  search?: string
): Promise<{
  status: boolean;
  message: string;
  data: RolesProps[] | [];
}> => {
  try {
    const result = (await prisma.roles.findMany({
      where: {
        ...(search && {
          role_name: {
            contains: search,
          },
        }),
      },
      orderBy: {
        role_name: "asc",
      },
    })) as RolesProps[];

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

export const getRolesId = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
  data: RolesProps | null;
}> => {
  try {
    const result = (await prisma.roles.findFirst({
      where: {
        id,
      },
    })) as RolesProps;

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
      data: result,
    };
  } catch (error) {
    return HandleError(error) as any;
  }
};

export const createRoles = async (
  data: RolesProps
): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const result = await prisma.roles.create({
      data: {
        role_name: data.role_name?.toUpperCase(),
      },
    });

    if (!result) {
      return {
        status: false,
        message: "Add data failed",
      };
    }

    return {
      status: true,
      message: "Add data successfully",
    };
  } catch (error) {
    return HandleError(error);
  }
};

export const editRoles = async (
  data: RolesProps
): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const result = await prisma.roles.update({
      data: {
        role_name: data.role_name?.toUpperCase(),
      },
      where: {
        id: data.id,
      },
    });

    if (!result) {
      return {
        status: false,
        message: "Update data failed",
      };
    }

    return {
      status: true,
      message: "Update data successfully",
    };
  } catch (error) {
    return HandleError(error);
  }
};

export const deleteRoles = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const result = await prisma.roles.delete({
      where: {
        id,
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
