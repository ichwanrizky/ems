"use server";

import { ConvertDateZeroHours } from "@/libs/ConvertDate";
import { HandleError } from "@/libs/Error";
import prisma from "@/libs/Prisma";

export const getTanggalMerah = async (filter: {
  department: string | number;
  tahun: string | number;
}): Promise<{
  status: boolean;
  message: string;
  data: {
    id: number;
    bulan: number;
    tahun: number;
    tanggal_merah_list: {
      tanggal_nomor: string;
    }[];
    department: {
      id: number;
      nama_department: string;
    };
  }[];
}> => {
  try {
    const result = await prisma.tanggal_merah.findMany({
      select: {
        id: true,
        bulan: true,
        tahun: true,
        tanggal_merah_list: {
          select: {
            tanggal_nomor: true,
          },
          orderBy: {
            tanggal_nomor: "asc",
          },
        },
        department: {
          select: {
            id: true,
            nama_department: true,
          },
        },
      },
      where: {
        tahun: Number(filter.tahun),
        department_id: Number(filter.department),
      },
      orderBy: {
        bulan: "asc",
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

export const getTanggalMerahId = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
  data: {
    id: number;
    bulan: number;
    tahun: number;
    tanggal_merah_list: {
      tanggal_nomor: string;
    }[];
    department: {
      id: number;
      nama_department: string;
    };
  } | null;
}> => {
  try {
    const result = await prisma.tanggal_merah.findFirst({
      select: {
        id: true,
        bulan: true,
        tahun: true,
        tanggal_merah_list: {
          select: {
            tanggal_nomor: true,
          },
          orderBy: {
            tanggal_nomor: "asc",
          },
        },
        department: {
          select: {
            id: true,
            nama_department: true,
          },
        },
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
      data: result,
    };
  } catch (error) {
    return HandleError(error) as any;
  }
};

export const createTanggalMerah = async (data: {
  department: string | number;
  bulan: string | number;
  tahun: string | number;
  tanggal: {
    value: string;
    label: string;
  }[];
}): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const result = await prisma.tanggal_merah.create({
      data: {
        department_id: Number(data.department),
        bulan: Number(data.bulan),
        tahun: Number(data.tahun),
        tanggal_merah_list: {
          create: data.tanggal.map((item) => ({
            tanggal_nomor: item.value,
            tanggal: ConvertDateZeroHours(
              new Date(`${data.tahun}-${data.bulan}-${item.value}`)
            ),
          })),
        },
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

export const editTanggalMerah = async (data: {
  id: number;
  department: string | number;
  bulan: string | number;
  tahun: string | number;
  tanggal: {
    value: string;
    label: string;
  }[];
}): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const result = await prisma.tanggal_merah.update({
      where: {
        id: data.id,
      },
      data: {
        department_id: Number(data.department),
        bulan: Number(data.bulan),
        tahun: Number(data.tahun),
        tanggal_merah_list: {
          deleteMany: {},
          create: data.tanggal.map((item) => ({
            tanggal_nomor: item.value,
            tanggal: ConvertDateZeroHours(
              new Date(`${data.tahun}-${data.bulan}-${item.value}`)
            ),
          })),
        },
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

export const deleteTanggalMerah = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const result = await prisma.$transaction(async (prisma) => {
      await prisma.tanggal_merah_list.deleteMany({
        where: {
          tanggal_merah_id: id,
        },
      });

      await prisma.tanggal_merah.delete({
        where: {
          id: id,
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
