"use server";

import { HandleError } from "@/libs/Error";
import prisma from "@/libs/Prisma";
import { PegawaiShiftProps } from "@/types";

export const getPegawaiShift = async (
  department_id?: number | string
): Promise<{
  status: boolean;
  message: string;
  data: PegawaiShiftProps[] | [];
}> => {
  try {
    const result = (await prisma.pegawai.findMany({
      select: {
        id: true,
        nama: true,
        shift_id: true,
      },
      where: {
        is_active: true,
        is_deleted: false,
        department_id: Number(department_id),
      },
      orderBy: {
        nama: "asc",
      },
    })) as PegawaiShiftProps[];

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

export const SavePegawaiShift = async (
  data: PegawaiShiftProps[]
): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const result = await prisma.$transaction(
      data.map((item) =>
        prisma.pegawai.update({
          data: {
            shift_id: item.shift_id,
          },
          where: {
            id: item.id,
            is_deleted: false,
            is_active: true,
          },
        })
      )
    );
    if (!result) {
      return {
        status: false,
        message: "Save data failed",
      };
    }

    return {
      status: true,
      message: "Save data successfully",
    };
  } catch (error) {
    return HandleError(error);
  }
};
