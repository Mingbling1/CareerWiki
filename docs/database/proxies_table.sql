-- ============================================
-- PROXY MANAGEMENT TABLE
-- Database: empliq_dev (same as companies_raw)
-- ============================================

CREATE TABLE IF NOT EXISTS proxies (
    id SERIAL PRIMARY KEY,
    ip VARCHAR(45) NOT NULL,           -- IPv4 or IPv6
    port INTEGER NOT NULL,
    protocol VARCHAR(10) NOT NULL DEFAULT 'socks5', -- socks5, socks4, http, https
    url TEXT GENERATED ALWAYS AS (protocol || '://' || ip || ':' || port) STORED,

    -- Status tracking
    status VARCHAR(20) NOT NULL DEFAULT 'testing', -- active, dead, testing, cooldown
    fail_count INTEGER NOT NULL DEFAULT 0,
    success_count INTEGER NOT NULL DEFAULT 0,
    consecutive_fails INTEGER NOT NULL DEFAULT 0,

    -- Performance
    avg_response_ms INTEGER,           -- average response time in ms
    last_response_ms INTEGER,          -- last test response time
    last_checked_at TIMESTAMPTZ,
    last_success_at TIMESTAMPTZ,

    -- Metadata
    country VARCHAR(5),                -- ISO country code (US, PE, BR, etc.)
    source VARCHAR(100),               -- 'theSpeedX', 'proxyscrape', 'manual', etc.

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Unique constraint: no duplicate ip:port:protocol
    UNIQUE(ip, port, protocol)
);

-- Indexes for common queries
CREATE INDEX idx_proxies_status ON proxies(status);
CREATE INDEX idx_proxies_active ON proxies(status, avg_response_ms) WHERE status = 'active';
CREATE INDEX idx_proxies_source ON proxies(source);
CREATE INDEX idx_proxies_last_checked ON proxies(last_checked_at);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_proxies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_proxies_updated_at
    BEFORE UPDATE ON proxies
    FOR EACH ROW
    EXECUTE FUNCTION update_proxies_updated_at();

-- ============================================
-- USEFUL QUERIES
-- ============================================

-- Get best active proxies (sorted by speed)
-- SELECT url FROM proxies WHERE status = 'active' ORDER BY avg_response_ms ASC LIMIT 20;

-- Get stats summary
-- SELECT status, COUNT(*), AVG(avg_response_ms)::int as avg_ms FROM proxies GROUP BY status;

-- Mark dead proxies that failed 5+ times in a row
-- UPDATE proxies SET status = 'dead' WHERE consecutive_fails >= 5 AND status != 'dead';

-- Cleanup old dead proxies (>7 days)
-- DELETE FROM proxies WHERE status = 'dead' AND updated_at < NOW() - INTERVAL '7 days';
