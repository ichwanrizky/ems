"use server";

import { processApprovalOvertime } from "@/libs/ApprovalOvertime";
import { HandleError } from "@/libs/Error";
import prisma from "@/libs/Prisma";
import { ApprovalOvertimeProps } from "@/types";

// Halaman ini tanpa login: uuid adalah satu-satunya "kunci" akses.
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const getApprovalOt = async (
  uuid: string
): Promise<{
  status: boolean;
  message: string;
  data?: ApprovalOvertimeProps;
}> => {
  try {
    if (!UUID_REGEX.test(uuid)) {
      return {
        status: false,
        message: "Invalid link",
      };
    }

    const result = await prisma.pengajuan_overtime.findUnique({
      select: {
        department: {
          select: {
            nama_department: true,
          },
        },
        sub_department: {
          select: {
            nama_sub_department: true,
          },
        },
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
        tanggal: true,
        jam_from: true,
        jam_to: true,
        job_desc: true,
        remark: true,
        status: true,
        approve_date: true,
        approve_via_link: true,
        user: {
          select: {
            name: true,
          },
        },
      },
      where: {
        uuid: uuid,
      },
    });

    if (!result) {
      return {
        status: false,
        message: "Data not found",
      };
    }

    return {
      status: true,
      message: "Data fetched successfully",
      data: result as ApprovalOvertimeProps,
    };
  } catch (error) {
    return HandleError(error) as any;
  }
};

export const approvalOtByUuid = async (
  uuid: string,
  status: number
): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    if (!UUID_REGEX.test(uuid)) {
      return {
        status: false,
        message: "Invalid link",
      };
    }

    const pengajuan = await prisma.pengajuan_overtime.findUnique({
      select: {
        id: true,
      },
      where: {
        uuid: uuid,
      },
    });

    if (!pengajuan) {
      return {
        status: false,
        message: "Data not found",
      };
    }

    return await processApprovalOvertime(pengajuan.id, status, {
      approve_by: null,
      approve_via_link: true,
    });
  } catch (error) {
    return HandleError(error) as any;
  }
};
