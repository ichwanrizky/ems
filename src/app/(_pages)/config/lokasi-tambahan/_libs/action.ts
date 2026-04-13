"use server";

import { HandleError } from "@/libs/Error";
import prisma from "@/libs/Prisma";
import { PegawaiLocationCreateProps, PegawaiLocationProps } from "@/types";

export const getPegawaiLokasi = async (
  department_id?: number,
  pegawai_id?: number
): Promise<{
  status: boolean;
  message: string;
  data: PegawaiLocationProps[];
  total_data: number;
}> => {
  try {
    const condition = {
      where: {
        ...(pegawai_id && { pegawai_id }),
        ...(department_id && !pegawai_id && {
          pegawai: { department_id },
        }),
      },
    };

    const [totalData, result] = await Promise.all([
      prisma.pegawai_location.count({ ...condition }),
      prisma.pegawai_location.findMany({
        select: {
          id: true,
          nama_lokasi: true,
          latitude: true,
          longitude: true,
          radius: true,
          pegawai_id: true,
          pegawai: {
            select: {
              id: true,
              nama: true,
              department: {
                select: { id: true, nama_department: true },
              },
            },
          },
        },
        ...condition,
        orderBy: [{ pegawai: { nama: "asc" } }, { id: "asc" }],
      }),
    ]);

    return {
      status: true,
      message: "Data fetched successfully",
      data: result as PegawaiLocationProps[],
      total_data: totalData,
    };
  } catch (error) {
    return HandleError(error) as any;
  }
};

export const getPegawaiLokasiId = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
  data: PegawaiLocationProps | null;
}> => {
  try {
    const result = await prisma.pegawai_location.findFirst({
      select: {
        id: true,
        nama_lokasi: true,
        latitude: true,
        longitude: true,
        radius: true,
        pegawai_id: true,
        pegawai: {
          select: {
            id: true,
            nama: true,
            department: {
              select: { id: true, nama_department: true },
            },
          },
        },
      },
      where: { id },
    });

    if (!result) return { status: false, message: "Data not found", data: null };

    return {
      status: true,
      message: "Data fetched successfully",
      data: result as PegawaiLocationProps,
    };
  } catch (error) {
    return HandleError(error) as any;
  }
};

export const createPegawaiLokasi = async (
  data: PegawaiLocationCreateProps
): Promise<{ status: boolean; message: string }> => {
  try {
    await prisma.pegawai_location.create({
      data: {
        nama_lokasi: data.nama_lokasi || null,
        latitude: data.latitude,
        longitude: data.longitude,
        radius: data.radius,
        pegawai_id: Number(data.pegawai_id),
      },
    });

    return { status: true, message: "Add data successfully" };
  } catch (error) {
    return HandleError(error);
  }
};

export const editPegawaiLokasi = async (
  data: PegawaiLocationCreateProps
): Promise<{ status: boolean; message: string }> => {
  try {
    await prisma.pegawai_location.update({
      where: { id: data.id },
      data: {
        nama_lokasi: data.nama_lokasi || null,
        latitude: data.latitude,
        longitude: data.longitude,
        radius: data.radius,
        pegawai_id: Number(data.pegawai_id),
      },
    });

    return { status: true, message: "Edit data successfully" };
  } catch (error) {
    return HandleError(error);
  }
};

export const deletePegawaiLokasi = async (
  id: number
): Promise<{ status: boolean; message: string }> => {
  try {
    await prisma.pegawai_location.delete({ where: { id } });
    return { status: true, message: "Delete data successfully" };
  } catch (error) {
    return HandleError(error);
  }
};

export const getPegawaiByDepartment = async (
  department_id: number
): Promise<{
  status: boolean;
  message: string;
  data: { id: number; nama: string }[];
}> => {
  try {
    const result = await prisma.pegawai.findMany({
      select: { id: true, nama: true },
      where: {
        is_active: true,
        is_deleted: false,
        department_id,
      },
      orderBy: { nama: "asc" },
    });

    return { status: true, message: "Data fetched successfully", data: result };
  } catch (error) {
    return HandleError(error) as any;
  }
};
