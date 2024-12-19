"use server";

import { HandleError } from "@/libs/Error";
import prisma from "@/libs/Prisma";
import { MenuGroupProps } from "@/types";

export const getMenuGroup = async (
  search?: string
): Promise<{
  status: boolean;
  message: string;
  data: MenuGroupProps[] | [];
}> => {
  try {
    const result = (await prisma.menu_group.findMany({
      where: {
        ...(search && {
          menu_group: {
            contains: search,
          },
        }),
      },
      orderBy: {
        urut: "asc",
      },
    })) as MenuGroupProps[];

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

export const getMenuGroupId = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
  data: MenuGroupProps | null;
}> => {
  try {
    const result = (await prisma.menu_group.findFirst({
      where: {
        id,
      },
    })) as MenuGroupProps;

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

export const createMenuGroup = async (
  data: MenuGroupProps
): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const result = await prisma.menu_group.create({
      data: {
        menu_group: data.menu_group?.toUpperCase(),
        urut: data.urut,
        group: data.group,
        parent_id: data.menu_group.replace(/\s/g, "").toLowerCase(),
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

export const editMenuGroup = async (
  data: MenuGroupProps
): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const result = await prisma.menu_group.update({
      data: {
        menu_group: data.menu_group?.toUpperCase(),
        urut: data.urut,
        group: data.group,
        parent_id: data.menu_group.replace(/\s/g, "").toLowerCase(),
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

export const deleteMenuGroup = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const result = await prisma.menu_group.delete({
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
