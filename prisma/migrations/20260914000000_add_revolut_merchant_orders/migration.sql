ALTER TABLE "Invoice" ADD COLUMN "revolutOrderId" TEXT;
ALTER TABLE "Invoice" ADD COLUMN "revolutOrderState" TEXT;
ALTER TABLE "Invoice" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'AUD';

CREATE UNIQUE INDEX "Invoice_revolutOrderId_key" ON "Invoice"("revolutOrderId");
