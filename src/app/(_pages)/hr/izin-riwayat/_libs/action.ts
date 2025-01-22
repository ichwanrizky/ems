"use server";

import { authOptions } from "@/libs/AuthOptions";
import { DateNowFormat } from "@/libs/DateFormat";
import { HandleError } from "@/libs/Error";
import prisma from "@/libs/Prisma";
import { RiwayatIzinProps } from "@/types";
import { getServerSession } from "next-auth";

export const getRiwayatIzin = async (
  search?: string,
  filter?: {
    department: string;
    bulan: number | string;
    tahun: number | string;
  },
  currentPage?: number
): Promise<{
  status: boolean;
  message: string;
  data: RiwayatIzinProps[] | [];
  total_data: number;
}> => {
  try {
    const condition = {
      where: {
        status: {
          not: 0,
        },
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
    };

    const totalData = await prisma.pengajuan_izin.count({
      ...condition,
    });

    const itemPerPage = currentPage ? 10 : totalData;

    const result = (await prisma.pengajuan_izin.findMany({
      select: {
        id: true,
        uuid: true,
        tanggal: true,
        tahun: true,
        bulan: true,
        keterangan: true,
        jumlah_hari: true,
        jumlah_jam: true,
        jenis_izin: {
          select: {
            kode: true,
            jenis: true,
          },
        },
        pegawai: {
          select: {
            nama: true,
          },
        },
        user_approved: {
          select: {
            name: true,
          },
        },
        approve_date: true,
        status: true,
      },
      ...condition,
      orderBy: {
        tanggal: "desc",
      },
      skip: currentPage ? (currentPage - 1) * itemPerPage : 0,
      take: itemPerPage,
    })) as RiwayatIzinProps[];

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
      data: newData,
      total_data: totalData,
    };
  } catch (error) {
    return HandleError(error) as any;
  }
};

export const deleteRiwayatIzin = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const result = await prisma.$transaction(async (prisma) => {
      await prisma.izin.deleteMany({
        where: {
          pengajuan_izin_id: id,
        },
      });

      await prisma.pengajuan_izin.delete({
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

export const getPegawaiIzin = async (
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

export const getPegawaiIzinTglMerah = async (
  pegawai_id: number
): Promise<{
  status: boolean;
  message: string;
  data: {
    jenis_izin: {
      kode: string;
      jenis: string;
      is_jam: boolean;
    }[];
    tgl_merah: {
      tanggal: Date | null;
      tanggal_nomor: string;
    }[];
  };
}> => {
  try {
    const result = await prisma.$transaction(async (prisma) => {
      const pegawai = await prisma.pegawai.findFirst({
        select: {
          department_id: true,
          sub_department_id: true,
        },
        where: {
          id: pegawai_id,
        },
      });

      if (!pegawai?.sub_department_id || !pegawai?.department_id) {
        return false;
      }

      const jenisIzin = await prisma.jenis_izin.findMany({
        where: {
          akses_izin: {
            some: {
              sub_department_id: pegawai.sub_department_id,
            },
          },
        },
      });

      const tglMerah = await prisma.tanggal_merah_list.findMany({
        select: {
          tanggal: true,
          tanggal_nomor: true,
        },
        where: {
          tanggal_merah: {
            department_id: pegawai.department_id,
            tahun: {
              in: [new Date().getFullYear(), new Date().getFullYear() + 1],
            },
          },
        },
      });

      return { jenisIzin, tglMerah };
    });

    if (!result) {
      return {
        status: false,
        message: "Data not found",
        data: null as any,
      };
    }

    return {
      status: true,
      message: "Data fetched successfully",
      data: {
        jenis_izin: result.jenisIzin,
        tgl_merah: result.tglMerah,
      },
    };
  } catch (error) {
    return HandleError(error) as any;
  }
};

export const createIizin = async (data: {
  department_id: string | number;
  pegawai_id: string | number;
  jenis_izin: string;
  tgl_izin: Date | null;
  is_jam: boolean;
  is_hari: boolean;
  jumlah_hari: number;
  jumlah_jam: number;
  keterangan: string;
}): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const session: any = await getServerSession(authOptions);

    const result = await prisma.$transaction(async (prisma) => {
      const create = await prisma.pengajuan_izin.create({
        data: {
          jenis_izin_kode: data.jenis_izin,
          tanggal: data.tgl_izin,
          pegawai_id: Number(data.pegawai_id),
          status: 1,
          bulan: new Date(data.tgl_izin as Date).getMonth() + 1,
          tahun: new Date(data.tgl_izin as Date).getFullYear(),
          keterangan: data.keterangan,
          jumlah_hari: data.is_hari ? data.jumlah_hari?.toString() : null,
          jumlah_jam: data.is_jam ? data.jumlah_jam?.toString() : null,
          department_id: Number(data.department_id),
          approve_by: Number(session.user.id),
          approve_date: DateNowFormat(),
        },
      });

      if (create) {
        const currentYear = new Date().getFullYear();
        const nextYear = currentYear + 1;

        const tanggalMerah = await prisma.tanggal_merah_list.findMany({
          where: {
            tanggal_merah: {
              department_id: create.department_id,
            },
            OR: [
              {
                tanggal_merah: {
                  tahun: currentYear,
                },
              },
              {
                tanggal_merah: {
                  tahun: nextYear,
                },
              },
            ],
          },
        });

        const tanggalMerahList = new Set(
          tanggalMerah.map((item) => item.tanggal?.toISOString().split("T")[0])
        );

        const jumlah_hari =
          create.jumlah_hari === "" ? 1 : Number(create.jumlah_hari);

        const izinData = [];

        let tanggalIzin = new Date(create.tanggal as Date);
        let i = 0;

        while (izinData.length < jumlah_hari) {
          if (i > 0) {
            tanggalIzin.setDate(tanggalIzin.getDate() + 1);
          }

          if (!tanggalMerahList.has(tanggalIzin.toISOString().split("T")[0])) {
            const izinEntry = {
              jenis_izin_kode: create.jenis_izin_kode,
              tanggal: new Date(tanggalIzin as Date),
              pegawai_id: create.pegawai_id,
              bulan: create.bulan,
              tahun: create.tahun,
              keterangan: create.keterangan,
              pengajuan_izin_id: create.id,
              department_id: create.department_id,
              jumlah_hari: create.jumlah_hari,
              jumlah_jam: create.jumlah_jam,
            };

            izinData.push(izinEntry);
          }

          i++;
        }

        await prisma.izin.createMany({
          data: izinData,
        });
      }

      return true;
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
