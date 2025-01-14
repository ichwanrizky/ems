
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.1.0
 * Query Engine version: 11f085a2012c0f4778414c8db2651556ee0ef959
 */
Prisma.prismaVersion = {
  client: "6.1.0",
  engine: "11f085a2012c0f4778414c8db2651556ee0ef959"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.RolesScalarFieldEnum = {
  id: 'id',
  role_name: 'role_name'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  username: 'username',
  password: 'password',
  name: 'name',
  createdAt: 'createdAt',
  rolesId: 'rolesId',
  telp: 'telp',
  pegawai_id: 'pegawai_id',
  is_userluar: 'is_userluar'
};

exports.Prisma.Menu_groupScalarFieldEnum = {
  id: 'id',
  menu_group: 'menu_group',
  urut: 'urut',
  group: 'group',
  parent_id: 'parent_id'
};

exports.Prisma.MenuScalarFieldEnum = {
  id: 'id',
  menu: 'menu',
  path: 'path',
  last_path: 'last_path',
  urut: 'urut',
  menu_group_id: 'menu_group_id'
};

exports.Prisma.Access_menuScalarFieldEnum = {
  id: 'id',
  menu_id: 'menu_id',
  action: 'action',
  role_id: 'role_id'
};

exports.Prisma.Access_departmentScalarFieldEnum = {
  id: 'id',
  role_id: 'role_id',
  department_id: 'department_id'
};

exports.Prisma.SessionScalarFieldEnum = {
  id: 'id',
  token: 'token',
  user_id: 'user_id',
  createdAt: 'createdAt',
  expiredAt: 'expiredAt',
  expired: 'expired'
};

exports.Prisma.Session_mobileScalarFieldEnum = {
  id: 'id',
  token: 'token',
  user_id: 'user_id',
  createdAt: 'createdAt',
  expired: 'expired'
};

exports.Prisma.DepartmentScalarFieldEnum = {
  id: 'id',
  nama_department: 'nama_department',
  lot: 'lot',
  latitude: 'latitude',
  longitude: 'longitude',
  radius: 'radius'
};

exports.Prisma.Sub_departmentScalarFieldEnum = {
  id: 'id',
  nama_sub_department: 'nama_sub_department',
  department_id: 'department_id',
  akses_izin: 'akses_izin',
  manager_id: 'manager_id',
  supervisor_id: 'supervisor_id'
};

exports.Prisma.ManagerScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id'
};

exports.Prisma.SupervisorScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id'
};

exports.Prisma.PegawaiScalarFieldEnum = {
  id: 'id',
  panji_id: 'panji_id',
  nama: 'nama',
  nik_ktp: 'nik_ktp',
  tmp_lahir: 'tmp_lahir',
  tgl_lahir: 'tgl_lahir',
  jk: 'jk',
  agama: 'agama',
  kebangsaan: 'kebangsaan',
  alamat: 'alamat',
  rt: 'rt',
  rw: 'rw',
  kel: 'kel',
  kec: 'kec',
  kota: 'kota',
  telp: 'telp',
  status_nikah: 'status_nikah',
  tgl_join: 'tgl_join',
  tgl_selesai: 'tgl_selesai',
  tgl_reset: 'tgl_reset',
  email: 'email',
  position: 'position',
  npwp: 'npwp',
  jenis_bank: 'jenis_bank',
  no_rek: 'no_rek',
  bpjs_tk: 'bpjs_tk',
  bpjs_kes: 'bpjs_kes',
  department_id: 'department_id',
  sub_department_id: 'sub_department_id',
  is_active: 'is_active',
  is_overtime: 'is_overtime',
  shift_id: 'shift_id',
  type_gaji: 'type_gaji'
};

exports.Prisma.ShiftScalarFieldEnum = {
  id: 'id',
  jam_masuk: 'jam_masuk',
  jam_pulang: 'jam_pulang',
  different_day: 'different_day',
  department_id: 'department_id',
  keterangan: 'keterangan',
  cond_friday: 'cond_friday'
};

