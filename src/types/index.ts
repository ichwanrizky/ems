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
