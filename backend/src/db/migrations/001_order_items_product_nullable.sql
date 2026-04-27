-- Migration 001: Allow product deletion even when order_items reference it
-- product_id becomes nullable with ON DELETE SET NULL to preserve order history

ALTER TABLE order_items ALTER COLUMN product_id DROP NOT NULL;

ALTER TABLE order_items
  DROP CONSTRAINT order_items_product_id_fkey;

ALTER TABLE order_items
  ADD CONSTRAINT order_items_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;
