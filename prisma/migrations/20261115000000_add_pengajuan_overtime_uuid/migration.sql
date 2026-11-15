-- Link approval OT tanpa login: uuid per pengajuan + penanda approve via link.
ALTER TABLE `pengajuan_overtime`
    ADD COLUMN `uuid` VARCHAR(191) NULL,
    ADD COLUMN `approve_via_link` BOOLEAN NOT NULL DEFAULT false;

-- Isi uuid untuk pengajuan yang sudah ada.
-- Pakai UUID v4 acak (RANDOM_BYTES), BUKAN UUID() bawaan MySQL: UUID() = v1
-- berbasis waktu, berurutan dalam satu UPDATE sehingga bisa ditebak — padahal
-- uuid ini jadi kunci link approval tanpa login.
UPDATE `pengajuan_overtime`
SET `uuid` = LOWER(CONCAT(
    HEX(RANDOM_BYTES(4)), '-',
    HEX(RANDOM_BYTES(2)), '-4',
    SUBSTR(HEX(RANDOM_BYTES(2)), 2, 3), '-',
    HEX(FLOOR(ASCII(RANDOM_BYTES(1)) / 64) + 8), SUBSTR(HEX(RANDOM_BYTES(2)), 2, 3), '-',
    HEX(RANDOM_BYTES(6))
))
WHERE `uuid` IS NULL;

ALTER TABLE `pengajuan_overtime` MODIFY `uuid` VARCHAR(191) NOT NULL;

CREATE UNIQUE INDEX `pengajuan_overtime_uuid_key` ON `pengajuan_overtime`(`uuid`);
