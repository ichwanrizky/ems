"use server";

import { ConvertDate } from "@/libs/ConvertDate";
import { DateNowFormat } from "@/libs/DateFormat";
import { HandleError } from "@/libs/Error";
import prisma from "@/libs/Prisma";
import { PegawaiCreateProps, PegawaiProps } from "@/types";
const bcrypt = require("bcrypt");

export const getPegawai = async (
  search?: string,
  filter?: {
    department: string | number;
    sub_department?: string | number;
    active: boolean;
  },
  currentPage?: number
): Promise<{
  status: boolean;
  message: string;
  data: PegawaiProps[] | [];
  total_data: number;
}> => {
  try {
    const condition = {
      where: {
        is_deleted: false,
        is_active: filter?.active,
        ...(filter?.department && {
          department_id: Number(filter?.department),
        }),
        ...(filter?.sub_department && {
          sub_department_id: Number(filter?.sub_department),
        }),
        ...(search && {
          OR: [
            {
              nama: {
                contains: search,
              },
            },
          ],
        }),
      },
    };

    const totalData = await prisma.pegawai.count({
      ...condition,
    });

    const itemPerPage = currentPage ? 10 : totalData;

    const result = (await prisma.pegawai.findMany({
      select: {
        id: true,
        panji_id: true,
        nama: true,
        position: true,
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
          },
        },
        is_active: true,
        user: {
          select: {
            id: true,
            is_deleted: true,
          },
          take: 1,
        },
      },
      ...condition,
      orderBy: [
        {
          department_id: "asc",
        },
        {
          sub_department_id: "asc",
        },
        {
          nama: "asc",
        },
      ],
      skip: currentPage ? (currentPage - 1) * itemPerPage : 0,
      take: itemPerPage,
    })) as PegawaiProps[];

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

export const getPegawaiId = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
  data: PegawaiProps | null;
}> => {
  try {
    const result = (await prisma.pegawai.findFirst({
      select: {
        id: true,
        panji_id: true,
        nama: true,
        nik_ktp: true,
        position: true,
        tmp_lahir: true,
        tgl_lahir: true,
        jk: true,
        agama: true,
        telp: true,
        email: true,
        rt: true,
        rw: true,
        kel: true,
        kec: true,
        kota: true,
        kebangsaan: true,
        status_nikah: true,
        npwp: true,
        jenis_bank: true,
        no_rek: true,
        bpjs_kes: true,
        bpjs_tk: true,
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
          },
        },
      },
      where: {
        is_deleted: false,
        id,
      },
    })) as PegawaiProps;

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

export const createDataKaryawan = async (
  data: PegawaiCreateProps
): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const result = await prisma.$transaction(async (prisma) => {
      const createPegawai = await prisma.pegawai.create({
        data: {
          panji_id: data.panji_id?.toUpperCase(),
          nama: data.nama?.toUpperCase(),
          nik_ktp: data.nik_ktp.toString(),
          tmp_lahir: data.tmp_lahir?.toUpperCase(),
          tgl_lahir: data.tgl_lahir,
          jk: data.jk,
          agama: data.agama,
          kebangsaan: data.kebangsaan?.toUpperCase(),
          alamat: data.alamat?.toUpperCase(),
          rt: data.rt?.toUpperCase(),
          rw: data.rw?.toUpperCase(),
          kel: data.kel?.toUpperCase(),
          kec: data.kec?.toUpperCase(),
          kota: data.kota?.toUpperCase(),
          telp: data.telp.toString(),
          status_nikah: data.status_nikah,
          email: data.email,
          position: data.position?.toUpperCase(),
          npwp: data.npwp,
          jenis_bank: data.jenis_bank,
          no_rek: data.no_rek,
          bpjs_tk: data.bpjs_tk,
          bpjs_kes: data.bpjs_kes,
          department_id: data.department_id,
          sub_department_id: data.sub_department_id,
        },
      });

      const createUser = await prisma.user.create({
        data: {
          username: data.telp.toString(),
          password: await bcrypt.hash(data.telp, 10),
          name: data.nama?.toUpperCase(),
          telp: data.telp.toString(),
          pegawai_id: createPegawai.id,
          created_at: DateNowFormat(),
        },
      });

      await prisma.pegawai_history.create({
        data: {
          pegawai_id: createPegawai.id,
          jenis: "JOIN",
          tanggal: data.tgl_join ? ConvertDate(data.tgl_join) : DateNowFormat(),
        },
      });

      return { createPegawai, createUser };
    });

    if (!result.createPegawai || !result.createUser) {
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

export const editDataKaryawan = async (
  data: PegawaiCreateProps
): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const result = await prisma.pegawai.update({
      data: {
        panji_id: data.panji_id?.toUpperCase(),
        nama: data.nama?.toUpperCase(),
        nik_ktp: data.nik_ktp.toString(),
        tmp_lahir: data.tmp_lahir?.toUpperCase(),
        tgl_lahir: data.tgl_lahir,
        jk: data.jk,
        agama: data.agama,
        kebangsaan: data.kebangsaan?.toUpperCase(),
        alamat: data.alamat?.toUpperCase(),
        rt: data.rt?.toUpperCase(),
        rw: data.rw?.toUpperCase(),
        kel: data.kel?.toUpperCase(),
        kec: data.kec?.toUpperCase(),
        kota: data.kota?.toUpperCase(),
        telp: data.telp.toString(),
        status_nikah: data.status_nikah,
        email: data.email,
        position: data.position?.toUpperCase(),
        npwp: data.npwp,
        jenis_bank: data.jenis_bank,
        no_rek: data.no_rek,
        bpjs_tk: data.bpjs_tk,
        bpjs_kes: data.bpjs_kes,
        department_id: data.department_id,
        sub_department_id: data.sub_department_id,
      },
      where: {
        id: data.id,
        is_deleted: false,
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

export const deleteDataKaryawan = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const result = await prisma.pegawai.update({
      data: {
        is_deleted: true,
      },
      where: {
        id: id,
        is_deleted: false,
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
    return HandleError(error);
  }
};

export const createUserPegawai = async (
  pegawaiId: number
): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const getPegawai = await prisma.pegawai.findFirst({
      where: {
        id: pegawaiId,
      },
    });

    if (!getPegawai) {
      return {
        status: false,
        message: "Pegawai not found",
      };
    }

    const checkUser = await prisma.user.findFirst({
      select: {
        id: true,
        is_deleted: true,
      },
      where: {
        pegawai_id: pegawaiId,
      },
    });

    let result;
    if (checkUser) {
      result = await prisma.user.update({
        where: {
          id: checkUser.id,
        },
        data: {
          is_deleted: false,
        },
      });
    } else {
      result = await prisma.user.create({
        data: {
          username: getPegawai.telp.toString(),
          password: await bcrypt.hash(getPegawai.telp, 10),
          name: getPegawai.nama?.toUpperCase(),
          telp: getPegawai.telp.toString(),
          pegawai_id: getPegawai.id,
          created_at: DateNowFormat(),
        },
      });
    }

    if (!result) {
      return {
        status: false,
        message: "Create user failed",
      };
    }

    return {
      status: true,
      message: "Create user successfully",
    };
  } catch (error) {
    return HandleError(error);
  }
};
