"use server";

import { HandleError } from "@/libs/Error";
import prisma from "@/libs/Prisma";

export type MenuAccessProps = {
  id: number;
  menu_group: string;
  menu: {
    id: number;
    menu: string;
  }[];
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
