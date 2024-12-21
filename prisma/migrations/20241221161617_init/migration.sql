-- CreateTable
CREATE TABLE `menu_group` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `menu_group` VARCHAR(191) NOT NULL,
    `urut` INTEGER NULL,
    `group` BOOLEAN NULL,
    `parent_id` VARCHAR(191) NULL,

    UNIQUE INDEX `menu_group_menu_group_key`(`menu_group`),
    INDEX `menu_group_menu_group_urut_parent_id_idx`(`menu_group`, `urut`, `parent_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `menu` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `menu` VARCHAR(191) NULL,
    `path` VARCHAR(191) NULL,
    `last_path` VARCHAR(191) NULL,
    `urut` INTEGER NULL,
    `menu_group_id` INTEGER NOT NULL,

    INDEX `menu_urut_menu_group_id_idx`(`urut`, `menu_group_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `role_name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `roles_role_name_key`(`role_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `department` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_department` VARCHAR(191) NOT NULL,
    `latitude` VARCHAR(191) NULL,
    `longitude` VARCHAR(191) NULL,
    `radius` VARCHAR(191) NULL,
    `created_at` DATETIME(0) NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `department_nama_department_key`(`nama_department`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sub_department` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_sub_department` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(0) NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `department_id` INTEGER NOT NULL,

    UNIQUE INDEX `sub_department_nama_sub_department_key`(`nama_sub_department`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `menu` ADD CONSTRAINT `menu_menu_group_id_fkey` FOREIGN KEY (`menu_group_id`) REFERENCES `menu_group`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sub_department` ADD CONSTRAINT `sub_department_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `department`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
