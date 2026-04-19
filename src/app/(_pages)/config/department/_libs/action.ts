"use server";

import { DateNowFormat } from "@/libs/DateFormat";
import { HandleError } from "@/libs/Error";
import prisma from "@/libs/Prisma";
import { DepartmentLocationProps, DepartmentProps } from "@/types";

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
        akses_izin_department: {
          select: {
            jenis_izin: {
              select: {
                kode: true,
                jenis: true,
              },
            },
          },
        },
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
        akses_izin_department: {
          select: {
            jenis_izin: {
              select: {
                kode: true,
                jenis: true,
              },
            },
          },
        },
      },
      where: {
        is_deleted: false,
        id: id,
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

export const getJenisIzin = async (): Promise<{
  status: boolean;
  message: string;
  data: { kode: string; jenis: string }[] | [];
}> => {
  try {
    const result = await prisma.jenis_izin.findMany({
      select: {
        kode: true,
        jenis: true,
      },
      orderBy: {
        jenis: "asc",
      },
    });

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
    const result = await prisma.$transaction(async (prisma) => {
      const jenisIzin = await prisma.jenis_izin.findMany({
        select: {
          kode: true,
        },
      });

      return prisma.department.create({
        data: {
          nama_department: data.nama_department?.toUpperCase(),
          latitude: data.latitude || null,
          longitude: data.longitude || null,
          radius: data.radius || null,
          created_at: DateNowFormat(),
          akses_izin_department: {
            create: jenisIzin.map((item) => ({
              jenis_izin_kode: item.kode,
            })),
          },
        },
      });
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
        akses_izin_department: {
          deleteMany: {},
          create: data.akses_izin_department?.map((item: any) => ({
            jenis_izin_kode: item.jenis_izin?.kode || item.value,
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

// ── Department Location CRUD ──────────────────────────────────────────────────

export const getDepartmentLocation = async (
  department_id: number
): Promise<{
  status: boolean;
  message: string;
  data: DepartmentLocationProps[];
}> => {
  try {
    const result = await prisma.department_location.findMany({
      select: {
        id: true,
        nama_lokasi: true,
        latitude: true,
        longitude: true,
        radius: true,
        department_id: true,
      },
      where: { department_id },
      orderBy: { id: "asc" },
    });

    return {
      status: true,
      message: "Data fetched successfully",
      data: result as DepartmentLocationProps[],
    };
  } catch (error) {
    return HandleError(error) as any;
  }
};

export const getDepartmentLocationId = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
  data: DepartmentLocationProps | null;
}> => {
  try {
    const result = await prisma.department_location.findFirst({
      select: {
        id: true,
        nama_lokasi: true,
        latitude: true,
        longitude: true,
        radius: true,
        department_id: true,
      },
      where: { id },
    });

    if (!result) return { status: false, message: "Data not found", data: null };

    return {
      status: true,
      message: "Data fetched successfully",
      data: result as DepartmentLocationProps,
    };
  } catch (error) {
    return HandleError(error) as any;
  }
};

export const createDepartmentLocation = async (
  data: DepartmentLocationProps
): Promise<{ status: boolean; message: string }> => {
  try {
    await prisma.department_location.create({
      data: {
        nama_lokasi: data.nama_lokasi || null,
        latitude: data.latitude,
        longitude: data.longitude,
        radius: data.radius,
        department_id: Number(data.department_id),
      },
    });

    return { status: true, message: "Add data successfully" };
  } catch (error) {
    return HandleError(error);
  }
};

export const editDepartmentLocation = async (
  data: DepartmentLocationProps
): Promise<{ status: boolean; message: string }> => {
  try {
    await prisma.department_location.update({
      where: { id: data.id },
      data: {
        nama_lokasi: data.nama_lokasi || null,
        latitude: data.latitude,
        longitude: data.longitude,
        radius: data.radius,
      },
    });

    return { status: true, message: "Edit data successfully" };
  } catch (error) {
    return HandleError(error);
  }
};

export const deleteDepartmentLocation = async (
  id: number
): Promise<{ status: boolean; message: string }> => {
  try {
    await prisma.department_location.delete({ where: { id } });
    return { status: true, message: "Delete data successfully" };
  } catch (error) {
    return HandleError(error);
  }
};
