CREATE TABLE `akses_izin_department` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `department_id` INTEGER NOT NULL,
    `jenis_izin_kode` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `akses_izin_department_department_id_jenis_izin_kode_key`(`department_id`, `jenis_izin_kode`),
    INDEX `akses_izin_department_jenis_izin_kode_fkey`(`jenis_izin_kode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `akses_izin_department` (`department_id`, `jenis_izin_kode`)
SELECT d.`id`, ji.`kode`
FROM `department` d
CROSS JOIN `jenis_izin` ji
WHERE d.`is_deleted` = false;

ALTER TABLE `akses_izin_department` ADD CONSTRAINT `akses_izin_department_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `department`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `akses_izin_department` ADD CONSTRAINT `akses_izin_department_jenis_izin_kode_fkey` FOREIGN KEY (`jenis_izin_kode`) REFERENCES `jenis_izin`(`kode`) ON DELETE RESTRICT ON UPDATE CASCADE;
