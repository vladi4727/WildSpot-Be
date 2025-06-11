/*
  Warnings:

  - You are about to drop the column `spotId` on the `reviews` table. All the data in the column will be lost.
  - Added the required column `bookingId` to the `reviews` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `campingspots` DROP FOREIGN KEY `campingspots_ibfk_1`;

-- DropForeignKey
ALTER TABLE `campingspots` DROP FOREIGN KEY `campingspots_ibfk_2`;

-- DropForeignKey
ALTER TABLE `reviews` DROP FOREIGN KEY `reviews_spotId_fkey`;

-- DropForeignKey
ALTER TABLE `reviews` DROP FOREIGN KEY `reviews_userId_fkey`;

-- DropForeignKey
ALTER TABLE `spotstyles` DROP FOREIGN KEY `spotstyles_ibfk_1`;

-- DropForeignKey
ALTER TABLE `spotstyles` DROP FOREIGN KEY `spotstyles_ibfk_2`;

-- DropIndex
DROP INDEX `reviews_spotId_idx` ON `reviews`;

-- DropIndex
DROP INDEX `userId` ON `reviews`;

-- AlterTable
ALTER TABLE `reviews` DROP COLUMN `spotId`,
    ADD COLUMN `bookingId` INTEGER NOT NULL,
    MODIFY `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `rating` INTEGER NULL,
    MODIFY `comment` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `bookings` (
    `bookingId` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `spotId` INTEGER NOT NULL,

    PRIMARY KEY (`bookingId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `reviews_bookingId_idx` ON `reviews`(`bookingId`);

-- AddForeignKey
ALTER TABLE `campingSpots` ADD CONSTRAINT `campingSpots_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `campingSpots` ADD CONSTRAINT `campingSpots_cityId_fkey` FOREIGN KEY (`cityId`) REFERENCES `cities`(`cityId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `spotstyles` ADD CONSTRAINT `spotstyles_spotId_fkey` FOREIGN KEY (`spotId`) REFERENCES `campingSpots`(`spotId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `spotstyles` ADD CONSTRAINT `spotstyles_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `styles`(`styleId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_spotId_fkey` FOREIGN KEY (`spotId`) REFERENCES `campingSpots`(`spotId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `bookings`(`bookingId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `spotstyles` RENAME INDEX `spotId` TO `spotstyles_spotId_idx`;

-- RenameIndex
ALTER TABLE `spotstyles` RENAME INDEX `styleId` TO `spotstyles_styleId_idx`;
