DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'EmployeeDocument'
      AND column_name = 'source'
  ) THEN
    ALTER TABLE "EmployeeDocument" ALTER COLUMN "source" DROP DEFAULT;
  END IF;
END $$;
