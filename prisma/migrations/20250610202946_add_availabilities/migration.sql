-- CreateTable
CREATE TABLE `availabilities` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `spotId` INTEGER NOT NULL,
    `dateFrom` DATETIME(3) NOT NULL,
    `dateTo` DATETIME(3) NOT NULL,
    `isBooked` BOOLEAN NOT NULL DEFAULT false,

    INDEX `availabilities_spotId_idx`(`spotId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `availabilities` ADD CONSTRAINT `availabilities_spotId_fkey` FOREIGN KEY (`spotId`) REFERENCES `campingSpots`(`spotId`) ON DELETE CASCADE ON UPDATE CASCADE;
