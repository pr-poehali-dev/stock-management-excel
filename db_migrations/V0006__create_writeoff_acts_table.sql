-- Создание таблицы для хранения актов списания
CREATE TABLE IF NOT EXISTS writeoff_acts (
    id SERIAL PRIMARY KEY,
    act_number VARCHAR(255) NOT NULL,
    act_date DATE NOT NULL,
    responsible_person VARCHAR(255) NOT NULL,
    reason TEXT NOT NULL,
    items JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL
);

-- Индекс для быстрого поиска по дате
CREATE INDEX idx_writeoff_acts_date ON writeoff_acts(act_date DESC);

-- Индекс для поиска по номеру акта
CREATE INDEX idx_writeoff_acts_number ON writeoff_acts(act_number);
