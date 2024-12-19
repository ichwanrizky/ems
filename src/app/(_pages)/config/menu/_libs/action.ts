"use server";

import { HandleError } from "@/libs/Error";
import prisma from "@/libs/Prisma";
import { MenuProps } from "@/types";

export const getMenu = async (
  search?: string,
  menuGroup?: string
): Promise<{
  status: boolean;
  message: string;
  data: MenuProps[] | [];
}> => {
  try {
    const result = (await prisma.menu.findMany({
      include: {
        menu_group: {
          select: {
            id: true,
            menu_group: true,
            urut: true,
          },
        },
      },
      where: {
        ...(menuGroup && { menu_group_id: Number(menuGroup) }),
        ...(search && {
          OR: [
            {
              menu: {
                contains: search,
              },
            },
            {
              menu_group: {
                menu_group: {
                  contains: search,
                },
              },
            },
          ],
        }),
      },
      orderBy: [
        {
          menu_group: {
            urut: "asc",
          },
        },
        {
          urut: "asc",
        },
      ],
    })) as MenuProps[];

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

export const getMenuId = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
  data: MenuProps | null;
}> => {
  try {
    const result = (await prisma.menu.findFirst({
      include: {
        menu_group: {
          select: {
            id: true,
            menu_group: true,
            urut: true,
          },
        },
      },
      where: {
        id,
      },
    })) as MenuProps;

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

export const createMenu = async (
  data: MenuProps
): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const getMenuGroup = await prisma.menu_group.findFirst({
      where: {
        id: data.menu_group_id,
      },
    });

    if (!getMenuGroup) {
      return {
        status: false,
        message: "Menu group not found",
      };
    }

    const result = await prisma.menu.create({
      data: {
        menu: data.menu?.toUpperCase(),
        urut: data.urut,
        menu_group_id: data.menu_group_id,
        path: `${getMenuGroup.parent_id}/${data.menu
          .replace(/\s/g, "")
          .toLowerCase()}`,
        last_path: data.menu.replace(/\s/g, "").toLowerCase(),
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

export const editMenu = async (
  data: MenuProps
): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const result = await prisma.menu.update({
      data: {
        menu: data.menu?.toUpperCase(),
        urut: data.urut,
        menu_group_id: data.menu_group_id,
        path: `config/${data.menu.replace(/\s/g, "").toLowerCase()}`,
        last_path: data.menu.replace(/\s/g, "").toLowerCase(),
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

export const deleteMenu = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const result = await prisma.menu.delete({
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
