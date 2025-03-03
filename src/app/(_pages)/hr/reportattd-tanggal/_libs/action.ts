// "use server";
// import { authOptions } from "@/libs/AuthOptions";
// import { HandleError } from "@/libs/Error";
// import prisma from "@/libs/Prisma";
// import { ReportAttdProps } from "@/types";
// import { getServerSession } from "next-auth";

// export const getReportAttdBulan = async (
//   search?: string,
//   filter?: {
//     department: string | number;
//     startDate: Date | undefined;
//     endDate: Date | undefined;
//   }
// ): Promise<{
//   status: boolean;
//   message: string;
//   data: ReportAttdProps[];
// }> => {
//   try {
//     const session: any = await getServerSession(authOptions);

//     const listDates = getDatesInRange(filter?.startDate, filter?.endDate);

//     const listTanggalMerah = await prisma.tanggal_merah_list.findMany({
//       select: {
//         tanggal: true,
//       },
//       where: {
//         tanggal_merah: {
//           department_id: 1,
//         },
//         tanggal: {
//           gte: filter?.startDate,
//           lte: filter?.endDate,
//         },
//       },
//       orderBy: {
//         tanggal: "asc",
//       },
//     });

//     const tanggalMerah = listTanggalMerah.map(
//       (item: any) => item.tanggal.toISOString().split("T")[0]
//     );

//     const tanggalKerjaQuery = listDates
//       .map((date) => `SELECT '${date}' as tanggal`)
//       .join(" UNION ");

//     const dataQuery = `
//     SELECT
//     p.id,
//     p.nama,
//     p.status_nikah,
//     p.department_id,
//     dp.nama_department,
//     p.sub_department_id,
//     sd.nama_sub_department,
//     p.type_gaji,
//     d.tanggal,
//     tml.tanggal AS tanggal_libur,
//     a.tanggal AS tanggal_absen,
//     a.absen_masuk,
//     a.absen_pulang,
//     a.late,
//     i.tanggal AS tanggal_izin,
//     i.jenis_izin_kode AS jenis_izin,
//     i.jumlah_hari,
//     i.jumlah_jam,
//     ot.tanggal AS tanggal_ot,
//     ot.jam AS jam_ot,
//     ot.total AS total_ot
//   FROM
//     pegawai p
//     CROSS JOIN (${tanggalKerjaQuery}) d
//     LEFT JOIN absen a
//       ON p.id = a.pegawai_id
//       AND d.tanggal = a.tanggal
//     LEFT JOIN izin i
//       ON p.id = i.pegawai_id
//       AND d.tanggal = i.tanggal
//     JOIN department dp
//       ON p.department_id = dp.id
//     JOIN sub_department sd
//       ON p.sub_department_id = sd.id
//     LEFT JOIN tanggal_merah tm
//       ON tm.department_id = p.department_id
//     LEFT JOIN tanggal_merah_list tml
//       ON tm.id = tml.tanggal_merah_id
//       AND tml.tanggal = d.tanggal
//     LEFT JOIN (
//       SELECT
//           pegawai_id,
//           tanggal,
//           jam,
//           total,
//           ROW_NUMBER() OVER (PARTITION BY pegawai_id, tanggal ORDER BY tanggal) AS rn
//       FROM
//           overtime
//     ) ot ON ot.pegawai_id = p.id
//          AND ot.tanggal = d.tanggal
//          AND ot.rn = 1
//   WHERE
//     p.department_id = ${filter?.department}
//     AND p.is_active = true
//     AND p.is_deleted = false
//     AND p.sub_department_id IN (${session.user.access_sub_department.map(
//       (item: any) => item.sub_department.id
//     )})
//   ${search ? `AND (p.nama LIKE '%${search}%')` : ""}
//   ORDER BY
//     p.nama,
//     d.tanggal
//   `;

//     console.log(dataQuery);
//     return {
//       status: true,
//       message: "Data fetched successfully",
//       data: [],
//     };

//     const rowData = (await prisma.$queryRawUnsafe(dataQuery)) as any;

//     if (!rowData) {
//       return {
//         status: false,
//         message: "Data not found",
//         data: [],
//       };
//     }

//     let reportData: any = [];

//     let pegawaiId = 0;
//     let totalAttend: any = 0;
//     let totalNotAttend: any = 0;
//     let totalAttendWeekend: any = 0;
//     let totalLate: any = 0;
//     let totalC: any = 0;
//     let totalCS: any = 0;
//     let totalI: any = 0;
//     let totalIS: any = 0;
//     let totalS: any = 0;
//     let totalG1: any = 0;
//     let totalG2: any = 0;
//     let totalG3: any = 0;
//     let totalPM: any = 0;

//     let overtime: number = 0;
//     let overtimeTotal: number = 0;

//     rowData?.map((item: any) => {
//       if (item.id !== pegawaiId) {
//         pegawaiId = item.id;
//         totalAttend = 0;
//         totalAttendWeekend = 0;
//         totalNotAttend = 0;
//         totalLate = 0;
//         totalC = 0;
//         totalCS = 0;
//         totalI = 0;
//         totalIS = 0;
//         totalS = 0;
//         totalG1 = 0;
//         totalG2 = 0;
//         totalG3 = 0;
//         totalPM = 0;
//         overtime = 0;
//         overtimeTotal = 0;

