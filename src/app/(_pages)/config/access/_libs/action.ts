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

export type CreateAccessProps = {
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

export const getRolesAccess = async (
  role_id?: number
): Promise<{
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
        ...(role_id
          ? {
              OR: [
                {
                  id: role_id,
                },
                {
                  access: {
                    none: {},
                  },
                },
              ],
            }
          : {
              access: {
                none: {},
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

export const getAccess = async (
  search?: string
): Promise<{
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
          some: {},
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

export const getAccessByRoles = async (
  role_id: number
): Promise<{
  status: boolean;
  message: string;
  data: CreateAccessProps | null;
}> => {
  try {
    const result = await prisma.$transaction(async (prisma) => {
      const accessDepartment = await prisma.access_department.findMany({
        select: {
          department: {
            select: {
              id: true,
              nama_department: true,
            },
          },
        },
        where: {
          role_id,
        },
      });

      const accessSubDepartment = await prisma.access_sub_department.findMany({
        select: {
          sub_department: {
            select: {
              id: true,
              nama_sub_department: true,
              department: {
                select: {
                  nama_department: true,
                },
              },
            },
          },
        },
        where: {
          role_id,
        },
      });

      const access = await prisma.access.findMany({
        select: {
          menu_id: true,
          view: true,
          insert: true,
          update: true,
          delete: true,
        },
        where: {
          role_id,
        },
      });

      return {
        accessDepartment,
        accessSubDepartment,
        access,
      };
    });

    if (
      result.access.length === 0 ||
      result.accessDepartment.length === 0 ||
      result.accessSubDepartment.length === 0
    ) {
      return {
        status: false,
        message: "Data not found",
        data: null,
      };
    }

    const data = {
      role_id: role_id,
      department_id: result.accessDepartment.map((item) => ({
        value: item.department.id,
        label: item.department.nama_department,
      })),
      sub_department_id: result.accessSubDepartment.map((item) => ({
        value: item.sub_department.id,
        label: `${item.sub_department.department.nama_department} - (${item.sub_department.nama_sub_department})`,
      })),
      access: result.access.map((item) => ({
        menu_id: item.menu_id,
        view: item.view,
        insert: item.insert,
        update: item.update,
        delete: item.delete,
      })),
    };

    return {
      status: true,
      message: "Data fetched successfully",
      data: data,
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

export const editAccess = async (
  data: CreateAccessProps
): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const result = await prisma.$transaction(async (prisma) => {
      await prisma.access_department.deleteMany({
        where: {
          role_id: data.role_id,
        },
      });
      await prisma.access_sub_department.deleteMany({
        where: {
          role_id: data.role_id,
        },
      });
      await prisma.access.deleteMany({
        where: {
          role_id: data.role_id,
        },
      });

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
        message: "Edit data failed",
      };
    }

    return {
      status: true,
      message: "Edit data successfully",
    };
  } catch (error) {
    return HandleError(error) as any;
  }
};

export const deleteAccess = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const result = await prisma.$transaction(async (prisma) => {
      await prisma.access.deleteMany({
        where: {
          role_id: id,
        },
      });

      await prisma.access_department.deleteMany({
        where: {
          role_id: id,
        },
      });

      await prisma.access_sub_department.deleteMany({
        where: {
          role_id: id,
        },
      });

      return true;
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
