"use server";

import { authOptions } from "@/libs/AuthOptions";
import { DateNowFormat } from "@/libs/DateFormat";
import { HandleError } from "@/libs/Error";
import prisma from "@/libs/Prisma";
import { PengajuanIzinProps } from "@/types";
import { getServerSession } from "next-auth";

export const getPengajuanIzin = async (
  search?: string,
  filter?: {
    department: string | number;
  }
): Promise<{
  status: boolean;
  message: string;
  data: PengajuanIzinProps[] | [];
}> => {
  try {
    const session: any = await getServerSession(authOptions);

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
            sub_department: {
              select: {
                id: true,
                nama_sub_department: true,
                manager: true,
                supervisor: true,
              },
            },
          },
        },
      },
      where: {
        status: 0,
        department_id: Number(filter?.department),
        pegawai: {
          sub_department_id: {
            in: session.user.access_sub_department.map(
              (item: any) => item.sub_department.id
            ),
          },
        },
        ...(search && {
          pegawai: {
            nama: {
              contains: search,
            },
          },
        }),
      },
      orderBy: [
        {
          tanggal: "desc",
        },
        {
          pegawai: {
            nama: "asc",
          },
        },
      ],
    })) as PengajuanIzinProps[];

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
        Number(session.user.id) === item.pegawai.sub_department.manager ||
        Number(session.user.id) === item.pegawai.sub_department.supervisor
          ? true
          : false,
    }));

    return {
      status: true,
      message: "Data fetched successfully",
      data: newData,
    };
  } catch (error) {
    return HandleError(error) as any;
  }
};

export const deletePengajuanIzin = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const result = await prisma.pengajuan_izin.delete({
      where: {
        id: id,
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

export const approvalPengajuanIzin = async (
  id: number,
  status: number
): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const session: any = await getServerSession(authOptions);

    const result = await prisma.$transaction(async (prisma) => {
      const approval = await prisma.pengajuan_izin.update({
        where: {
          id: id,
        },
        data: {
          status: status,
          approve_by: Number(session.user.id),
          approve_date: DateNowFormat(),
        },
      });

      if (status === 1 && approval) {
        const currentYear = new Date().getFullYear();
        const nextYear = currentYear + 1;

        const tanggalMerah = await prisma.tanggal_merah_list.findMany({
          where: {
            tanggal_merah: {
              department_id: approval.department_id,
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
          approval.jumlah_hari === "" ? 1 : Number(approval.jumlah_hari);

        const izinData = [];

        let tanggalIzin = new Date(approval.tanggal as Date);
        let i = 0;

        while (izinData.length < jumlah_hari) {
          if (i > 0) {
            tanggalIzin.setDate(tanggalIzin.getDate() + 1);
          }

          if (!tanggalMerahList.has(tanggalIzin.toISOString().split("T")[0])) {
            const izinEntry = {
              jenis_izin_kode: approval.jenis_izin_kode,
              tanggal: new Date(tanggalIzin as Date),
              pegawai_id: approval.pegawai_id,
              bulan: approval.bulan,
              tahun: approval.tahun,
              keterangan: approval.keterangan,
              pengajuan_izin_id: approval.id,
              department_id: approval.department_id,
              jumlah_hari: approval.jumlah_hari,
              jumlah_jam: approval.jumlah_jam,
            };

            izinData.push(izinEntry);
          }

          i++;
        }

        // TODO: CONSOLE HERE IF ERR: REQUEST ERROR
        // console.log(izinData);
        await prisma.izin.createMany({
          data: izinData,
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
    return HandleError(error);
  }
};
