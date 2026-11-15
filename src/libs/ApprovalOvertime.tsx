import { DateNowFormat } from "@/libs/DateFormat";
import prisma from "@/libs/Prisma";

/**
 * Approve (status 1) / reject (status 2) pengajuan OT.
 * Dipakai oleh menu HR → Pengajuan OT (login) dan halaman publik
 * /approval-ot/[uuid] (tanpa login).
 *
 * Hanya pengajuan yang masih pending (status 0) yang diproses, supaya
 * approve ganda (dua tab, atau atasan via link + HR via menu bersamaan)
 * tidak membuat data overtime dobel.
 */
export const processApprovalOvertime = async (
  id: number,
  status: number,
  approver: { approve_by: number | null; approve_via_link: boolean }
): Promise<{
  status: boolean;
  message: string;
}> => {
  if (status !== 1 && status !== 2) {
    return {
      status: false,
      message: "Invalid approval status",
    };
  }

  const result = await prisma.$transaction(async (tx) => {
    const updateStatus = await tx.pengajuan_overtime.updateMany({
      where: {
        id: id,
        status: 0,
      },
      data: {
        status: status,
        approve_by: approver.approve_by,
        approve_via_link: approver.approve_via_link,
        approve_date: DateNowFormat(),
      },
    });

    if (updateStatus.count === 0) {
      return false;
    }

    if (status === 1) {
      const data = await tx.pengajuan_overtime_pegawai.findMany({
        include: {
          pengajuan_overtime: true,
        },
        where: {
          pengajuan_overtime_id: Number(id),
        },
      });

      await tx.overtime.createMany({
        data: await Promise.all(
          data?.map(async (item: any) => {
            const jam_from = item.pengajuan_overtime.jam_from;
            const jam_to = item.pengajuan_overtime.jam_to;

            const difference = jam_to - jam_from;
            const hours = difference / (1000 * 60 * 60);

            const roundedHours =
              Math.floor(hours) + (hours % 1 >= 0.5 ? 0.5 : 0);

            const checkTanggalMerah = await tx.tanggal_merah_list.findFirst({
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
      message: "Data already processed or not found",
    };
  }

  return {
    status: true,
    message: "Update data successfully",
  };
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
