-- First, update all NULL name values to a default value
UPDATE "expenses" SET "name" = 'Unnamed Expense' WHERE "name" IS NULL;

-- Then add the NOT NULL constraint
ALTER TABLE "expenses" ALTER COLUMN "name" SET NOT NULL;
