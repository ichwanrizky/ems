-- CreateTable
CREATE TABLE `pegawai` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `panji_id` VARCHAR(191) NULL,
    `nama` VARCHAR(191) NOT NULL,
    `nik_ktp` VARCHAR(191) NOT NULL,
    `tmp_lahir` VARCHAR(191) NULL,
    `tgl_lahir` DATE NULL,
    `jk` VARCHAR(191) NOT NULL,
    `agama` VARCHAR(191) NULL,
    `kebangsaan` VARCHAR(191) NULL,
    `alamat` VARCHAR(191) NULL,
    `rt` VARCHAR(191) NULL,
    `rw` VARCHAR(191) NULL,
    `kel` VARCHAR(191) NULL,
    `kec` VARCHAR(191) NULL,
    `kota` VARCHAR(191) NULL,
    `telp` VARCHAR(191) NULL,
    `status_nikah` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `position` VARCHAR(191) NULL,
    `npwp` VARCHAR(191) NULL,
    `jenis_bank` VARCHAR(191) NULL,
    `no_rek` VARCHAR(191) NULL,
    `bpjs_tk` VARCHAR(191) NULL,
    `bpjs_kes` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `department_id` INTEGER NOT NULL,
    `sub_department_id` INTEGER NULL,
    `shift_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `pegawai` ADD CONSTRAINT `pegawai_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `department`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pegawai` ADD CONSTRAINT `pegawai_sub_department_id_fkey` FOREIGN KEY (`sub_department_id`) REFERENCES `sub_department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pegawai` ADD CONSTRAINT `pegawai_shift_id_fkey` FOREIGN KEY (`shift_id`) REFERENCES `shift`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
