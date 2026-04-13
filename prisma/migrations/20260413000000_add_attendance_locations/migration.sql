-- CreateTable
CREATE TABLE `department_location` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_lokasi` VARCHAR(191) NULL,
    `latitude` VARCHAR(191) NOT NULL,
    `longitude` VARCHAR(191) NOT NULL,
    `radius` VARCHAR(191) NOT NULL,
    `department_id` INTEGER NOT NULL,

    INDEX `department_location_department_id_idx`(`department_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pegawai_location` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_lokasi` VARCHAR(191) NULL,
    `latitude` VARCHAR(191) NOT NULL,
    `longitude` VARCHAR(191) NOT NULL,
    `radius` VARCHAR(191) NOT NULL,
    `pegawai_id` INTEGER NOT NULL,

    INDEX `pegawai_location_pegawai_id_idx`(`pegawai_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `department_location` ADD CONSTRAINT `department_location_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `department`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pegawai_location` ADD CONSTRAINT `pegawai_location_pegawai_id_fkey` FOREIGN KEY (`pegawai_id`) REFERENCES `pegawai`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
