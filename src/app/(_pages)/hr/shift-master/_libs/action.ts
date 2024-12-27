"use server";

import { ConvertDate } from "@/libs/ConvertDate";
import { HandleError } from "@/libs/Error";
import prisma from "@/libs/Prisma";
import { ShiftMasterProps } from "@/types";

export const getShiftMaster = async (
  search?: string,
  department_id?: number | string
): Promise<{
  status: boolean;
  message: string;
  data: ShiftMasterProps[] | [];
}> => {
  try {
    const result = (await prisma.shift.findMany({
      include: {
        department: {
          select: {
            id: true,
            nama_department: true,
          },
        },
      },
      where: {
        ...(search && {
          keterangan: {
            contains: search,
          },
        }),
        ...(department_id && {
          department_id: Number(department_id),
        }),
      },
      orderBy: {
        id: "asc",
      },
    })) as ShiftMasterProps[];

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

export const getShiftMasterId = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
  data: ShiftMasterProps | null;
}> => {
  try {
    const result = (await prisma.shift.findFirst({
      include: {
        department: {
          select: {
            id: true,
            nama_department: true,
          },
        },
      },
      where: {
        id,
      },
    })) as ShiftMasterProps;

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

export const createShiftMaster = async (
  data: ShiftMasterProps
): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const result = await prisma.shift.create({
      data: {
        department_id: data.department_id,
        jam_masuk: ConvertDate(data.jam_masuk),
        jam_pulang: ConvertDate(data.jam_pulang),
        keterangan: data.keterangan.toUpperCase(),
        cond_friday: data.cond_friday,
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

export const editShiftMaster = async (
  data: ShiftMasterProps
): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const result = await prisma.shift.update({
      data: {
        department_id: data.department_id,
        jam_masuk: ConvertDate(data.jam_masuk),
        jam_pulang: ConvertDate(data.jam_pulang),
        keterangan: data.keterangan.toUpperCase(),
        cond_friday: data.cond_friday,
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

export const deleteShiftMaster = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const result = await prisma.shift.delete({
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
