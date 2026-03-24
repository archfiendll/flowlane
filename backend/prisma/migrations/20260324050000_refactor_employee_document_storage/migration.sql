ALTER TABLE "EmployeeDocument"
ADD COLUMN "storageProvider" TEXT NOT NULL DEFAULT 'local';

ALTER TABLE "EmployeeDocument"
ADD COLUMN "storageKey" TEXT;

UPDATE "EmployeeDocument"
SET "storageKey" = regexp_replace("storagePath", '^.*?/storage/', '');

ALTER TABLE "EmployeeDocument"
ALTER COLUMN "storageKey" SET NOT NULL;

ALTER TABLE "EmployeeDocument"
DROP COLUMN "storagePath";