exports.Prisma.AbsenScalarFieldEnum = {
  id: 'id',
  pegawai_id: 'pegawai_id',
  tanggal: 'tanggal',
  absen_masuk: 'absen_masuk',
  absen_pulang: 'absen_pulang',
  shift_id: 'shift_id',
  late: 'late',
  early: 'early',
  bulan: 'bulan',
  tahun: 'tahun',
  latitude: 'latitude',
  longitude: 'longitude',
  ket_masuk: 'ket_masuk',
  ket_pulang: 'ket_pulang',
  is_manual: 'is_manual'
};

exports.Prisma.Pengajuan_izinScalarFieldEnum = {
  id: 'id',
  uuid: 'uuid',
  jenis_izin: 'jenis_izin',
  tanggal: 'tanggal',
  pegawai_id: 'pegawai_id',
  status: 'status',
  bulan: 'bulan',
  tahun: 'tahun',
  keterangan: 'keterangan',
  jumlah_hari: 'jumlah_hari',
  jumlah_jam: 'jumlah_jam',
  approve_by: 'approve_by',
  approve_date: 'approve_date',
  known_status: 'known_status',
  known_by: 'known_by',
  known_date: 'known_date',
  department_id: 'department_id'
};

exports.Prisma.IzinScalarFieldEnum = {
  id: 'id',
  jenis_izin: 'jenis_izin',
  tanggal: 'tanggal',
  pegawai_id: 'pegawai_id',
  bulan: 'bulan',
  tahun: 'tahun',
  keterangan: 'keterangan',
  jumlah_hari: 'jumlah_hari',
  jumlah_jam: 'jumlah_jam',
  pengajuan_izin_id: 'pengajuan_izin_id',
  department_id: 'department_id'
};

exports.Prisma.Request_session_izinScalarFieldEnum = {
  id: 'id',
  uuid: 'uuid',
  pegawai_id: 'pegawai_id',
  created_at: 'created_at',
  expired_at: 'expired_at',
  expired: 'expired'
};

exports.Prisma.Tanggal_merahScalarFieldEnum = {
  id: 'id',
  bulan: 'bulan',
  tahun: 'tahun',
  department_id: 'department_id'
};

exports.Prisma.Tanggal_merah_listScalarFieldEnum = {
  id: 'id',
  tanggal: 'tanggal',
  tanggal_merah_id: 'tanggal_merah_id',
  tanggal_nomor: 'tanggal_nomor'
};

exports.Prisma.Pengajuan_overtimeScalarFieldEnum = {
  id: 'id',
  tanggal: 'tanggal',
  jam_from: 'jam_from',
  jam_to: 'jam_to',
  department_id: 'department_id',
  sub_department_id: 'sub_department_id',
  job_desc: 'job_desc',
  remark: 'remark',
  status: 'status',
  bulan: 'bulan',
  tahun: 'tahun',
  approve_by: 'approve_by',
  approve_date: 'approve_date'
};

exports.Prisma.Pengajuan_overtime_pegawaiScalarFieldEnum = {
  id: 'id',
  pengajuan_overtime_id: 'pengajuan_overtime_id',
  pegawai_id: 'pegawai_id'
};

exports.Prisma.OvertimeScalarFieldEnum = {
  id: 'id',
  tanggal: 'tanggal',
  pegawai_id: 'pegawai_id',
  department_id: 'department_id',
  jam: 'jam',
  total: 'total',
  is_holiday: 'is_holiday',
  status: 'status',
  bulan: 'bulan',
  tahun: 'tahun',
  pengajuan_overtime_id: 'pengajuan_overtime_id'
};

exports.Prisma.Lokasi_tambahanScalarFieldEnum = {
  id: 'id',
  lokasi: 'lokasi',
  latitude: 'latitude',
  longitude: 'longitude',
  radius: 'radius'
};

