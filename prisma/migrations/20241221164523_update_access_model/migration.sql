-- CreateTable
CREATE TABLE `access_department` (
    `role_id` INTEGER NOT NULL,
    `department_id` INTEGER NOT NULL,

    PRIMARY KEY (`role_id`, `department_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `access_sub_department` (
    `role_id` INTEGER NOT NULL,
    `sub_department_id` INTEGER NOT NULL,

    PRIMARY KEY (`role_id`, `sub_department_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `access` (
    `role_id` INTEGER NOT NULL,
    `menu_id` INTEGER NOT NULL,
    `view` BOOLEAN NOT NULL DEFAULT false,
    `insert` BOOLEAN NOT NULL DEFAULT false,
    `update` BOOLEAN NOT NULL DEFAULT false,
    `delete` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`role_id`, `menu_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `access_department` ADD CONSTRAINT `access_department_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `access_department` ADD CONSTRAINT `access_department_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `department`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `access_sub_department` ADD CONSTRAINT `access_sub_department_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `access_sub_department` ADD CONSTRAINT `access_sub_department_sub_department_id_fkey` FOREIGN KEY (`sub_department_id`) REFERENCES `sub_department`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `access` ADD CONSTRAINT `access_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `access` ADD CONSTRAINT `access_menu_id_fkey` FOREIGN KEY (`menu_id`) REFERENCES `menu`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
