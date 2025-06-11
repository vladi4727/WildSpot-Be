/*
  Warnings:

  - You are about to drop the column `bookingId` on the `reviews` table. All the data in the column will be lost.
  - You are about to drop the `appointmentslots` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `artists` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `artiststyles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bookings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bookingstatuses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `favorites` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `placements` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `savedar` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sizes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tattoos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tattoostyles` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `spotId` to the `reviews` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `appointmentslots` DROP FOREIGN KEY `appointmentslots_ibfk_1`;

-- DropForeignKey
ALTER TABLE `artists` DROP FOREIGN KEY `artists_ibfk_1`;

-- DropForeignKey
ALTER TABLE `artists` DROP FOREIGN KEY `artists_ibfk_2`;

-- DropForeignKey
ALTER TABLE `artiststyles` DROP FOREIGN KEY `artiststyles_ibfk_1`;

-- DropForeignKey
ALTER TABLE `artiststyles` DROP FOREIGN KEY `artiststyles_ibfk_2`;

-- DropForeignKey
ALTER TABLE `bookings` DROP FOREIGN KEY `bookings_ibfk_1`;

-- DropForeignKey
ALTER TABLE `bookings` DROP FOREIGN KEY `bookings_ibfk_2`;

-- DropForeignKey
ALTER TABLE `bookings` DROP FOREIGN KEY `bookings_ibfk_3`;

-- DropForeignKey
ALTER TABLE `bookings` DROP FOREIGN KEY `bookings_ibfk_4`;

-- DropForeignKey
ALTER TABLE `bookings` DROP FOREIGN KEY `bookings_ibfk_5`;

-- DropForeignKey
ALTER TABLE `bookings` DROP FOREIGN KEY `bookings_ibfk_6`;

-- DropForeignKey
ALTER TABLE `favorites` DROP FOREIGN KEY `favorites_ibfk_1`;

-- DropForeignKey
ALTER TABLE `favorites` DROP FOREIGN KEY `favorites_ibfk_2`;

-- DropForeignKey
ALTER TABLE `reviews` DROP FOREIGN KEY `reviews_ibfk_1`;

-- DropForeignKey
ALTER TABLE `reviews` DROP FOREIGN KEY `reviews_ibfk_2`;

-- DropForeignKey
ALTER TABLE `savedar` DROP FOREIGN KEY `savedar_ibfk_1`;

-- DropForeignKey
ALTER TABLE `tattoos` DROP FOREIGN KEY `tattoos_ibfk_1`;

-- DropForeignKey
ALTER TABLE `tattoostyles` DROP FOREIGN KEY `tattoostyles_ibfk_1`;

-- DropForeignKey
ALTER TABLE `tattoostyles` DROP FOREIGN KEY `tattoostyles_ibfk_2`;

-- DropIndex
DROP INDEX `bookingId` ON `reviews`;

-- AlterTable
ALTER TABLE `reviews` DROP COLUMN `bookingId`,
    ADD COLUMN `spotId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `role` VARCHAR(191) NOT NULL DEFAULT 'user';

-- DropTable
DROP TABLE `appointmentslots`;

-- DropTable
DROP TABLE `artists`;

-- DropTable
DROP TABLE `artiststyles`;

-- DropTable
DROP TABLE `bookings`;

-- DropTable
DROP TABLE `bookingstatuses`;

-- DropTable
DROP TABLE `favorites`;

-- DropTable
DROP TABLE `placements`;

-- DropTable
DROP TABLE `savedar`;

-- DropTable
DROP TABLE `sizes`;

-- DropTable
DROP TABLE `tattoos`;

-- DropTable
DROP TABLE `tattoostyles`;

-- CreateTable
CREATE TABLE `campingSpots` (
    `spotId` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `cityId` INTEGER NULL,
    `description` TEXT NULL,
    `streetAddress` VARCHAR(255) NULL,
    `instagramLink` VARCHAR(255) NULL,
    `portfolioLink` VARCHAR(255) NULL,
    `imageURL` VARCHAR(255) NULL,
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`spotId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `spotstyles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `spotId` INTEGER NOT NULL,
    `styleId` INTEGER NOT NULL,

    INDEX `spotId`(`spotId`),
    INDEX `styleId`(`styleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `reviews_spotId_idx` ON `reviews`(`spotId`);

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_spotId_fkey` FOREIGN KEY (`spotId`) REFERENCES `campingSpots`(`spotId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `campingSpots` ADD CONSTRAINT `campingspots_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `campingSpots` ADD CONSTRAINT `campingspots_ibfk_2` FOREIGN KEY (`cityId`) REFERENCES `cities`(`cityId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `spotstyles` ADD CONSTRAINT `spotstyles_ibfk_1` FOREIGN KEY (`spotId`) REFERENCES `campingSpots`(`spotId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `spotstyles` ADD CONSTRAINT `spotstyles_ibfk_2` FOREIGN KEY (`styleId`) REFERENCES `styles`(`styleId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- RenameIndex
ALTER TABLE `users` RENAME INDEX `email` TO `users_email_key`;