exports.Prisma.Izin_lokasi_tambahanScalarFieldEnum = {
  id: 'id',
  pegawai_id: 'pegawai_id',
  lokasi_tambahan_id: 'lokasi_tambahan_id'
};

exports.Prisma.Komponen_gajiScalarFieldEnum = {
  id: 'id',
  komponen: 'komponen',
  tipe: 'tipe',
  metode: 'metode',
  is_master: 'is_master',
  urut: 'urut',
  urut_tampil: 'urut_tampil',
  is_gaji: 'is_gaji',
  department_id: 'department_id'
};

exports.Prisma.Master_gaji_pegawaiScalarFieldEnum = {
  id: 'id',
  komponen_id: 'komponen_id',
  pegawai_id: 'pegawai_id',
  nominal: 'nominal'
};

exports.Prisma.GajiScalarFieldEnum = {
  id: 'id',
  bulan: 'bulan',
  tahun: 'tahun',
  pegawai_id: 'pegawai_id',
  tipe: 'tipe',
  komponen: 'komponen',
  komponen_id: 'komponen_id',
  nominal: 'nominal',
  urut: 'urut',
  gaji_pegawai_id: 'gaji_pegawai_id'
};

exports.Prisma.Gaji_pegawaiScalarFieldEnum = {
  id: 'id',
  uuid: 'uuid',
  bulan: 'bulan',
  tahun: 'tahun',
  pegawai_id: 'pegawai_id',
  nominal: 'nominal',
  publish: 'publish',
  department_id: 'department_id'
};

exports.Prisma.AdjustmentScalarFieldEnum = {
  id: 'id',
  bulan: 'bulan',
  tahun: 'tahun',
  pegawai_id: 'pegawai_id',
  nominal: 'nominal',
  keterangan: 'keterangan',
  jenis: 'jenis',
  department_id: 'department_id'
};

