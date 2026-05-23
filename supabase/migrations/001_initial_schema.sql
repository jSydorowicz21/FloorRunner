-- Floor Runner — Initial Schema
-- CNC Machine Shop Job Tracking SaaS
-- Version: 1.0

BEGIN;

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE job_status AS ENUM ('quoting', 'scheduled', 'in_progress', 'complete', 'cancelled');
CREATE TYPE job_priority AS ENUM ('normal', 'rush');
CREATE TYPE machine_status AS ENUM ('running', 'idle', 'down', 'maintenance');
CREATE TYPE operation_status AS ENUM ('pending', 'in_progress', 'complete');
CREATE TYPE time_entry_type AS ENUM ('timer', 'manual', 'system');
CREATE TYPE note_type AS ENUM ('general', 'issue', 'update', 'internal', 'customer');
CREATE TYPE photo_type AS ENUM ('setup', 'part', 'qc', 'other');
CREATE TYPE user_role AS ENUM ('owner', 'operator');
CREATE TYPE plan_type AS ENUM ('free', 'starter', 'pro', 'shop');

-- ============================================================
-- SHOPS (tenant / account)
-- ============================================================

CREATE TABLE shops (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL,
  slug                TEXT UNIQUE NOT NULL,
  owner_id            UUID NOT NULL,
  plan                plan_type NOT NULL DEFAULT 'free',
  stripe_customer_id  TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_shops_owner_id ON shops(owner_id);
CREATE INDEX idx_shops_slug ON shops(slug);

-- ============================================================
-- USERS (operators + owner)
-- ============================================================

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id       UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT,
  role          user_role NOT NULL DEFAULT 'operator',
  avatar_url    TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  last_active_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_users_shop_email ON users(shop_id, email);
CREATE INDEX idx_users_shop_id ON users(shop_id);

-- ============================================================
-- MACHINES
-- ============================================================

CREATE TABLE machines (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id       UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  machine_type  TEXT NOT NULL,
  status        machine_status NOT NULL DEFAULT 'idle',
  status_note   TEXT,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_machines_shop_id ON machines(shop_id);

-- ============================================================
-- CUSTOMERS
-- ============================================================

CREATE TABLE customers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id       UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  contact_name  TEXT,
  email         TEXT,
  phone         TEXT,
  address       TEXT,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_customers_shop_id ON customers(shop_id);

-- ============================================================
-- JOBS
-- ============================================================

CREATE TABLE jobs (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id               UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  customer_id           UUID NOT NULL REFERENCES customers(id),
  job_number            TEXT NOT NULL,
  part_number           TEXT,
  part_description      TEXT NOT NULL,
  quantity              INTEGER NOT NULL DEFAULT 1,
  due_date              DATE NOT NULL,
  quoted_price          NUMERIC(12,2),
  status                job_status NOT NULL DEFAULT 'quoting',
  priority              job_priority NOT NULL DEFAULT 'normal',
  current_operation_id  UUID,
  notes                 TEXT,
  sort_order            INTEGER NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at          TIMESTAMPTZ
);

CREATE INDEX idx_jobs_shop_id ON jobs(shop_id);
CREATE INDEX idx_jobs_customer_id ON jobs(customer_id);
CREATE INDEX idx_jobs_due_date ON jobs(due_date);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE UNIQUE INDEX idx_jobs_shop_job_number ON jobs(shop_id, job_number);

-- ============================================================
-- JOB OPERATIONS
-- ============================================================

CREATE TABLE job_operations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id          UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  operation_number INTEGER NOT NULL,
  description     TEXT NOT NULL,
  machine_id      UUID REFERENCES machines(id),
  operator_id     UUID REFERENCES users(id),
  status          operation_status NOT NULL DEFAULT 'pending',
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  est_minutes     INTEGER,
  notes           TEXT,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_job_ops_job_id ON job_operations(job_id);
CREATE INDEX idx_job_ops_machine_id ON job_operations(machine_id);
CREATE INDEX idx_job_ops_operator_id ON job_operations(operator_id);
CREATE UNIQUE INDEX idx_job_ops_job_op_number ON job_operations(job_id, operation_number);

-- Add FK from jobs.current_operation_id after job_operations exists
ALTER TABLE jobs
  ADD CONSTRAINT fk_jobs_current_operation
  FOREIGN KEY (current_operation_id) REFERENCES job_operations(id) ON DELETE SET NULL;

-- ============================================================
-- OPERATION TIME ENTRIES
-- ============================================================

CREATE TABLE operation_time_entries (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_id      UUID NOT NULL REFERENCES job_operations(id) ON DELETE CASCADE,
  operator_id       UUID NOT NULL REFERENCES users(id),
  started_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at          TIMESTAMPTZ,
  duration_minutes  INTEGER,
  entry_type        time_entry_type NOT NULL DEFAULT 'manual',
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ote_operation_id ON operation_time_entries(operation_id);
CREATE INDEX idx_ote_operator_id ON operation_time_entries(operator_id);

-- ============================================================
-- JOB NOTES
-- ============================================================

CREATE TABLE job_notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id      UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id),
  content     TEXT NOT NULL,
  note_type   note_type NOT NULL DEFAULT 'general',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_jn_job_id ON job_notes(job_id);

-- ============================================================
-- JOB PHOTOS
-- ============================================================

CREATE TABLE job_photos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id        UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  operation_id  UUID REFERENCES job_operations(id),
  user_id       UUID NOT NULL REFERENCES users(id),
  url           TEXT NOT NULL,
  filename      TEXT,
  caption       TEXT,
  photo_type    photo_type NOT NULL DEFAULT 'other',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_jp_job_id ON job_photos(job_id);

-- ============================================================
-- SHOP SETTINGS (key-value store)
-- ============================================================

CREATE TABLE shop_settings (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id   UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  key       TEXT NOT NULL,
  value     TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (shop_id, key)
);

-- ============================================================
-- PORTAL CODES (customer magic-link tokens)
-- ============================================================

CREATE TABLE portal_codes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id     UUID NOT NULL REFERENCES shops(id),
  customer_id UUID NOT NULL REFERENCES customers(id),
  code_hash   TEXT NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pc_code_hash ON portal_codes(code_hash);
CREATE INDEX idx_pc_customer_id ON portal_codes(customer_id);

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Auto-generate job number: JOB-YYYY-NNNN
CREATE OR REPLACE FUNCTION generate_job_number(shop_id UUID)
RETURNS TEXT AS $$
DECLARE
  year_prefix TEXT;
  next_seq    INTEGER;
  new_number  TEXT;
BEGIN
  year_prefix := 'JOB-' || EXTRACT(YEAR FROM now())::TEXT || '-';

  SELECT COALESCE(MAX(
    NULLIF(regexp_replace(job_number, year_prefix, ''), '')::INTEGER
  ), 0) + 1
  INTO next_seq
  FROM jobs
  WHERE shop_id = generate_job_number.shop_id
    AND job_number LIKE year_prefix || '%';

  new_number := year_prefix || LPAD(next_seq::TEXT, 4, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Keep updated_at current
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Prevent deleting the last owner from a shop
CREATE OR REPLACE FUNCTION prevent_owner_deletion()
RETURNS TRIGGER AS $$
DECLARE
  remaining_owners INTEGER;
BEGIN
  IF OLD.role = 'owner' AND NEW.is_active = false THEN
    SELECT COUNT(*) INTO remaining_owners
    FROM users
    WHERE shop_id = OLD.shop_id
      AND role = 'owner'
      AND is_active = true
      AND id != OLD.id;

    IF remaining_owners = 0 THEN
      RAISE EXCEPTION 'Cannot deactivate the last owner of a shop';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TRIGGERS for updated_at
-- ============================================================

CREATE TRIGGER tr_shops_updated_at
  BEFORE UPDATE ON shops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_machines_updated_at
  BEFORE UPDATE ON machines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_job_operations_updated_at
  BEFORE UPDATE ON job_operations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_users_last_active
  BEFORE UPDATE OF last_active_at ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_prevent_owner_deletion
  BEFORE UPDATE OF is_active ON users
  FOR EACH ROW EXECUTE FUNCTION prevent_owner_deletion();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE operation_time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_codes ENABLE ROW LEVEL SECURITY;

-- SHOPS policies
CREATE POLICY "shops_owner_all" ON shops
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "shops_shop_member_read" ON shops
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.shop_id = shops.id)
  );

-- USERS policies
CREATE POLICY "users_shop_member_read" ON users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users u2 WHERE u2.id = auth.uid() AND u2.shop_id = users.shop_id)
  );

