"use server";
import { HandleError } from "@/libs/Error";
import prisma from "@/libs/Prisma";
import { AdjustmentProps } from "@/types";

export const getPegawaiAdjustment = async (
  department_id: number
): Promise<{
  status: boolean;
  message: string;
  data:
    | {
        id: number;
        nama: string;
      }[];
}> => {
  try {
    const result = await prisma.pegawai.findMany({
      select: {
        id: true,
        nama: true,
      },
      where: {
        is_active: true,
        is_deleted: false,
        department_id: department_id,
      },
      orderBy: {
        nama: "asc",
      },
    });

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

export const createAdjustment = async (data: {
  department_id: number | string;
  pegawai_id: number | string;
  bulan: number | string;
  tahun: number | string;
  jenis: string;
  nominal: number | string;
  keterangan: string;
}): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const result = await prisma.adjustment.create({
      data: {
        pegawai_id: Number(data.pegawai_id),
        department_id: Number(data.department_id),
        jenis: data.jenis,
        nominal: Number(data.nominal),
        keterangan: data.keterangan,
        bulan: Number(data.bulan),
        tahun: Number(data.tahun),
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
    return HandleError(error) as any;
  }
};

export const getAdjustment = async (
  search?: string,
  filter?: {
    department: string | number;
    tahun: string | number;
    bulan: string | number;
  }
): Promise<{
  status: boolean;
  message: string;
  data: AdjustmentProps[] | [];
}> => {
  try {
    const result = await prisma.adjustment.findMany({
      select: {
        id: true,
        jenis: true,
        nominal: true,
        keterangan: true,
        pegawai: {
          select: {
            id: true,
            nama: true,
          },
        },
        department_id: true,
        bulan: true,
        tahun: true,
      },
      where: {
        department_id: Number(filter?.department),
        bulan: Number(filter?.bulan),
        tahun: Number(filter?.tahun),
        ...(search && {
          pegawai: {
            nama: {
              contains: search,
            },
          },
        }),
      },
    });

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
      data: result as AdjustmentProps[],
    };
  } catch (error) {
    return HandleError(error) as any;
  }
};

export const getAdjustmentId = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
  data: AdjustmentProps | null;
}> => {
  try {
    const result = await prisma.adjustment.findFirst({
      select: {
        id: true,
        jenis: true,
        nominal: true,
        keterangan: true,
        pegawai: {
          select: {
            id: true,
            nama: true,
          },
        },
        department_id: true,
        bulan: true,
        tahun: true,
      },
      where: {
        id: id,
      },
    });

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
      data: result as AdjustmentProps,
    };
  } catch (error) {
    return HandleError(error) as any;
  }
};

export const editAdjustment = async (data: {
  id: number | null;
  department_id: number | string;
  pegawai_id: number | string;
  bulan: number | string;
  tahun: number | string;
  jenis: string;
  nominal: number | string;
  keterangan: string;
}): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const result = await prisma.adjustment.update({
      data: {
        pegawai_id: Number(data.pegawai_id),
        department_id: Number(data.department_id),
        jenis: data.jenis,
        nominal: Number(data.nominal),
        keterangan: data.keterangan,
        bulan: Number(data.bulan),
        tahun: Number(data.tahun),
      },
      where: {
        id: Number(data.id),
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
    return HandleError(error) as any;
  }
};

export const deleteAdjustment = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const result = await prisma.adjustment.delete({
      select: {
        id: true,
        jenis: true,
        nominal: true,
        keterangan: true,
        pegawai: {
          select: {
            id: true,
            nama: true,
          },
        },
        department_id: true,
        bulan: true,
        tahun: true,
      },
      where: {
        id: id,
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