exports.Prisma.Pph21ScalarFieldEnum = {
  id: 'id',
  bulan: 'bulan',
  tahun: 'tahun',
  department_id: 'department_id',
  pegawai_id: 'pegawai_id',
  gaji: 'gaji',
  pph21: 'pph21'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.rolesOrderByRelevanceFieldEnum = {
  role_name: 'role_name'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.userOrderByRelevanceFieldEnum = {
  username: 'username',
  password: 'password',
  name: 'name',
  telp: 'telp'
};

exports.Prisma.menu_groupOrderByRelevanceFieldEnum = {
  menu_group: 'menu_group',
  parent_id: 'parent_id'
};

exports.Prisma.menuOrderByRelevanceFieldEnum = {
  menu: 'menu',
  path: 'path',
  last_path: 'last_path'
};

exports.Prisma.access_menuOrderByRelevanceFieldEnum = {
  action: 'action'
};

exports.Prisma.sessionOrderByRelevanceFieldEnum = {
  token: 'token'
};

exports.Prisma.session_mobileOrderByRelevanceFieldEnum = {
  token: 'token'
};

exports.Prisma.departmentOrderByRelevanceFieldEnum = {
  nama_department: 'nama_department',
  lot: 'lot',
  latitude: 'latitude',
  longitude: 'longitude',
  radius: 'radius'
};

exports.Prisma.sub_departmentOrderByRelevanceFieldEnum = {
  nama_sub_department: 'nama_sub_department',
  akses_izin: 'akses_izin'
};

exports.Prisma.pegawaiOrderByRelevanceFieldEnum = {
  panji_id: 'panji_id',
  nama: 'nama',
  nik_ktp: 'nik_ktp',
  tmp_lahir: 'tmp_lahir',
  jk: 'jk',
  agama: 'agama',
  kebangsaan: 'kebangsaan',
  alamat: 'alamat',
  rt: 'rt',
  rw: 'rw',
  kel: 'kel',
  kec: 'kec',
  kota: 'kota',
  telp: 'telp',
  status_nikah: 'status_nikah',
  email: 'email',
  position: 'position',
  npwp: 'npwp',
  jenis_bank: 'jenis_bank',
  no_rek: 'no_rek',
  bpjs_tk: 'bpjs_tk',
  bpjs_kes: 'bpjs_kes',
  type_gaji: 'type_gaji'
};

exports.Prisma.shiftOrderByRelevanceFieldEnum = {
  keterangan: 'keterangan'
};

exports.Prisma.absenOrderByRelevanceFieldEnum = {
  latitude: 'latitude',
  longitude: 'longitude',
  ket_masuk: 'ket_masuk',
  ket_pulang: 'ket_pulang'
};

exports.Prisma.pengajuan_izinOrderByRelevanceFieldEnum = {
  uuid: 'uuid',
  jenis_izin: 'jenis_izin',
  keterangan: 'keterangan',
  jumlah_hari: 'jumlah_hari',
  jumlah_jam: 'jumlah_jam'
};

exports.Prisma.izinOrderByRelevanceFieldEnum = {
  jenis_izin: 'jenis_izin',
  keterangan: 'keterangan',
  jumlah_hari: 'jumlah_hari',
  jumlah_jam: 'jumlah_jam'
};

exports.Prisma.request_session_izinOrderByRelevanceFieldEnum = {
  uuid: 'uuid'
};

exports.Prisma.tanggal_merah_listOrderByRelevanceFieldEnum = {
  tanggal_nomor: 'tanggal_nomor'
};

exports.Prisma.pengajuan_overtimeOrderByRelevanceFieldEnum = {
  job_desc: 'job_desc',
  remark: 'remark'
};

exports.Prisma.overtimeOrderByRelevanceFieldEnum = {
  jam: 'jam',
  total: 'total'
};

exports.Prisma.lokasi_tambahanOrderByRelevanceFieldEnum = {
  lokasi: 'lokasi',
  latitude: 'latitude',
  longitude: 'longitude',
  radius: 'radius'
};

exports.Prisma.komponen_gajiOrderByRelevanceFieldEnum = {
  komponen: 'komponen',
  tipe: 'tipe',
  metode: 'metode'
};

exports.Prisma.gajiOrderByRelevanceFieldEnum = {
  tipe: 'tipe',
  komponen: 'komponen',
  nominal: 'nominal'
};

exports.Prisma.gaji_pegawaiOrderByRelevanceFieldEnum = {
  uuid: 'uuid'
};

exports.Prisma.adjustmentOrderByRelevanceFieldEnum = {
  keterangan: 'keterangan',
  jenis: 'jenis'
};


exports.Prisma.ModelName = {
  roles: 'roles',
  user: 'user',
  menu_group: 'menu_group',
  menu: 'menu',
  access_menu: 'access_menu',
  access_department: 'access_department',
  session: 'session',
  session_mobile: 'session_mobile',
  department: 'department',
  sub_department: 'sub_department',
  manager: 'manager',
  supervisor: 'supervisor',
  pegawai: 'pegawai',
  shift: 'shift',
  absen: 'absen',
  pengajuan_izin: 'pengajuan_izin',
  izin: 'izin',
  request_session_izin: 'request_session_izin',
  tanggal_merah: 'tanggal_merah',
  tanggal_merah_list: 'tanggal_merah_list',
  pengajuan_overtime: 'pengajuan_overtime',
  pengajuan_overtime_pegawai: 'pengajuan_overtime_pegawai',
  overtime: 'overtime',
  lokasi_tambahan: 'lokasi_tambahan',
  izin_lokasi_tambahan: 'izin_lokasi_tambahan',
  komponen_gaji: 'komponen_gaji',
  master_gaji_pegawai: 'master_gaji_pegawai',
  gaji: 'gaji',
  gaji_pegawai: 'gaji_pegawai',
  adjustment: 'adjustment',
  pph21: 'pph21'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
