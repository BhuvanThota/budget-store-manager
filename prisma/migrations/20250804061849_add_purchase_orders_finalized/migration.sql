/*
  Warnings:

  - You are about to drop the column `initialStock` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `totalCost` on the `Product` table. All the data in the column will be lost.
  - The `status` column on the `PurchaseOrder` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `totalCost` on the `PurchaseOrderItem` table. All the data in the column will be lost.
  - Made the column `productId` on table `PurchaseOrderItem` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."PurchaseOrderStatus" AS ENUM ('PENDING', 'RECEIVED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "public"."PurchaseOrderItem" DROP CONSTRAINT "PurchaseOrderItem_productId_fkey";

-- AlterTable
ALTER TABLE "public"."Product" DROP COLUMN "initialStock",
DROP COLUMN "totalCost";

-- AlterTable
ALTER TABLE "public"."PurchaseOrder" DROP COLUMN "status",
ADD COLUMN     "status" "public"."PurchaseOrderStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "public"."PurchaseOrderItem" DROP COLUMN "totalCost",
ALTER COLUMN "productId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."PurchaseOrderItem" ADD CONSTRAINT "PurchaseOrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
