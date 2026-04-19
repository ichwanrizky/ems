import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const bcrypt = require("bcrypt");

async function main() {
  try {
    // menu group
    await prisma.menu_group.deleteMany();
    await prisma.menu_group.createMany({
      data: [
        {
          id: 1,
          menu_group: "CONFIG",
          urut: 99,
          parent_id: "config",
          group: true,
        },
        {
          id: 2,
          menu_group: "HR",
          urut: 1,
          parent_id: "hr",
          group: true,
        },
        {
          id: 3,
          menu_group: "FINANCE",
          urut: 3,
          parent_id: "finance",
          group: true,
        },
      ],
    });

    // menu
    await prisma.menu.deleteMany();
    await prisma.menu.createMany({
      data: [
        // ── CONFIG ──────────────────────────────────────────
        { id: 1,  menu_group_id: 1, menu: "MENU GROUP",       urut: 1,  path: "config/menu_group",      last_path: "menu_group" },
        { id: 2,  menu_group_id: 1, menu: "MENU",             urut: 2,  path: "config/menu",            last_path: "menu" },
        { id: 3,  menu_group_id: 1, menu: "ROLES",            urut: 3,  path: "config/roles",           last_path: "roles" },
        { id: 4,  menu_group_id: 1, menu: "DEPARTMENT",       urut: 4,  path: "config/department",      last_path: "department" },
        { id: 5,  menu_group_id: 1, menu: "SUB DEPARTMENT",   urut: 5,  path: "config/sub_department",  last_path: "sub_department" },
        { id: 6,  menu_group_id: 1, menu: "ACCESS",           urut: 6,  path: "config/access",          last_path: "access" },
        { id: 7,  menu_group_id: 1, menu: "USER",             urut: 7,  path: "config/user",            last_path: "user" },
        { id: 8,  menu_group_id: 1, menu: "USER LUAR",        urut: 8,  path: "config/user_luar",       last_path: "user_luar" },
        { id: 9,  menu_group_id: 1, menu: "TOKEN MOBILE",     urut: 9,  path: "config/tokenmobile",     last_path: "tokenmobile" },
        { id: 10, menu_group_id: 1, menu: "TANGGAL MERAH",    urut: 10, path: "config/tanggalmerah",    last_path: "tanggalmerah" },
        { id: 11, menu_group_id: 1, menu: "LOKASI TAMBAHAN",  urut: 11, path: "config/lokasitambahan", last_path: "lokasitambahan" },

        // ── HR ──────────────────────────────────────────────
        { id: 12, menu_group_id: 2, menu: "DATA KARYAWAN",        urut: 1,  path: "hr/datakaryawan",       last_path: "datakaryawan" },
        { id: 13, menu_group_id: 2, menu: "ABSENSI",              urut: 2,  path: "hr/absensi",            last_path: "absensi" },
        { id: 14, menu_group_id: 2, menu: "ABSENSI PER PEGAWAI",  urut: 3,  path: "hr/absensiperpegawai",  last_path: "absensiperpegawai" },
        { id: 15, menu_group_id: 2, menu: "SHIFT",                urut: 4,  path: "hr/shift-master",       last_path: "shift-master" },
        { id: 16, menu_group_id: 2, menu: "SHIFT ACTIVE",         urut: 5,  path: "hr/shift-active",       last_path: "shift-active" },
        { id: 17, menu_group_id: 2, menu: "PENGAJUAN IZIN",       urut: 6,  path: "hr/izin-pengajuan",     last_path: "izin-pengajuan" },
        { id: 18, menu_group_id: 2, menu: "RIWAYAT IZIN",         urut: 7,  path: "hr/izin-riwayat",       last_path: "izin-riwayat" },
        { id: 19, menu_group_id: 2, menu: "PENGAJUAN OT",         urut: 8,  path: "hr/ot-pengajuan",       last_path: "ot-pengajuan" },
        { id: 20, menu_group_id: 2, menu: "OT PER PEGAWAI",       urut: 9,  path: "hr/ot-perpegawai",      last_path: "ot-perpegawai" },
        { id: 21, menu_group_id: 2, menu: "RIWAYAT OT",           urut: 10, path: "hr/ot-riwayat",         last_path: "ot-riwayat" },
        { id: 22, menu_group_id: 2, menu: "REPORT ATD BULAN",     urut: 11, path: "hr/reportattd-bulan",   last_path: "reportattd-bulan" },
        { id: 23, menu_group_id: 2, menu: "REPORT ATD TANGGAL",   urut: 12, path: "hr/reportattd-tanggal", last_path: "reportattd-tanggal" },

        // ── FINANCE ─────────────────────────────────────────
        { id: 24, menu_group_id: 3, menu: "MASTER GAJI",      urut: 1, path: "finance/mastergaji",    last_path: "mastergaji" },
        { id: 25, menu_group_id: 3, menu: "GAJI",             urut: 2, path: "finance/gaji",          last_path: "gaji" },
        { id: 26, menu_group_id: 3, menu: "ADJUSTMENT GAJI",  urut: 3, path: "finance/adjustmengaji", last_path: "adjustmengaji" },
        { id: 27, menu_group_id: 3, menu: "PPH 21",           urut: 4, path: "finance/pph",           last_path: "pph" },
        { id: 28, menu_group_id: 3, menu: "THR",              urut: 5, path: "finance/thr",           last_path: "thr" },
      ],
    });

    // roles
    await prisma.roles.deleteMany();
    await prisma.roles.createMany({
      data: [
        {
          id: 1,
          role_name: "ADMINISTRATOR".toUpperCase(),
        },
      ],
    });

    // department
    await prisma.akses_izin_department.deleteMany();
    await prisma.department.deleteMany();
    const jenisIzin = await prisma.jenis_izin.findMany({
      select: {
        kode: true,
      },
    });
    await prisma.department.create({
      data: {
        id: 1,
        nama_department: "panji jaya".toUpperCase(),
        akses_izin_department: {
          create: jenisIzin.map((item) => ({
            jenis_izin_kode: item.kode,
          })),
        },
      },
    });

    // sub department
    await prisma.sub_department.deleteMany();
    await prisma.sub_department.createMany({
      data: [
        {
          id: 1,
          nama_sub_department: "management".toUpperCase(),
          department_id: 1,
        },
        {
          id: 2,
          nama_sub_department: "hr".toUpperCase(),
          department_id: 1,
        },
        {
          id: 3,
          nama_sub_department: "battery".toUpperCase(),
          department_id: 1,
        },
        {
          id: 4,
          nama_sub_department: "automotive".toUpperCase(),
          department_id: 1,
        },
        {
          id: 5,
          nama_sub_department: "nka".toUpperCase(),
          department_id: 1,
        },
        {
          id: 6,
          nama_sub_department: "project".toUpperCase(),
          department_id: 1,
        },
      ],
    });

    // user
    const password = await bcrypt.hash("sarutobi11", 10);

    await prisma.user.deleteMany();
    await prisma.user.create({
      data: {
        id: 1,
        username: "ichwan",
        password,
        name: "ICHWAN RIZKY",
        telp: "08117779914",
        role_id: 1,
      },
    });

    // access — full access untuk ADMINISTRATOR ke semua menu
    const menuData = await prisma.menu.findMany({
      select: {
        id: true,
      },
    });

    await prisma.access.deleteMany();
    await prisma.access.createMany({
      data: menuData.map((menu) => ({
        role_id: 1,
        menu_id: menu.id,
        view: true,
        insert: true,
        update: true,
        delete: true,
      })),
    });

    // access department
    await prisma.access_department.deleteMany();

    // access sub department
    await prisma.access_sub_department.deleteMany();

    console.log("Seeding Complete");
  } catch (error) {
    console.log("Seeding Error: ", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch(() => process.exit(1));
