export type isLoadingProps = {
  [key: number]: boolean;
};

export type MenuGroupProps = {
  id: number;
  menu_group: string;
  urut: number;
  group: boolean;
  parent_id: string;
};

export type AlertProps = {
  status: boolean;
  color: string;
  message: string;
  subMessage: string;
};

export type MenuProps = {
  id: number;
  menu: string;
  path: string;
  last_path: string;
  urut: number;
  menu_group_id: number;
  menu_group: MenuGroupProps;
};

export type RolesProps = {
  id: number;
  role_name: string;
};

export type DepartmentProps = {
  id: number;
  nama_department: string;
  latitude: string;
  longitude: string;
  radius: string;
};

export type SubDepartmentProps = {
  id: number;
  nama_sub_department: string;
  department_id: number;
  department?: DepartmentProps;
  leader_user?: {
    id: number;
    name: string;
  };
  supervisor_user?: {
    id: number;
    name: string;
  };
  manager_user?: {
    id: number;
    name: string;
  };
  akses_izin?: {
    jenis_izin: {
      kode: string;
      jenis: string;
    };
  }[];
};

export type SeesionProps = {
  user: {
    id: string;
    username: string;
    role_id: number;
    role_name: string;
    access_department: AccessDepartmentProps;
    access_sub_department: AccessSubDepartmentProps;
    menu: {
      id: number;
      menu_group: string;
      group: boolean;
      parent_id: string;
      menu: {
        id: number;
        menu: string;
        path: string;
        access: {
          view: boolean;
          insert: boolean;
          update: boolean;
          delete: boolean;
        }[];
      }[];
    }[];
  };
};

export type AccessDepartmentProps = {
  department: {
    id: number;
    nama_department: string;
  };
}[];

export type AccessSubDepartmentProps = {
  sub_department: {
    id: number;
    nama_sub_department: string;
    department_id: number;
  };
}[];

export type AccessProps = {
  view: boolean;
  insert: boolean;
  update: boolean;
  delete: boolean;
};

export type ShiftMasterProps = {
  id: number;
  jam_masuk: Date;
  jam_pulang: Date;
  keterangan: string;
  different_day: boolean;
  cond_friday: number;
  department_id: number;
  department: {
    id: number;
    nama_department: string;
  };
};

export type PegawaiProps = {
  number?: number;
  id: number;
  panji_id?: string;
  nama: string;
  nik_ktp: string;
  tmp_lahir?: string;
  tgl_lahir?: Date;
  jk: string;
  agama?: string;
  kebangsaan?: string;
  alamat?: string;
  rt?: string;
  rw?: string;
  kel?: string;
  kec?: string;
  kota?: string;
  telp: string;
  status_nikah: string;
  email?: string;
  position?: string;
  npwp?: string;
  jenis_bank?: string;
  no_rek?: string;
  bpjs_tk?: string;
  bpjs_kes?: string;
  department_id: number;
  department: {
    id: number;
    nama_department: string;
  };
  sub_department_id?: number;
  sub_department?: {
    id: number;
    nama_sub_department: string;
  };
  shift_id?: number;
  shift?: {
    id: number;
    nama_shift: string;
  };
  tgl_join?: Date;
  is_active: boolean;
  user: {
    id: number;
  }[];
};

export type PegawaiCreateProps = {
  id: number;
  department_id: number;
  sub_department_id: number | null;
  panji_id: string;
  nama: string;
  nik_ktp: string | number;
  position: string;
  tmp_lahir: string;
  tgl_lahir: Date | null;
  jk: string;
  agama: string;
  telp: string | number;
  email: string;
  alamat: string;
  rt: string;
  rw: string;
  kel: string;
  kec: string;
  kota: string;
  kebangsaan: string;
  status_nikah: string;
  tgl_join: Date | null;
  npwp: string;
  jenis_bank: string;
  no_rek: string;
  bpjs_tk: string;
  bpjs_kes: string;
};

export type PegawaiShiftProps = {
  id: number;
  nama: string;
  shift_id: number;
};

export type AtasanProps = {
  id?: number;
  username?: string;
  pegawai: {
    id: number;
    nama: string;
  };
};

export type AbsenProps = {
  id: number;
  nama: string;
  absen: {
    id: number;
    tanggal: Date;
    absen_masuk: Date;
    absen_pulang: Date;
    late: number;
  }[];
  izin: {
    jenis_izin: {
      kode: string;
      jenis: string;
      is_jam: boolean;
    };
    jumlah_jam: string;
    jumlah_hari: string;
  }[];
};

export type PengajuanIzinProps = {
  id: number;
  uuid: string;
  tanggal: Date;
  tahun: number;
  bulan: number;
  keterangan: string;
  jumlah_hari: string;
  jumlah_jam: string;
  jenis_izin: {
    kode: string;
    jenis: string;
  };
  pegawai: {
    nama: string;
  };
};

export type RiwayatIzinProps = {
  number: number;
  id: number;
  uuid: string;
  tanggal: Date;
  tahun: number;
  bulan: number;
  keterangan: string;
  jumlah_hari: string;
  jumlah_jam: string;
  jenis_izin: {
    kode: string;
    jenis: string;
  };
  pegawai: {
    nama: string;
  };
  user_approved: {
    name: string;
  };
  approve_date: Date;
  status: number;
};

export interface PengajuanOvertimeProps {
  id: number;
  pengajuan_overtime_pegawai: {
    pegawai: {
      id: number;
      nama: string;
    };
  }[];
  sub_department: {
    id: number;
    nama_sub_department: string;
    manager: number | null;
    supervisor: number | null;
  };
  tanggal: Date;
  jam_from: Date;
  jam_to: Date;
  job_desc: string;
  remark: string;
  approval: boolean;
}

export interface RiwayatOvertimeProps {
  number: number;
  id: number;
  pengajuan_overtime_pegawai: {
    pegawai: {
      id: number;
      nama: string;
    };
  }[];
  sub_department: {
    id: number;
    nama_sub_department: string;
    manager: number | null;
    supervisor: number | null;
  };
  tanggal: Date;
  jam_from: Date;
  jam_to: Date;
  job_desc: string;
  remark: string;
  status: number;
  user: {
    name: string;
  };
  approve_date: Date;
}

export type AttendanceMonthlyProps = {
  id: number;
  nama: string;
  tanggal: Date;
  hari: number;
  tanggal_libur: Date;
  absen_id: number;
  tanggal_absen: Date;
  absen_masuk: string;
  absen_pulang: string;
  late: number;
  izin: {
    jenis_izin_kode: string;
    jenis_izin: string;
    jumlah_jam: string;
    jumlah_hari: string;
  }[];
  tanggal_ot: Date;
  jam_ot: String;
  total_ot: String;
};

export type OvertimeMonthlyProps = {
  id: number;
  tanggal: Date;
  pegawai: {
    nama: string;
  };
  jam: string;
  total: string;
  is_holiday: boolean;
};

export type AdjustmentProps = {
  id: number;
  jenis: string;
  nominal: number;
  keterangan: string;
  pegawai: {
    id: number;
    nama: string;
  };
  department_id: number;
  bulan: number;
  tahun: number;
};
