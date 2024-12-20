"use server";

import { HandleError } from "@/libs/Error";
import prisma from "@/libs/Prisma";
import { SubDepartmentProps } from "@/types";

export const getSubDepartmentMultipleDepartment = async (
  department_id: { value: number; label: string }[]
): Promise<{
  status: boolean;
  message: string;
  data: SubDepartmentProps[] | [];
}> => {
  try {
    const result = (await prisma.sub_department.findMany({
      where: {
        department_id: {
          in: department_id.map((item) => item.value),
        },
      },
    })) as SubDepartmentProps[];

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
