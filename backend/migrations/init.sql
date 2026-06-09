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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_materials_type ON materials(material_type);
CREATE INDEX idx_materials_pitch ON materials(theoretical_pitch);

-- 作品表
CREATE TABLE IF NOT EXISTS wind_chimes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    materials TEXT NOT NULL,
    hang_order TEXT NOT NULL,
    chord_info TEXT NOT NULL,
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

-- 初始化示例数据
INSERT INTO materials (id, material_type, name, length, diameter, wall_thickness, theoretical_pitch, theoretical_note) VALUES
('mat_001', 'copper', '长铜铃', 180, 25, 1.5, 523.25, 'C5'),
('mat_002', 'aluminum', '中音铝管', 150, 20, 1.0, 659.25, 'E5'),
('mat_003', 'bamboo', '竹制短管', 120, 22, 2.0, 783.99, 'G5'),
('mat_004', 'glass', '玻璃高音', 100, 18, 3.0, 1046.50, 'C6'),
('mat_005', 'copper', '低音铜铃', 220, 30, 2.0, 392.00, 'G4');