CREATE POLICY "users_owner_write" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
        AND u.shop_id = users.shop_id
        AND u.role = 'owner'
    )
  );

CREATE POLICY "users_self_update" ON users
  FOR UPDATE USING (auth.uid() = users.id);

-- MACHINES policies
CREATE POLICY "machines_shop_read" ON machines
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.shop_id = machines.shop_id)
  );

CREATE POLICY "machines_shop_write" ON machines
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.shop_id = machines.shop_id AND users.role = 'owner')
  );

-- CUSTOMERS policies
CREATE POLICY "customers_shop_read" ON customers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.shop_id = customers.shop_id)
  );

CREATE POLICY "customers_shop_write" ON customers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.shop_id = customers.shop_id AND users.role = 'owner')
  );

-- JOBS policies
CREATE POLICY "jobs_shop_read" ON jobs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.shop_id = jobs.shop_id)
  );

CREATE POLICY "jobs_shop_write" ON jobs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.shop_id = jobs.shop_id)
  );

-- JOB_OPERATIONS policies
CREATE POLICY "job_ops_shop_read" ON job_operations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM jobs WHERE jobs.id = job_operations.job_id AND jobs.shop_id IN (SELECT shop_id FROM users WHERE users.id = auth.uid()))
  );

CREATE POLICY "job_ops_shop_write" ON job_operations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM jobs WHERE jobs.id = job_operations.job_id AND jobs.shop_id IN (SELECT shop_id FROM users WHERE users.id = auth.uid()))
  );

