-- ============================================================
-- DaviDice Analytics Mock Data
-- Creates repeat customers, 12 months of orders/payments/items,
-- and inventory states for analytics screens.
--
-- Safe to run multiple times: existing analytics mock users/orders
-- are removed before new mock records are inserted.
-- ============================================================

BEGIN;

-- Cleanup previous analytics mock data.
WITH mock_users AS (
  SELECT id
  FROM users
  WHERE email LIKE 'analytics.customer%@davidice.test'
),
mock_orders AS (
  SELECT id
  FROM orders
  WHERE user_id IN (SELECT id FROM mock_users)
)
DELETE FROM payments
WHERE order_id IN (SELECT id FROM mock_orders);

WITH mock_users AS (
  SELECT id
  FROM users
  WHERE email LIKE 'analytics.customer%@davidice.test'
),
mock_orders AS (
  SELECT id
  FROM orders
  WHERE user_id IN (SELECT id FROM mock_users)
)
DELETE FROM order_items
WHERE order_id IN (SELECT id FROM mock_orders);

WITH mock_users AS (
  SELECT id
  FROM users
  WHERE email LIKE 'analytics.customer%@davidice.test'
)
DELETE FROM orders
WHERE user_id IN (SELECT id FROM mock_users);

WITH mock_users AS (
  SELECT id
  FROM users
  WHERE email LIKE 'analytics.customer%@davidice.test'
)
DELETE FROM cart_items
WHERE cart_id IN (SELECT id FROM carts WHERE user_id IN (SELECT id FROM mock_users));

WITH mock_users AS (
  SELECT id
  FROM users
  WHERE email LIKE 'analytics.customer%@davidice.test'
)
DELETE FROM carts
WHERE user_id IN (SELECT id FROM mock_users);

WITH mock_users AS (
  SELECT id
  FROM users
  WHERE email LIKE 'analytics.customer%@davidice.test'
)
DELETE FROM addresses
WHERE user_id IN (SELECT id FROM mock_users);

DELETE FROM users
WHERE email LIKE 'analytics.customer%@davidice.test';

-- Mock customers.
INSERT INTO users (role_id, name, email, password_hash, phone, created_at)
SELECT
  (SELECT id FROM roles WHERE name = 'customer'),
  'Analytics Customer ' || LPAD(n::text, 2, '0'),
  'analytics.customer' || LPAD(n::text, 2, '0') || '@davidice.test',
  '$2b$12$tSGHTYiTAKCUUapI3ZAFQuv9LA7eJOqVVLPBJFbZJggGowAslzLnK',
  '08000000' || LPAD(n::text, 2, '0'),
  NOW() - (n || ' days')::interval
FROM generate_series(1, 12) AS n;

INSERT INTO addresses (user_id, recipient_name, phone, street, sub_district, district, province, postal_code, is_default)
SELECT
  id,
  name,
  phone,
  'Mock Analytics Street ' || id,
  'Bang Rak',
  'Bang Rak',
  'Bangkok',
  '10500',
  TRUE
FROM users
WHERE email LIKE 'analytics.customer%@davidice.test';

-- Make inventory analytics visible.
UPDATE products SET stock_qty = 0 WHERE id IN (48, 50);
UPDATE products SET stock_qty = 4 WHERE id IN (46);
UPDATE products SET stock_qty = 6 WHERE id IN (39);
UPDATE products SET stock_qty = 8 WHERE id IN (15);
UPDATE products SET stock_qty = 10 WHERE id IN (9);

DO $$
DECLARE
  product_ids INT[] := ARRAY[1,2,3,5,6,10,14,15,16,17,18,20,23,26,27,28,29,31,34,35,41,44,45,46,49];
  customer_ids INT[];
  order_id INT;
  v_user_id INT;
  address_id INT;
  product_id INT;
  unit_price NUMERIC(10,2);
  order_total NUMERIC(10,2);
  order_status TEXT;
  payment_status TEXT;
  created_at_value TIMESTAMPTZ;
  qty INT;
  i INT;
  j INT;
  line_count INT;
BEGIN
  SELECT ARRAY_AGG(id ORDER BY id)
  INTO customer_ids
  FROM users
  WHERE email LIKE 'analytics.customer%@davidice.test';

  IF customer_ids IS NULL OR ARRAY_LENGTH(customer_ids, 1) = 0 THEN
    RAISE EXCEPTION 'No analytics mock customers were created.';
  END IF;

  FOR i IN 1..180 LOOP
    v_user_id := customer_ids[((i - 1) % ARRAY_LENGTH(customer_ids, 1)) + 1];

    SELECT id
    INTO address_id
    FROM addresses
    WHERE addresses.user_id = v_user_id
    ORDER BY id
    LIMIT 1;

    created_at_value := (
      CURRENT_DATE
      - (((i * 2) % 360) || ' days')::interval
      + (((i * 7) % 20) || ' hours')::interval
      + (((i * 13) % 60) || ' minutes')::interval
    );

    order_status := CASE
      WHEN i % 17 = 0 THEN 'pending'
      WHEN i % 13 = 0 THEN 'processing'
      WHEN i % 11 = 0 THEN 'shipped'
      WHEN i % 19 = 0 THEN 'cancelled'
      ELSE 'delivered'
    END;

    INSERT INTO orders (user_id, shipping_address_id, status, created_at)
    VALUES (v_user_id, address_id, order_status, created_at_value)
    RETURNING id INTO order_id;

    order_total := 0;
    line_count := 1 + (i % 3);

    FOR j IN 1..line_count LOOP
      product_id := product_ids[((i + j - 2) % ARRAY_LENGTH(product_ids, 1)) + 1];
      qty := 1 + ((i + j) % 3);

      SELECT price
      INTO unit_price
      FROM products
      WHERE id = product_id;

      INSERT INTO order_items (order_id, product_id, quantity, unit_price)
      VALUES (order_id, product_id, qty, unit_price);

      order_total := order_total + (qty * unit_price);
    END LOOP;

    payment_status := CASE
      WHEN order_status IN ('processing', 'shipped', 'delivered') THEN 'paid'
      WHEN order_status = 'pending' THEN 'pending'
      ELSE 'failed'
    END;

    INSERT INTO payments (order_id, amount, method, status, paid_at)
    VALUES (
      order_id,
      order_total,
      'mock',
      payment_status,
      CASE WHEN payment_status = 'paid' THEN created_at_value + INTERVAL '10 minutes' ELSE NULL END
    );
  END LOOP;
END $$;

COMMIT;
