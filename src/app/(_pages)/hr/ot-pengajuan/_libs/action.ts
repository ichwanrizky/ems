"use server";

import { processApprovalOvertime } from "@/libs/ApprovalOvertime";
import { authOptions } from "@/libs/AuthOptions";
import { ConvertDateZeroHours, DatePlus7Format } from "@/libs/ConvertDate";
import { HandleError } from "@/libs/Error";
import prisma from "@/libs/Prisma";
import { PengajuanOvertimeProps } from "@/types";
import { getServerSession } from "next-auth";

export const getPegawaiOt = async (
  sub_department_id: number
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
    const session: any = await getServerSession(authOptions);

    const result = await prisma.pegawai.findMany({
      select: {
        id: true,
        nama: true,
      },
      where: {
        is_active: true,
        is_deleted: false,
        is_overtime: true,
        sub_department_id: {
          in: session.user.access_sub_department.map(
            (item: any) => item.sub_department.id
          ),
        },
        sub_department: {
          id: sub_department_id,
        },
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

export const createOt = async (data: {
  department_id: string | number;
  sub_department_id: string | number;
  list_pegawai: {
    label: string;
    value: number;
  }[];
  tgl_ot: Date | null;
  jam_awal: Date | null;
  jam_akhir: Date | null;
  job_desc: string;
  remarks: string;
}): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const formattedDate2 = new Date(data.jam_awal as Date);
    formattedDate2.setHours(formattedDate2.getHours() + 7);
    formattedDate2.setSeconds(0);
    formattedDate2.setMilliseconds(0);

    const formattedDate3 = new Date(data.jam_akhir as Date);
    formattedDate3.setHours(formattedDate3.getHours() + 7);
    formattedDate3.setSeconds(0);
    formattedDate3.setMilliseconds(0);

    const result = await prisma.pengajuan_overtime.create({
      data: {
        tanggal: ConvertDateZeroHours(data.tgl_ot as Date),
        jam_from: formattedDate2,
        jam_to: formattedDate3,
        department_id: Number(data.department_id),
        sub_department_id: Number(data.sub_department_id),
        job_desc: data.job_desc?.toUpperCase(),
        remark: data.remarks?.toUpperCase(),
        bulan: ConvertDateZeroHours(data.tgl_ot as Date).getMonth() + 1,
        tahun: ConvertDateZeroHours(data.tgl_ot as Date).getFullYear(),
        pengajuan_overtime_pegawai: {
          create: data.list_pegawai.map((item) => ({
            pegawai_id: item.value,
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
    return HandleError(error);
  }
};

export const getPengajuanOt = async (
  search?: string,
  filter?: {
    department: string | number;
  }
): Promise<{
  status: boolean;
  message: string;
  data: PengajuanOvertimeProps[] | [];
}> => {
  try {
    const session: any = await getServerSession(authOptions);

    const result = await prisma.pengajuan_overtime.findMany({
      select: {
        id: true,
        uuid: true,
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
      },
      where: {
        status: 0,
        department_id: Number(filter?.department),
        sub_department_id: {
          in: session.user.access_sub_department.map(
            (item: any) => item.sub_department.id
          ),
        },
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
      orderBy: {
        id: "desc",
      },
    });

    if (!result) {
      return {
        status: false,
        message: "Data not found",
        data: [],
      };
    }

    // uuid = kunci link approval tanpa login → hanya dikirim ke administrator
    const isAdmin = Number(session.user.role_id) === 1;

    const newData = result.map((item) => ({
      ...item,
      uuid: isAdmin ? item.uuid : null,
      approval:
        Number(session.user.id) === item.sub_department.manager ||
        Number(session.user.id) === item.sub_department.supervisor
          ? true
          : false,
    }));

    return {
      status: true,
      message: "Data fetched successfully",
      data: newData as PengajuanOvertimeProps[],
    };
  } catch (error) {
    return HandleError(error) as any;
  }
};

export const deletePengajuanOt = async (
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

export const approvalPengajuanOt = async (
  id: number,
  status: number
): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const session: any = await getServerSession(authOptions);

    return await processApprovalOvertime(id, status, {
      approve_by: Number(session.user.id),
      approve_via_link: false,
    });
  } catch (error) {
    return HandleError(error) as any;
  }
};
