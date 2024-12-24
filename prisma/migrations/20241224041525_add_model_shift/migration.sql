-- CreateTable
CREATE TABLE `shift` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `jam_masuk` TIME(0) NULL,
    `jam_pulang` TIME(0) NULL,
    `keterangan` VARCHAR(191) NULL,
    `different_day` BOOLEAN NOT NULL DEFAULT false,
    `cond_friday` INTEGER NOT NULL DEFAULT 0,
    `department_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `shift` ADD CONSTRAINT `shift_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `department`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
