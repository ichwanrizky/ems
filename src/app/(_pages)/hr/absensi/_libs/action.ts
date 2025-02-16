"use server";

import { authOptions } from "@/libs/AuthOptions";
import { ConvertDate, ConvertDateZeroHours } from "@/libs/ConvertDate";
import { HandleError } from "@/libs/Error";
import prisma from "@/libs/Prisma";
import { AbsenProps } from "@/types";
import { getServerSession } from "next-auth";

export const getAbsensi = async (
  search: string,
  filter: {
    department: string | number;
    sub_department: string | number;
    status_absen: string | number;
    date: Date;
  }
): Promise<{
  status: boolean;
  message: string;
  data: AbsenProps[] | [];
}> => {
  try {
    const session: any = await getServerSession(authOptions);

    const result = (await prisma.pegawai.findMany({
      select: {
        id: true,
        nama: true,
        absen: {
          select: {
            id: true,
            tanggal: true,
            absen_masuk: true,
            absen_pulang: true,
            late: true,
          },
          where: {
            tanggal: ConvertDateZeroHours(filter?.date),
          },
        },
        izin: {
          select: {
            jenis_izin: {
              select: {
                kode: true,
                jenis: true,
                is_jam: true,
              },
            },
            jumlah_jam: true,
            jumlah_hari: true,
          },
          where: {
            tanggal: ConvertDateZeroHours(filter?.date),
          },
        },
      },
      where: {
        is_active: true,
        is_deleted: false,
        department_id: Number(filter!.department),
        sub_department_id: {
          in: session.user.access_sub_department.map(
            (item: any) => item.sub_department.id
          ),
        },
        ...(filter!.sub_department && {
          sub_department_id: Number(filter!.sub_department),
        }),
        ...(filter!.status_absen && {
          absen:
            filter!.status_absen === "1"
              ? {
                  some: {
                    tanggal: ConvertDateZeroHours(filter!.date),
                  },
                }
              : {
                  none: {
                    tanggal: ConvertDateZeroHours(filter!.date),
                  },
                },
        }),
        ...(search && {
          nama: {
            contains: search,
          },
        }),
      },
      orderBy: {
        nama: "asc",
      },
    })) as AbsenProps[];

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
