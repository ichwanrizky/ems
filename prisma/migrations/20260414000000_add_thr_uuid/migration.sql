-- Add uuid to existing THR rows safely.
ALTER TABLE `thr` ADD COLUMN `uuid` VARCHAR(191) NULL;

UPDATE `thr`
SET `uuid` = UUID()
WHERE `uuid` IS NULL;

ALTER TABLE `thr` MODIFY `uuid` VARCHAR(191) NOT NULL;

CREATE UNIQUE INDEX `thr_uuid_key` ON `thr`(`uuid`);
