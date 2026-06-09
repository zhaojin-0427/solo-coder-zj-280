-- 材料表
CREATE TABLE IF NOT EXISTS materials (
    id TEXT PRIMARY KEY,
    material_type TEXT NOT NULL CHECK (material_type IN ('aluminum', 'copper', 'bamboo', 'glass')),
    name TEXT NOT NULL,
    length REAL NOT NULL,
    diameter REAL NOT NULL,
    wall_thickness REAL NOT NULL,
    theoretical_pitch REAL NOT NULL,
    theoretical_note TEXT NOT NULL,
    purchase_price REAL DEFAULT 0,
    stock_quantity INTEGER DEFAULT 0,
    loss_rate REAL DEFAULT 0,
    supplier TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_materials_type ON materials(material_type);
CREATE INDEX idx_materials_pitch ON materials(theoretical_pitch);
CREATE INDEX idx_materials_supplier ON materials(supplier);

-- 作品表
CREATE TABLE IF NOT EXISTS wind_chimes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    materials TEXT NOT NULL,
    hang_order TEXT NOT NULL,
    chord_info TEXT NOT NULL,
    cost_snapshot TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chimes_created ON wind_chimes(created_at);

-- 调音修正表
CREATE TABLE IF NOT EXISTS tuning_corrections (
    id TEXT PRIMARY KEY,
    chime_id TEXT REFERENCES wind_chimes(id) ON DELETE CASCADE,
    material_id TEXT REFERENCES materials(id) ON DELETE CASCADE,
    theoretical_freq REAL NOT NULL,
    actual_freq REAL NOT NULL,
    correction_cents REAL NOT NULL,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_corrections_material ON tuning_corrections(material_id);
CREATE INDEX idx_corrections_chime ON tuning_corrections(chime_id);

-- 工单表
CREATE TABLE IF NOT EXISTS work_orders (
    id TEXT PRIMARY KEY,
    chime_id TEXT NOT NULL REFERENCES wind_chimes(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    delivery_date DATE NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT NOT NULL DEFAULT 'pending_material' CHECK (status IN ('pending_material', 'in_production', 'pending_tuning', 'completed', 'delivered', 'cancelled')),
    remarks TEXT,
    materials_snapshot TEXT NOT NULL,
    cost_snapshot TEXT NOT NULL,
    tuning_records_snapshot TEXT,
    stages_completed TEXT NOT NULL,
    inventory_deducted INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_work_orders_chime ON work_orders(chime_id);
CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_work_orders_priority ON work_orders(priority);
CREATE INDEX idx_work_orders_delivery ON work_orders(delivery_date);

-- 初始化示例数据
INSERT INTO materials (id, material_type, name, length, diameter, wall_thickness, theoretical_pitch, theoretical_note, purchase_price, stock_quantity, loss_rate, supplier) VALUES
('mat_001', 'copper', '长铜铃', 180, 25, 1.5, 523.25, 'C5', 85.5, 50, 3.5, '上海铜管厂'),
('mat_002', 'aluminum', '中音铝管', 150, 20, 1.0, 659.25, 'E5', 45.0, 80, 2.0, '广州铝材有限公司'),
('mat_003', 'bamboo', '竹制短管', 120, 22, 2.0, 783.99, 'G5', 28.0, 120, 5.0, '安吉竹制品厂'),
('mat_004', 'glass', '玻璃高音', 100, 18, 3.0, 1046.50, 'C6', 120.0, 30, 8.0, '淄博玻璃工艺厂'),
('mat_005', 'copper', '低音铜铃', 220, 30, 2.0, 392.00, 'G4', 150.0, 25, 4.0, '上海铜管厂');
