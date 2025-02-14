"use server";

import { authOptions } from "@/libs/AuthOptions";
import { ConvertDateZeroHours, DatePlus7Format } from "@/libs/ConvertDate";
import { DateNowFormat } from "@/libs/DateFormat";
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

    const listData = await prisma.sub_department.findMany({
      select: {
        id: true,
      },
      where: {
        OR: [
          {
            leader: Number(session.user.id),
          },
          {
            supervisor: Number(session.user.id),
          },
        ],
      },
    });

    let condition = {};
    if (listData) {
      condition = {
        sub_department_id: {
          in: listData.map((item) => item.id),
        },
      };
    }

    const result = await prisma.pegawai.findMany({
      select: {
        id: true,
        nama: true,
      },
      where: {
        is_active: true,
        is_deleted: false,
        is_overtime: true,
        sub_department_id: sub_department_id,
        ...condition,
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
    const result = await prisma.pengajuan_overtime.create({
      data: {
        tanggal: ConvertDateZeroHours(data.tgl_ot as Date),
        jam_from: DatePlus7Format(data.jam_awal as Date),
        jam_to: DatePlus7Format(data.jam_akhir as Date),
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

    const listData = await prisma.sub_department.findMany({
      select: {
        id: true,
      },
      where: {
        OR: [
          {
            leader: Number(session.user.id),
          },
          {
            supervisor: Number(session.user.id),
          },
        ],
      },
    });

    let condition = {};
    if (listData) {
      condition = {
        sub_department_id: {
          in: listData.map((item) => item.id),
        },
      };
    }

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
      },
      where: {
        status: 0,
        department_id: Number(filter?.department),
        ...condition,
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

    const newData = result.map((item) => ({
      ...item,
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

    const result = await prisma.$transaction(async (prisma) => {
      const updateStatus = await prisma.pengajuan_overtime.update({
        where: {
          id: id,
        },
        data: {
          status: status,
          approve_by: Number(session.user.id),
          approve_date: DateNowFormat(),
        },
      });

      if (!updateStatus) {
        return false;
      }

      if (updateStatus.status === 1) {
        const data = await prisma.pengajuan_overtime_pegawai.findMany({
          include: {
            pengajuan_overtime: true,
          },
          where: {
            pengajuan_overtime_id: Number(id),
          },
        });

        await prisma.overtime.createMany({
          data: await Promise.all(
            data?.map(async (item: any) => {
              const jam_from = item.pengajuan_overtime.jam_from;
              const jam_to = item.pengajuan_overtime.jam_to;

              const difference = jam_to - jam_from;
              const hours = difference / (1000 * 60 * 60);

              const roundedHours =
                Math.floor(hours) + (hours % 1 >= 0.5 ? 0.5 : 0);

              const checkTanggalMerah =
                await prisma.tanggal_merah_list.findFirst({
                  where: {
                    tanggal: item.pengajuan_overtime.tanggal,
                  },
                });

              let is_holiday;
              let total;

              let newRoundedHours;

              if (checkTanggalMerah) {
                is_holiday = true;

                if (roundedHours >= 5) {
                  newRoundedHours = roundedHours - 1;
                } else {
                  newRoundedHours = roundedHours;
                }
                total = holiday(newRoundedHours?.toString());
              } else {
                newRoundedHours = roundedHours;
                is_holiday = false;
                total = normalDay(roundedHours?.toString());
              }

              return {
                tanggal: item.pengajuan_overtime.tanggal as Date,
                pegawai_id: Number(item.pegawai_id),
                department_id: Number(item.pengajuan_overtime.department_id),
                jam: newRoundedHours?.toString(),
                total: total,
                is_holiday: is_holiday,
                status: 1,
                bulan: item.pengajuan_overtime.bulan,
                tahun: item.pengajuan_overtime.tahun,
                pengajuan_overtime_id: Number(item.pengajuan_overtime_id),
              };
            })
          ),
        });
      }

      return true;
    });

    if (!result) {
      return {
        status: false,
        message: "Update data failed",
      };
    }

    return {
      status: true,
      message: "Update data successfully",
    };
  } catch (error) {
    return HandleError(error) as any;
  }
};

const normalDay = (jam: string): string => {
  switch (jam) {
    case "0.5":
      return "0.75";
    case "1":
      return "1.5";
    case "1.5":
      return "2.5";
    case "2":
      return "3.5";
    case "2.5":
      return "4.5";
    case "3":
      return "5.5";
    case "3.5":
      return "6.5";
    case "4":
      return "7.5";
    case "4.5":
      return "8.5";
    case "5":
      return "9.5";
    case "5.5":
      return "10.5";
    case "6":
      return "11.5";
    case "6.5":
      return "12.5";
    case "7":
      return "13.5";
    default:
      return "0";
  }
};

const holiday = (jam: string): string => {
  switch (jam) {
    case "1":
      return "2";
    case "1.5":
      return "3";
    case "2":
      return "4";
    case "2.5":
      return "5";
    case "3":
      return "6";
    case "3.5":
      return "7";
    case "4":
      return "8";
    case "4.5":
      return "9";
    case "5":
      return "10";
    case "5.5":
      return "11";
    case "6":
      return "12";
    case "6.5":
      return "13";
    case "7":
      return "14";
    case "7.5":
      return "15";
    case "8":
      return "17";
    case "8.5":
      return "18.5";
    case "9":
      return "21";
    case "9.5":
      return "23";
    case "10":
      return "25";
    case "10.5":
      return "27";
    case "11":
      return "29";
    case "11.5":
      return "31";
    default:
      return jam; // Return the original jam if none of the cases match
  }
};
