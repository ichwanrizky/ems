"use server";

import { DateNowFormat } from "@/libs/DateFormat";
import { HandleError } from "@/libs/Error";
import prisma from "@/libs/Prisma";
import { DepartmentProps } from "@/types";

export const getDepartment = async (
  search?: string
): Promise<{
  status: boolean;
  message: string;
  data: DepartmentProps[] | [];
}> => {
  try {
    const result = (await prisma.department.findMany({
      select: {
        id: true,
        nama_department: true,
        latitude: true,
        longitude: true,
        radius: true,
      },
      where: {
        is_deleted: false,
        ...(search && {
          nama_department: {
            contains: search,
          },
        }),
      },
    })) as DepartmentProps[];

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

export const getDepartmentId = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
  data: DepartmentProps | null;
}> => {
  try {
    const result = (await prisma.department.findFirst({
      select: {
        id: true,
        nama_department: true,
        latitude: true,
        longitude: true,
        radius: true,
      },
      where: {
        is_deleted: false,
      },
    })) as DepartmentProps;

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

export const createDepartment = async (
  data: DepartmentProps
): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const result = await prisma.department.create({
      data: {
        nama_department: data.nama_department?.toUpperCase(),
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        radius: data.radius || null,
        created_at: DateNowFormat(),
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

export const editDepartment = async (
  data: DepartmentProps
): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const result = await prisma.department.update({
      where: {
        id: data.id,
        is_deleted: false,
      },
      data: {
        nama_department: data.nama_department?.toUpperCase(),
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        radius: data.radius || null,
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

export const deleteDepartment = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const result = await prisma.department.update({
      where: {
        id,
        is_deleted: false,
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
