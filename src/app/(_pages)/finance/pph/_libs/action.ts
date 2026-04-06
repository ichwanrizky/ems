"use server";
import { HandleError } from "@/libs/Error";
import prisma from "@/libs/Prisma";

type PphProps = {
  id: number;
  gaji: number;
  pph21: number;
  thr: number | null;
  pegawai_id: number;
  nama: string;
  npwp: string | null;
};

export const getPph = async (
  search?: string,
  filter?: {
    department: string | number;
    tahun: string | number;
    bulan: string | number;
  },
): Promise<{
  status: boolean;
  message: string;
  data: PphProps[];
}> => {
  try {
    const nameFilter = search ? `%${search}%` : null;

    const result = await prisma.$queryRaw<PphProps[]>`
      SELECT 
        p.id,
        p.gaji,
        p.pph21,
        peg.id as pegawai_id,
        peg.nama,
        peg.npwp,
        t.thr
      FROM pph21 p
      LEFT JOIN thr t ON t.pegawai_id = p.pegawai_id 
        AND t.bulan = p.bulan 
        AND t.tahun = p.tahun
      JOIN pegawai peg ON peg.id = p.pegawai_id
      WHERE p.department_id = ${Number(filter?.department)}
        AND p.bulan = ${Number(filter?.bulan)}
        AND p.tahun = ${Number(filter?.tahun)}
        AND (${nameFilter} IS NULL OR peg.nama LIKE ${nameFilter})
    `;

    return {
      status: true,
      message: "Data fetched successfully",
      data: result ?? [],
    };
  } catch (error) {
    return HandleError(error) as any;
  }
};