//         reportData.push({
//           pegawai_id: item.id,
//           nama: item.nama,
//           status_nikah: item.status_nikah,
//           department_id: item.department_id,
//           nama_department: item.nama_department,
//           sub_department_id: item.sub_department_id,
//           nama_sub_department: item.nama_sub_department,
//           type_gaji: item.type_gaji,
//           workdate_count: tanggalKerja.length,
//           attend_count: totalAttend,
//           attend_weekend_count: totalAttendWeekend,
//           notattend_count: totalNotAttend,
//           late_count: totalLate,
//           cuti_count: totalC,
//           cuti_s_count: totalCS,
//           izin_count: totalI,
//           izin_s_count: totalIS,
//           sakit_count: totalS,
//           g1_count: totalG1,
//           g2_count: totalG2,
//           g3_count: totalG3,
//           pm_count: totalPM,
//           overtime: overtime,
//           overtime_total: overtimeTotal,
//         });
//       }

//       if (pegawaiId === item.id) {
//         // COUNT LATE
//         if (
//           item.tanggal_libur === null &&
//           item.tanggal_absen !== null &&
//           item.late !== 0
//         ) {
//           if (item.jenis_izin !== null) {
//             ["G2", "CS", "IS"].includes(item.jenis_izin)
//               ? (totalLate += 0)
//               : (totalLate += item.late);
//           } else {
//             totalLate += item.late;
//           }
//         }

//         // COUNT IZIN / CUTI
//         if (item.jenis_izin === "C") {
//           totalC += 1;
//         } else if (item.jenis_izin === "CS") {
//           totalCS += 0.5;
//         } else if (item.jenis_izin === "I") {
//           totalI += 1;
//         } else if (item.jenis_izin === "IS") {
//           totalIS += 0.5;
//         } else if (item.jenis_izin === "S") {
//           totalS += 1;
//         } else if (item.jenis_izin === "G1") {
//           totalG1 += item.jumlah_jam !== null && jumlahJam(item.jumlah_jam);
//         } else if (item.jenis_izin === "G2") {
//           if (item.jumlah_jam !== null) {
//             if (Number(jumlahJam(item.jumlah_jam)) > Number(item.late)) {
//               totalG2 += jumlahJam(item.jumlah_jam);
//             } else {
//               totalG2 += item.late;
//             }
//           }
//         } else if (item.jenis_izin === "G3") {
//           totalG3 += item.jumlah_jam !== null && jumlahJam(item.jumlah_jam);
//         } else if (
//           item.jenis_izin === "P/M" ||
//           item.jenis_izin === "TA1" ||
//           item.jenis_izin === "TA2" ||
//           item.jenis_izin === "LA1" ||
//           item.jenis_izin === "LA2"
//         ) {
//           totalPM += 1;
//         }

//         // COUNT ATTEND WEEKDAY
//         if (
//           item.tanggal_absen &&
//           !item.tanggal_libur &&
//           item.jenis_izin !== "C" &&
//           item.jenis_izin !== "I" &&
//           item.jenis_izin !== "S"
//         ) {
//           totalAttend += 1;
//         }

//         // COUNT ATTEND HOLIDAY
//         if (item.tanggal_absen && item.tanggal_libur) {
//           totalAttendWeekend += 1;
//         }

//         // LUPA ABSEN
//         if (
//           !item.tanggal_absen &&
//           (item.jenis_izin === "P/M" ||
//             item.jenis_izin === "TA1" ||
//             item.jenis_izin === "TA2" ||
//             item.jenis_izin === "LA1" ||
//             item.jenis_izin === "LA2")
//         ) {
//           totalAttend += 1;
//         }

//         // ABSENT
//         if (!item.tanggal_absen && !item.tanggal_izin && !item.tanggal_libur) {
//           totalNotAttend += 1;
//         }

//         // OVERTIME
//         if (item.tanggal_ot) {
//           overtime += Number(item.jam_ot);
//           overtimeTotal += Number(item.total_ot);
//         }

//         reportData[reportData.length - 1].late_count = totalLate;
//         reportData[reportData.length - 1].cuti_count = totalC;
//         reportData[reportData.length - 1].cuti_s_count = totalCS;
//         reportData[reportData.length - 1].izin_count = totalI;
//         reportData[reportData.length - 1].izin_s_count = totalIS;
//         reportData[reportData.length - 1].sakit_count = totalS;
//         reportData[reportData.length - 1].g1_count = totalG1;
//         reportData[reportData.length - 1].g2_count = totalG2;
//         reportData[reportData.length - 1].g3_count = totalG3;
//         reportData[reportData.length - 1].pm_count = totalPM;
//         reportData[reportData.length - 1].attend_count = totalAttend;
//         reportData[reportData.length - 1].notattend_count = totalNotAttend;
//         reportData[reportData.length - 1].attend_weekend_count =
//           totalAttendWeekend;

//         reportData[reportData.length - 1].overtime = overtime;
//         reportData[reportData.length - 1].overtime_total = overtimeTotal;
//       }
//     });

//     return {
//       status: true,
//       message: "Data fetched successfully",
//       data: reportData as ReportAttdProps[],
//     };
//   } catch (error) {
//     return HandleError(error) as any;
//   }
// };

// function getDatesInRange(startDate: any, endDate: any) {
//   let dates = [];
//   let currentDate = new Date(startDate);
//   const lastDate = new Date(endDate);

//   while (currentDate <= lastDate) {
//     const formattedDate = new Date(currentDate);
//     formattedDate.setHours(formattedDate.getHours() + 7);
//     dates.push(formattedDate.toISOString().split("T")[0]);
//     currentDate.setDate(currentDate.getDate() + 1);
//   }

//   return dates;
// }

// const jumlahJam = (jumlah_jam: string | null) => {
//   switch (jumlah_jam) {
//     case "0.5":
//       return 30;
//     case "1":
//       return 60;
//     case "1.5":
//       return 90;
//     case "2":
//       return 120;
//     case "2.5":
//       return 150;
//     case "3":
//       return 180;
//     case "3.5":
//       return 210;
//   }
// };
