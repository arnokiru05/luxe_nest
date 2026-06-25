-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'GUEST';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "customerPhone" TEXT,
ADD COLUMN     "shippingAddress" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "address" TEXT,
ADD COLUMN     "phone" TEXT,
ALTER COLUMN "password" DROP NOT NULL;
