import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    // menu group
    await prisma.menu_group.deleteMany();
    await prisma.menu_group.createMany({
      data: [
        {
          id: 1,
          menu_group: "config".toUpperCase(),
          urut: 99,
          parent_id: "config",
        },
      ],
    });

    // menu
    await prisma.menu.deleteMany();
    await prisma.menu.createMany({
      data: [
        {
          id: 1,
          menu_group_id: 1,
          menu: "menu group".toUpperCase(),
          urut: 1,
          path: "config/menu_group",
          last_path: "menu_group",
        },
        {
          id: 2,
          menu_group_id: 1,
          menu: "menu".toUpperCase(),
          urut: 2,
          path: "config/menu",
          last_path: "menu",
        },
        {
          id: 3,
          menu_group_id: 1,
          menu: "roles".toUpperCase(),
          urut: 3,
          path: "config/roles",
          last_path: "roles",
        },
        {
          id: 4,
          menu_group_id: 1,
          menu: "department".toUpperCase(),
          urut: 4,
          path: "config/department",
          last_path: "department",
        },
        {
          id: 5,
          menu_group_id: 1,
          menu: "sub department".toUpperCase(),
          urut: 5,
          path: "config/sub_department",
          last_path: "sub_department",
        },
        {
          id: 6,
          menu_group_id: 1,
          menu: "access".toUpperCase(),
          urut: 6,
          path: "config/access",
          last_path: "access",
        },
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
    await prisma.department.deleteMany();
    await prisma.department.create({
      data: {
        id: 1,
        nama_department: "panji jaya".toUpperCase(),
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

    await prisma.user.deleteMany();
    await prisma.user.create({
      data: {
        id: 1,
        username: "ichwan",
        password: "sarutobi11",
        name: "ICHWAN RIZKY",
        telp: "08117779914",
        role_id: 1,
      },
    });

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