-- OPERATION_TIME_ENTRIES policies
CREATE POLICY "ote_shop_read" ON operation_time_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM job_operations jo
      JOIN jobs j ON j.id = jo.job_id
      JOIN users u ON u.id = auth.uid()
      WHERE jo.id = operation_time_entries.operation_id AND j.shop_id = u.shop_id
    )
  );

CREATE POLICY "ote_shop_write" ON operation_time_entries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM job_operations jo
      JOIN jobs j ON j.id = jo.job_id
      JOIN users u ON u.id = auth.uid()
      WHERE jo.id = operation_time_entries.operation_id AND j.shop_id = u.shop_id
    )
  );

-- JOB_NOTES policies
CREATE POLICY "notes_shop_read" ON job_notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM jobs j
      JOIN users u ON u.id = auth.uid()
      WHERE j.id = job_notes.job_id AND j.shop_id = u.shop_id
    )
  );

CREATE POLICY "notes_shop_write" ON job_notes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM jobs j
      JOIN users u ON u.id = auth.uid()
      WHERE j.id = job_notes.job_id AND j.shop_id = u.shop_id
    )
  );

-- JOB_PHOTOS policies
CREATE POLICY "photos_shop_read" ON job_photos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM jobs j
      JOIN users u ON u.id = auth.uid()
      WHERE j.id = job_photos.job_id AND j.shop_id = u.shop_id
    )
  );

CREATE POLICY "photos_shop_write" ON job_photos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM jobs j
      JOIN users u ON u.id = auth.uid()
      WHERE j.id = job_photos.job_id AND j.shop_id = u.shop_id
    )
  );

-- SHOP_SETTINGS policies
CREATE POLICY "settings_shop_read" ON shop_settings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.shop_id = shop_settings.shop_id)
  );

CREATE POLICY "settings_shop_write" ON shop_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.shop_id = shop_settings.shop_id AND users.role = 'owner')
  );

-- PORTAL_CODES policies
-- Public read (no auth required for portal validation)
CREATE POLICY "portal_public_read" ON portal_codes
  FOR SELECT USING (true);

CREATE POLICY "portal_owner_write" ON portal_codes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.shop_id = portal_codes.shop_id AND users.role = 'owner')
  );

-- ============================================================
-- REALTIME
-- ============================================================

-- Enable realtime for the three most active tables
ALTER PUBLICATION supabase_realtime ADD TABLE jobs;
ALTER PUBLICATION supabase_realtime ADD TABLE job_operations;
ALTER PUBLICATION supabase_realtime ADD TABLE machines;

-- ============================================================
-- STORAGE (Supabase Storage bucket for job photos)
-- ============================================================

-- Note: Bucket creation requires Supabase Storage API, not SQL.
-- Run this in the Supabase dashboard or via API after project creation:
-- POST /storage/v1/buckets
-- { "id": "job-photos", "name": "job-photos", "public": false }
--
-- With RLS policy:
-- CREATE POLICY "job_photos_upload" ON storage.objects
--   FOR INSERT WITH CHECK (
--     bucket_id = 'job-photos' AND
--     EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid())
--   );

COMMIT;
