-- Contract.audience has no natural default (it's the discriminator between two
-- independent documents), but as a defensive default it falls back to SPECIALIST
-- rather than leaving inserts that omit it to fail.
ALTER TABLE "Contract" ALTER COLUMN "audience" SET DEFAULT 'SPECIALIST';
