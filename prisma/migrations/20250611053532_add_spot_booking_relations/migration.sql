/*
  Warnings:

  - Added the required column `endDate` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `bookings` table without a default value. This is not possible if the table is not empty.

*/

-- DropForeignKey
ALTER TABLE `campingspots` DROP FOREIGN KEY `campingSpots_cityId_fkey`;

-- DropForeignKey
ALTER TABLE `campingspots` DROP FOREIGN KEY `campingSpots_userId_fkey`;

-- DropIndex
DROP INDEX `campingSpots_cityId_fkey` ON `campingspots`;

-- DropIndex
DROP INDEX `campingSpots_userId_fkey` ON `campingspots`;

-- AlterTable
ALTER TABLE `bookings`
  ADD COLUMN `comment` VARCHAR(191) NULL,
  ADD COLUMN `commissionAmount` DOUBLE NULL,
  ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  ADD COLUMN `endDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN `isColor` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `price` DOUBLE NULL,
  ADD COLUMN `referenceURL` VARCHAR(191) NULL,
  ADD COLUMN `startDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE `campingSpots` ADD CONSTRAINT `campingSpots_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `campingSpots` ADD CONSTRAINT `campingSpots_cityId_fkey` FOREIGN KEY (`cityId`) REFERENCES `cities`(`cityId`) ON DELETE SET NULL ON UPDATE CASCADE;
