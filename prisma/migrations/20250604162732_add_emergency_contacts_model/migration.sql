-- CreateTable
CREATE TABLE "emergency_contacts" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "contactId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emergency_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "emergency_contacts_userId_contactId_key" ON "emergency_contacts"("userId", "contactId");

-- AddForeignKey
ALTER TABLE "emergency_contacts" ADD CONSTRAINT "emergency_contacts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_contacts" ADD CONSTRAINT "emergency_contacts_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
