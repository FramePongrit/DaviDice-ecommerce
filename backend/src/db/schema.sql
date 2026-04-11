-- ============================================================
-- DaviDice E-Commerce — PostgreSQL Schema (3NF)
-- CPE241 Project
-- ============================================================

-- ============================================================
-- ROLES
-- ============================================================
CREATE TABLE roles (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50)  NOT NULL UNIQUE,  -- 'customer', 'admin'
    description TEXT
);

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    role_id       INT          NOT NULL REFERENCES roles(id),
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone         VARCHAR(20),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- ============================================================
-- ADDRESSES
-- ============================================================
CREATE TABLE addresses (
    id              SERIAL PRIMARY KEY,
    user_id         INT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_name  VARCHAR(100) NOT NULL,
    phone           VARCHAR(20),
    street          TEXT         NOT NULL,
    sub_district    VARCHAR(100) NOT NULL,
    district        VARCHAR(100) NOT NULL,
    province        VARCHAR(100) NOT NULL,
    postal_code     VARCHAR(10)  NOT NULL,
    is_default      BOOLEAN      NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_addresses_user_id ON addresses(user_id);

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE categories (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE products (
    id          SERIAL PRIMARY KEY,
    category_id INT             NOT NULL REFERENCES categories(id),
    name        VARCHAR(200)    NOT NULL,
    description TEXT,
    price       NUMERIC(10, 2)  NOT NULL CHECK (price >= 0),
    stock_qty   INT             NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_name ON products(name);

-- ============================================================
-- PRODUCT_IMAGES
-- ============================================================
CREATE TABLE product_images (
    id          SERIAL PRIMARY KEY,
    product_id  INT          NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url   TEXT         NOT NULL,
    is_primary  BOOLEAN      NOT NULL DEFAULT FALSE,
    sort_order  INT          NOT NULL DEFAULT 0
);

CREATE INDEX idx_product_images_product_id ON product_images(product_id);

-- ============================================================
-- CARTS  (1 active cart per user)
-- ============================================================
CREATE TABLE carts (
    id          SERIAL PRIMARY KEY,
    user_id     INT         NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CART_ITEMS
-- ============================================================
CREATE TABLE cart_items (
    id          SERIAL PRIMARY KEY,
    cart_id     INT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id  INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity    INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    UNIQUE (cart_id, product_id)
);

CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE orders (
    id                  SERIAL PRIMARY KEY,
    user_id             INT         NOT NULL REFERENCES users(id),
    shipping_address_id INT         NOT NULL REFERENCES addresses(id),
    status              VARCHAR(20) NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status  ON orders(status);

-- ============================================================
-- ORDER_ITEMS  (snapshot price at time of order)
-- ============================================================
CREATE TABLE order_items (
    id          SERIAL PRIMARY KEY,
    order_id    INT            NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id  INT            NOT NULL REFERENCES products(id),
    quantity    INT            NOT NULL CHECK (quantity > 0),
    unit_price  NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0)
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- ============================================================
-- PAYMENTS  (1 payment per order)
-- ============================================================
CREATE TABLE payments (
    id          SERIAL PRIMARY KEY,
    order_id    INT            NOT NULL UNIQUE REFERENCES orders(id),
    amount      NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    method      VARCHAR(50)    NOT NULL DEFAULT 'mock',  -- 'mock', 'stripe'
    status      VARCHAR(20)    NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
    paid_at     TIMESTAMPTZ
);

-- ============================================================
-- SEED — Default roles
-- ============================================================
INSERT INTO roles (name, description) VALUES
    ('admin',    'Store administrator'),
    ('customer', 'Regular customer');
