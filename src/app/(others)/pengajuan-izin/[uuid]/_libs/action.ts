"use server";
import { ConvertDateZeroHours } from "@/libs/ConvertDate";
import { DateNowFormat } from "@/libs/DateFormat";
import { HandleError } from "@/libs/Error";
import prisma from "@/libs/Prisma";
const path = require("path");
const fs = require("fs");

export const getRequestPengajuanIziun = async (
  uuid: string
): Promise<{
  status: boolean;
  message: string;
  data: {
    pegawai: {
      id: number;
      nama: string;
      department: {
        id: number;
        nama_department: string;
      };
      sub_department: {
        id: number | null;
        nama_sub_department: string | null;
      };
    };
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
    const checkSession = await prisma.request_session_izin.findFirst({
      where: {
        uuid: uuid,
        AND: [
          {
            expired_at: {
              gte: DateNowFormat(),
            },
          },
          {
            expired: false,
          },
        ],
      },
    });

    if (!checkSession) {
      return {
        status: false,
        message: "Unauthorized request",
        data: null as any,
      };
    }

    const result = await prisma.$transaction(async (prisma) => {
      const pegawai = await prisma.pegawai.findFirst({
        select: {
          id: true,
          nama: true,
          department: {
            select: {
              id: true,
              nama_department: true,
            },
          },
          sub_department: {
            select: {
              id: true,
              nama_sub_department: true,
              akses_izin: true,
            },
          },
        },
        where: {
          id: checkSession.pegawai_id,
        },
      });

      if (!pegawai?.sub_department?.id || !pegawai?.department?.id) {
        return false;
      }

      const jenisIzin = await prisma.jenis_izin.findMany({
        where: {
          akses_izin: {
            some: {
              sub_department_id: pegawai.sub_department.id,
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
            department_id: pegawai.department.id,
            tahun: {
              in: [new Date().getFullYear(), new Date().getFullYear() + 1],
            },
          },
        },
      });

      return { pegawai, jenisIzin, tglMerah };
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
        pegawai: {
          id: result.pegawai.id,
          nama: result.pegawai.nama,
          department: {
            id: result.pegawai.department.id,
            nama_department: result.pegawai.department.nama_department,
          },
          sub_department: {
            id: result.pegawai.sub_department?.id || null,
            nama_sub_department:
              result.pegawai.sub_department?.nama_sub_department || null,
          },
        },
        jenis_izin: result.jenisIzin,
        tgl_merah: result.tglMerah,
      },
    };
  } catch (error) {
    return HandleError(error) as any;
  }
};

export const createPengajuanIzin = async (data: {
  uuid: string;
  department_id: string | number;
  pegawai_id: string | number;
  jenis_izin: string;
  tgl_izin: Date | null;
  is_jam: boolean;
  is_hari: boolean;
  jumlah_hari: number;
  jumlah_jam: number;
  keterangan: string;
  mc_base64: string;
}): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const checkSession = await prisma.request_session_izin.findFirst({
      where: {
        uuid: data.uuid,
        AND: [
          {
            expired_at: {
              gte: DateNowFormat(),
            },
          },
          {
            expired: false,
          },
        ],
      },
    });

    if (!checkSession) {
      return {
        status: false,
        message: "Unauthorized request",
      };
    }

    const result = await prisma.$transaction(async (prisma) => {
      const jumlah_hari =
        data.jenis_izin === "CS" || data.jenis_izin === "IS"
          ? "0.5"
          : data.jumlah_hari?.toString();

      const createIzin = await prisma.pengajuan_izin.create({
        data: {
          jenis_izin_kode: data.jenis_izin,
          tanggal: ConvertDateZeroHours(data.tgl_izin as Date),
          pegawai_id: Number(data.pegawai_id),
          bulan: ConvertDateZeroHours(data.tgl_izin as Date).getMonth() + 1,
          tahun: ConvertDateZeroHours(data.tgl_izin as Date).getFullYear(),
          keterangan: data.keterangan,
          jumlah_hari: data.is_hari ? jumlah_hari : null,
          jumlah_jam: data.is_jam ? data.jumlah_jam?.toString() : null,
          department_id: Number(data.department_id),
        },
      });

      const updateSession = await prisma.request_session_izin.update({
        where: {
          id: checkSession.id,
        },
        data: {
          expired: true,
        },
      });

      if (!createIzin || !updateSession) {
        return false;
      }

      if (data.jenis_izin === "S") {
        const base64Data: any = data.mc_base64?.replace(
          /^data:image\/\w+;base64,/,
          ""
        );
        const buffer = Buffer.from(base64Data, "base64");
        const imagePath = path.join(
          process.cwd(),
          "public/izin",
          createIzin.uuid?.toString() + ".png"
        );
        fs.writeFileSync(imagePath, buffer);
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
