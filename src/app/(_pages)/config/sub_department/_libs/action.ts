"use server";

import { HandleError } from "@/libs/Error";
import prisma from "@/libs/Prisma";
import { AtasanProps, SubDepartmentProps } from "@/types";

export const getSubDepartmentMultipleDepartment = async (
  department_id: { value: number; label: string }[]
): Promise<{
  status: boolean;
  message: string;
  data: SubDepartmentProps[] | [];
}> => {
  try {
    const result = (await prisma.sub_department.findMany({
      include: {
        department: true,
      },
      where: {
        is_deleted: false,
        department_id: {
          in: department_id.map((item) => item.value),
        },
      },
    })) as SubDepartmentProps[];

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

export const getAtasan = async (): Promise<{
  status: boolean;
  message: string;
  data: AtasanProps[] | [];
}> => {
  try {
    const result = (await prisma.user.findMany({
      select: {
        id: true,
        pegawai: {
          select: {
            id: true,
            nama: true,
          },
        },
      },
      where: {
        is_deleted: false,
      },
      orderBy: {
        name: "asc",
      },
    })) as AtasanProps[];

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

export const getJenisIzin = async (): Promise<{
  status: boolean;
  message: string;
  data: any[] | [];
}> => {
  try {
    const result = await prisma.jenis_izin.findMany({
      orderBy: {
        jenis: "asc",
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

export const getSubDepartment = async (
  search?: string,
  filter?: {
    department: string | number;
  }
): Promise<{
  status: boolean;
  message: string;
  data: SubDepartmentProps[] | [];
}> => {
  try {
    const result = (await prisma.sub_department.findMany({
      select: {
        id: true,
        nama_sub_department: true,
        department: {
          select: {
            id: true,
            nama_department: true,
          },
        },
        leader_user: {
          select: {
            id: true,
            name: true,
          },
        },
        supervisor_user: {
          select: {
            id: true,
            name: true,
          },
        },
        manager_user: {
          select: {
            id: true,
            name: true,
          },
        },
        akses_izin: {
          select: {
            jenis_izin: {
              select: {
                kode: true,
                jenis: true,
              },
            },
          },
        },
      },
      where: {
        is_deleted: false,
        ...(search && {
          OR: [
            {
              nama_sub_department: {
                contains: search,
              },
            },
            {
              department: {
                nama_department: {
                  contains: search,
                },
              },
            },
          ],
        }),
        department_id: Number(filter?.department),
      },
      orderBy: [
        {
          department_id: "asc",
        },
        {
          nama_sub_department: "asc",
        },
      ],
    })) as SubDepartmentProps[];

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

export const getSubDepartmentId = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
  data: SubDepartmentProps | null;
}> => {
  try {
    const result = (await prisma.sub_department.findFirst({
      select: {
        id: true,
        nama_sub_department: true,
        department: {
          select: {
            id: true,
            nama_department: true,
          },
        },
        leader_user: {
          select: {
            id: true,
            name: true,
          },
        },
        supervisor_user: {
          select: {
            id: true,
            name: true,
          },
        },
        manager_user: {
          select: {
            id: true,
            name: true,
          },
        },
        akses_izin: {
          select: {
            jenis_izin: {
              select: {
                kode: true,
                jenis: true,
              },
            },
          },
        },
      },
      where: {
        is_deleted: false,
        id,
      },
    })) as SubDepartmentProps;

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

export const createSubDepartment = async (data: {
  department: number;
  nama_sub_department: string;
  leader: number | null;
  supervisor: number | null;
  manager: number | null;
  akses_izin: { value: string; label: string }[];
}): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const result = await prisma.sub_department.create({
      data: {
        department_id: data.department,
        nama_sub_department: data.nama_sub_department?.toUpperCase(),
        leader: data.leader,
        supervisor: data.supervisor,
        manager: data.manager,
        akses_izin: {
          create: data.akses_izin?.map((item) => ({
            jenis_izin_kode: item.value,
          })),
        },
      },
    });

    if (!result) {
      return {
        status: false,
        message: "Create data failed",
      };
    }

    return {
      status: true,
      message: "Create data successfully",
    };
  } catch (error) {
    return HandleError(error) as any;
  }
};

export const editSubDepartment = async (data: {
  id: number;
  department: number;
  nama_sub_department: string;
  leader: number | null;
  supervisor: number | null;
  manager: number | null;
  akses_izin: { value: string; label: string }[];
}): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const result = await prisma.sub_department.update({
      where: {
        id: data.id,
        is_deleted: false,
      },
      data: {
        department_id: data.department,
        nama_sub_department: data.nama_sub_department?.toUpperCase(),
        leader: data.leader,
        supervisor: data.supervisor,
        manager: data.manager,
        akses_izin: {
          deleteMany: {},
          create: data.akses_izin?.map((item) => ({
            jenis_izin_kode: item.value,
          })),
        },
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
    return HandleError(error) as any;
  }
};

export const deleteSubDepartment = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const result = await prisma.sub_department.update({
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
    return HandleError(error) as any;
  }
};
