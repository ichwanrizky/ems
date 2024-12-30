/*
  Warnings:

  - Made the column `telp` on table `pegawai` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `pegawai` MODIFY `telp` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `pegawai_id` INTEGER NULL;

-- CreateTable
CREATE TABLE `pegawai_history` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pegawai_id` INTEGER NOT NULL,
    `tanggal` DATE NOT NULL,
    `jenis` ENUM('JOIN', 'REGISN') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_pegawai_id_fkey` FOREIGN KEY (`pegawai_id`) REFERENCES `pegawai`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pegawai_history` ADD CONSTRAINT `pegawai_history_pegawai_id_fkey` FOREIGN KEY (`pegawai_id`) REFERENCES `pegawai`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
