CREATE TYPE "DocumentSource" AS ENUM ('GENERATED', 'UPLOADED');

ALTER TABLE "EmployeeDocument"
ADD COLUMN "source" "DocumentSource" NOT NULL DEFAULT 'GENERATED',
ADD COLUMN "category" TEXT,
ADD COLUMN "notes" TEXT;

UPDATE "EmployeeDocument"
SET "source" = CASE
  WHEN "templateKey" = 'uploaded' THEN 'UPLOADED'::"DocumentSource"
  ELSE 'GENERATED'::"DocumentSource"
END;
