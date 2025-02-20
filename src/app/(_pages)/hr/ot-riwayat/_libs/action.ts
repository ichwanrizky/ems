"use server";
import { authOptions } from "@/libs/AuthOptions";
import { HandleError } from "@/libs/Error";
import prisma from "@/libs/Prisma";
import { RiwayatOvertimeProps } from "@/types";
import { getServerSession } from "next-auth";

export const getRiwayatOt = async (
  search?: string,
  filter?: {
    department: string | number;
    sub_department?: string | number;
    tahun: string | number;
    bulan: string | number;
  },
  currentPage?: number
): Promise<{
  status: boolean;
  message: string;
  data: RiwayatOvertimeProps[] | [];
  total_data: number;
}> => {
  try {
    const session: any = await getServerSession(authOptions);

    const condition = {
      where: {
        status: {
          not: 0,
        },
        tahun: Number(filter?.tahun),
        bulan: Number(filter?.bulan),
        department_id: Number(filter?.department),
        sub_department_id: {
          in: session.user.access_sub_department.map(
            (item: any) => item.sub_department.id
          ),
        },
        ...(filter?.sub_department && {
          sub_department_id: Number(filter?.sub_department),
        }),
        ...(search && {
          OR: [
            {
              job_desc: {
                contains: search,
              },
            },
            {
              remark: {
                contains: search,
              },
            },
            {
              pengajuan_overtime_pegawai: {
                some: {
                  pegawai: {
                    nama: {
                      contains: search,
                    },
                  },
                },
              },
            },
          ],
        }),
      },
    };

    const totalData = await prisma.pengajuan_overtime.count({
      ...condition,
    });

    const itemPerPage = currentPage ? 10 : totalData;

    const result = await prisma.pengajuan_overtime.findMany({
      select: {
        id: true,
        pengajuan_overtime_pegawai: {
          select: {
            pegawai: {
              select: {
                id: true,
                nama: true,
              },
            },
          },
        },
        sub_department: {
          select: {
            id: true,
            nama_sub_department: true,
            manager: true,
            supervisor: true,
          },
        },
        tanggal: true,
        jam_from: true,
        jam_to: true,
        job_desc: true,
        remark: true,
        status: true,
        user: {
          select: {
            name: true,
          },
        },
        approve_date: true,
      },
      ...condition,
      orderBy: {
        tanggal: "desc",
      },
      skip: currentPage ? (currentPage - 1) * itemPerPage : 0,
      take: itemPerPage,
    });

    if (!result) {
      return {
        status: false,
        message: "Data not found",
        data: [],
        total_data: 0,
      };
    }

    const newData = result.map((item, index) => ({
      number: currentPage
        ? (Number(currentPage) - 1) * itemPerPage + index + 1
        : index + 1,
      ...item,
    }));

    return {
      status: true,
      message: "Data fetched successfully",
      data: newData as RiwayatOvertimeProps[],
      total_data: totalData,
    };
  } catch (error) {
    return HandleError(error) as any;
  }
};

export const deleteRiwayatOt = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const result = await prisma.$transaction(async (prisma) => {
      await prisma.pengajuan_overtime_pegawai.deleteMany({
        where: {
          pengajuan_overtime_id: id,
        },
      });

      await prisma.overtime.deleteMany({
        where: {
          pengajuan_overtime_id: id,
        },
      });

      await prisma.pengajuan_overtime.delete({
        where: {
          id,
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
    return HandleError(error);
  }
};
