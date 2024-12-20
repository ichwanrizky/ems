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
