-- CreateTable
CREATE TABLE "Reflection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "citation" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "tags" TEXT NOT NULL,
    "theoryLens" TEXT,
    "summary" TEXT NOT NULL,
    "reflection" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passHash" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Reflection_sourceUrl_key" ON "Reflection"("sourceUrl");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
