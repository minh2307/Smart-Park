-- ============================================================
-- V15: Membership Tier (alter), Membership (alter),
--      PointHistory (alter), LoyaltyAccount (new)
-- Smart Park – Membership & Loyalty Management Module
-- ============================================================

-- ──────────────────────────────────────────────────────────
-- 1. ALTER membership_tiers → thêm fields đầy đủ theo SRS
-- ──────────────────────────────────────────────────────────
ALTER TABLE membership_tiers ADD COLUMN description       TEXT                         NULL;
ALTER TABLE membership_tiers ADD COLUMN priority_queue    BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE membership_tiers ADD COLUMN free_parking      BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE membership_tiers ADD COLUMN birthday_benefit  TEXT                         NULL;
ALTER TABLE membership_tiers ADD COLUMN lounge_access     BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE membership_tiers ADD COLUMN status            ENUM('ACTIVE','INACTIVE')    NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE membership_tiers ADD COLUMN sort_order        INT        NOT NULL DEFAULT 0;
ALTER TABLE membership_tiers ADD COLUMN created_at        DATETIME(6)                  NULL;
ALTER TABLE membership_tiers ADD COLUMN updated_at        DATETIME(6)                  NULL;
ALTER TABLE membership_tiers ADD COLUMN deleted_at        DATETIME(6)                  NULL;

ALTER TABLE membership_tiers ADD INDEX idx_tier_status (status);
ALTER TABLE membership_tiers ADD INDEX idx_tier_sort (sort_order);

-- ──────────────────────────────────────────────────────────
-- 2. ALTER memberships → thêm fields đầy đủ theo SRS
-- ──────────────────────────────────────────────────────────
ALTER TABLE memberships ADD COLUMN start_date        DATE                         NULL;
ALTER TABLE memberships ADD COLUMN auto_renewal      BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE memberships ADD COLUMN current_spending  DECIMAL(15,2) NOT NULL DEFAULT 0;
ALTER TABLE memberships ADD COLUMN lifetime_spending DECIMAL(15,2) NOT NULL DEFAULT 0;
ALTER TABLE memberships ADD COLUMN renewal_count     INT        NOT NULL DEFAULT 0;
ALTER TABLE memberships ADD COLUMN cancelled_at      DATETIME(6)                  NULL;
ALTER TABLE memberships ADD COLUMN updated_at        DATETIME(6)                  NULL;

ALTER TABLE memberships ADD INDEX idx_membership_status (status);
ALTER TABLE memberships ADD INDEX idx_membership_expiry (expiration_date);
ALTER TABLE memberships ADD INDEX idx_membership_customer (customer_id);

-- ──────────────────────────────────────────────────────────
-- 3. ALTER point_histories → thêm transaction_type, balance
-- ──────────────────────────────────────────────────────────
ALTER TABLE point_histories ADD COLUMN transaction_type  ENUM('EARN','REDEEM','ADJUST','EXPIRE','REVERSE') NOT NULL DEFAULT 'EARN';
ALTER TABLE point_histories ADD COLUMN balance_before    BIGINT  NULL;
ALTER TABLE point_histories ADD COLUMN balance_after     BIGINT  NULL;
ALTER TABLE point_histories ADD COLUMN reference_type    VARCHAR(50)  NULL;
ALTER TABLE point_histories ADD COLUMN performed_by      VARCHAR(100) NULL;

ALTER TABLE point_histories ADD INDEX idx_ph_membership (membership_id);
ALTER TABLE point_histories ADD INDEX idx_ph_type (transaction_type);
ALTER TABLE point_histories ADD INDEX idx_ph_created (created_at);

-- ──────────────────────────────────────────────────────────
-- 4. CREATE loyalty_accounts
-- ──────────────────────────────────────────────────────────
CREATE TABLE loyalty_accounts
(
    id               BIGINT        NOT NULL AUTO_INCREMENT,
    customer_id      BIGINT        NOT NULL,
    membership_id    BIGINT        NULL,
    current_points   BIGINT        NOT NULL DEFAULT 0,
    total_earned     BIGINT        NOT NULL DEFAULT 0,
    total_redeemed   BIGINT        NOT NULL DEFAULT 0,
    total_expired    BIGINT        NOT NULL DEFAULT 0,
    total_adjusted   BIGINT        NOT NULL DEFAULT 0,
    created_at       DATETIME(6)   NULL,
    updated_at       DATETIME(6)   NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_loyalty_customer (customer_id),
    INDEX idx_loyalty_membership (membership_id),
    CONSTRAINT fk_loyalty_customer FOREIGN KEY (customer_id) REFERENCES customers (id),
    CONSTRAINT fk_loyalty_membership FOREIGN KEY (membership_id) REFERENCES memberships (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
