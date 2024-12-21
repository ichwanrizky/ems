"use server";

import { HandleError } from "@/libs/Error";
import prisma from "@/libs/Prisma";
import { RolesProps } from "@/types";

export type MenuAccessProps = {
  id: number;
  menu_group: string;
  menu: {
    id: number;
    menu: string;
  }[];
};

type CreateAccessProps = {
  role_id: number;
  department_id: { value: number; label: string }[];
  sub_department_id: { value: number; label: string }[];
  access: {
    menu_id: number;
    view: boolean;
    insert?: boolean;
    update?: boolean;
    delete?: boolean;
  }[];
};

export const getRolesAccess = async (): Promise<{
  status: boolean;
  message: string;
  data: RolesProps[] | [];
}> => {
  try {
    const result = (await prisma.roles.findMany({
      select: {
        id: true,
        role_name: true,
      },
      where: {
        access: {
          none: {},
        },
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

export const getMenuAccess = async (): Promise<{
  status: boolean;
  message: string;
  data: MenuAccessProps[] | [];
}> => {
  try {
    const result = (await prisma.menu_group.findMany({
      select: {
        id: true,
        menu_group: true,
        menu: {
          select: {
            id: true,
            menu: true,
          },
          orderBy: {
            urut: "asc",
          },
        },
      },
      where: {
        menu: {
          some: {},
        },
      },
      orderBy: {
        urut: "asc",
      },
    })) as MenuAccessProps[];

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

export const createAccess = async (
  data: CreateAccessProps
): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const result = await prisma.$transaction(async (prisma) => {
      await prisma.access_department.createMany({
        data: data.department_id.map((item) => ({
          role_id: data.role_id,
          department_id: item.value,
        })),
      });

      await prisma.access_sub_department.createMany({
        data: data.sub_department_id.map((item) => ({
          role_id: data.role_id,
          sub_department_id: item.value,
        })),
      });

      await prisma.access.createMany({
        data: data.access.map((item) => ({
          role_id: data.role_id,
          menu_id: item.menu_id,
          view:
            item.view || item.insert || item.update || item.delete
              ? true
              : false,
          insert: item?.insert,
          update: item?.update,
          delete: item?.delete,
        })),
      });

      return true;
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
    return HandleError(error) as any;
  }
};
