-- ============================================================
-- Game & Collectibles E-Commerce — Seed Data
-- ============================================================

-- ============================================================
-- CATEGORIES
-- ============================================================
INSERT INTO categories (name, description) VALUES
    ('Board Games', 'Strategic and party board games for all ages'),
    ('Card Games', 'Trading cards, TCG, and collectible card games'),
    ('Dice & Accessories', 'Premium dice sets and gaming accessories'),
    ('Mystery Boxes', 'Blind boxes and mystery bags with surprises');

-- ============================================================
-- PRODUCTS (50 items)
-- ============================================================

INSERT INTO products (category_id, name, description, price, stock_qty) VALUES
(1, 'Catan (Settlers of Catan)', 'Trade resources and build settlements. Classic strategy game for 3-4 players. Ages 10+', 1290.00, 18),
(1, 'Ticket to Ride: Europe', 'Build railways across Europe. For 2-5 players, 60-90 minutes. Great for all ages', 1490.00, 12),
(1, 'Codenames', 'Guess words from clues. Party game for 4-8+ players. 15 minutes per round', 590.00, 35),
(1, 'Dixit', 'Creative storytelling with beautiful artwork. 3-6 players, 30 minutes', 890.00, 22),
(1, 'Pandemic', 'Cooperative game to save the world. 2-4 players, 45 minutes', 1190.00, 16),
(1, 'Splendor', 'Build gem trading empire. 2-4 players, 30 minutes. Strategy gameplay', 890.00, 20),
(1, 'King of Tokyo', 'Monster fighting card + dice game. 2-6 players, 30 minutes', 750.00, 25),
(1, 'Carcassonne', 'Tile-laying game building medieval landscapes. 2-5 players, 45 minutes', 890.00, 14),
(1, 'Lords of Waterdeep', 'D&D themed worker placement game. 2-5 players, 60 minutes', 1090.00, 10),
(1, 'Azul', 'Beautiful tile-placing abstract game. 2-4 players, 30-45 minutes', 690.00, 28),
(1, 'Ticket to Ride: Nordic Countries', 'Railway building game. 2-3 players, board game classic', 1290.00, 9),
(1, 'Small World', 'Fantasy civilization control game. 2-5 players, 80 minutes', 1190.00, 11),
(1, 'Stone Age', 'Worker placement about early civilization. 2-4 players, 60 minutes', 990.00, 13),
(2, 'Magic: The Gathering Starter Deck', 'Official MTG beginner set. 60-card ready-to-play deck', 890.00, 30),
(2, 'Yu-Gi-Oh! TCG Booster Box', 'Official booster box with 24 packs. Sealed product', 2490.00, 8),
(2, 'Pokemon TCG Elite Trainer Box', 'Official Pokemon booster packs + accessories. Sealed', 1890.00, 12),
(2, 'UNO Card Game', 'Classic color-matching card game. 2-10 players. 10+ ages', 250.00, 80),
(2, 'Exploding Kittens', 'Funny and chaotic card game. 2-5 players, 15 minutes', 390.00, 45),
(2, 'Love Letter', 'Deduction card game. 2-4 players, 15 minutes. Highly addictive', 290.00, 35),
(2, '7 Wonders', 'Card drafting civilization game. 3-7 players, 45 minutes', 1290.00, 14),
(2, 'Fluxx', 'Rules-changing card game. 2-6 players, 15-30 minutes', 390.00, 42),
(2, 'Tarot Classic 78 Cards', 'Classic tarot deck with guidebook. 78 cards + manual', 390.00, 28),
(2, 'Bicycle Rider Back Playing Cards', 'Professional poker-size cards. Magicians preferred', 180.00, 60),
(2, 'Gwent: The Witcher Card Game', 'Card game from The Witcher. 2 players competitive', 590.00, 19),
(2, 'One Piece TCG Starter Deck', 'Official One Piece trading card game', 690.00, 24),
(3, 'RPG Polyhedral Dice Set (7-piece)', 'Complete D4/D6/D8/D10/D12/D20/D% set for tabletop RPG', 299.00, 55),
(3, 'Metal Dice Set - Gold & Black', 'Premium metal alloy dice. Heavy weight, luxury feel. 7-piece set', 450.00, 22),
(3, 'Crystal Dice Set - Rainbow', 'Resin dice with crystal patterns. UV reactive. 7-piece set', 450.00, 18),
(3, 'Chessex Speckled Dice Set', 'Popular brand polyhedral dice set. Various colors available', 320.00, 40),
(3, 'Dice Tray - Leather (PU)', 'Padded leather dice rolling tray. 20×20cm. Reduces noise', 199.00, 38),
(3, 'Dice Tower - Wood', 'Wooden dice tower for rolling. 3-tier tower design', 290.00, 25),
(3, 'Velvet Dice Bag - Large', 'Soft velvet pouch for dice storage. Drawstring closure', 99.00, 120),
(3, 'Dice Box - Premium Wood', 'Wooden storage box with magnetic lid. Holds 7 dice', 159.00, 32),
(3, 'D20 Metal Dice (Single)', 'Large metal d20 die. Perfect for damage rolls. Heavy duty', 150.00, 70),
(3, 'Acrylic Dice Set (6-pack)', 'Transparent acrylic d6 dice. 6-piece set. Multiple colors', 89.00, 95),
(3, 'Dice Rolling Mat (Playmat)', 'Non-slip dice rolling surface. 24×24 inch fabric mat', 249.00, 18),
(3, 'Character Record Sheet Pad', 'D&D 5e character sheets. 50-page pad. Premium paper', 99.00, 65),
(3, 'Miniature Painting Set', 'Starter paint set for miniature painting. 12 colors included', 390.00, 28),
(3, 'Dice Vault - Premium Storage', 'Rotating dice storage tower. Holds 10+ dice sets', 590.00, 11),
(3, 'Metal Coin Set - RPG Treasure', 'Collectible metal coins for tabletop games. 10 coins', 290.00, 20),
(4, 'Funko Pop Mystery Box', 'Sealed blind box with random Funko Pop figure. Different series available', 450.00, 35),
(4, 'Squishmallow Mystery Bag', 'Blind bag with random Squishmallow plushie. Various sizes', 390.00, 42),
(4, 'Mini Figures Mystery Pack', 'Blind box with random collectible mini figures. Building block compatible', 290.00, 55),
(4, 'Trading Card Mystery Booster', 'Sealed mystery booster pack. Random vintage or modern cards inside', 550.00, 18),
(4, 'Dice & Miniatures Mystery Box', 'Surprise assortment of dice sets and gaming miniatures', 890.00, 12),
(4, 'Pokemon Packs Mystery Bundle', 'Sealed mystery bundle of 5 random Pokemon booster packs', 1290.00, 8),
(4, 'Board Game Expansion Mystery', 'Random sealed board game expansion pack for popular games', 690.00, 14),
(4, 'Vintage Games Mystery Box', 'Sealed mystery box with classic games and collectibles. Varies', 1590.00, 5),
(4, 'Anime Figure Mystery Blind Box', 'Random anime collectible figure in blind box packaging', 520.00, 28),
(4, 'Deluxe Gaming Bundle Mystery', 'Premium mystery bundle: dice, cards, minis, and accessories', 1890.00, 7);


-- ============================================================
-- ADMIN USER (password: Davidice123)
-- ============================================================
INSERT INTO users (role_id, name, email, password_hash) VALUES
    (1, 'Admin', 'admin@davidice.com', '$2b$12$tSGHTYiTAKCUUapI3ZAFQuv9LA7eJOqVVLPBJFbZJggGowAslzLnK')
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- PRODUCT IMAGES (local uploads)
-- ============================================================
INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES
-- Board Games
(1, '/uploads/Board Games/catan.jfif', true, 1),
(2, '/uploads/Board Games/Ticket to Ride Nordic Countries.jpg', true, 1),
(3, '/uploads/Board Games/codenames.jfif', true, 1),
(4, '/uploads/Board Games/Dixit.png', true, 1),
(5, '/uploads/Board Games/pandemic.png', true, 1),
(6, '/uploads/Board Games/splendor.png', true, 1),
(7, '/uploads/Board Games/king of tokyo.jpg', true, 1),
(8, '/uploads/Board Games/Carcassonne.jfif', true, 1),
(9, '/uploads/Board Games/lords-of-lord of waterdeep.jpg', true, 1),
(10, '/uploads/Board Games/azul.jfif', true, 1),
(11, '/uploads/Board Games/Ticket to Ride Nordic Countries.jpg', true, 1),
(12, '/uploads/Board Games/Small World.jpg', true, 1),
(13, '/uploads/Board Games/Stone age.jpg', true, 1),
-- Card Games
(14, '/uploads/Card Games/magic the gathering starter deck.jpg', true, 1),
(15, '/uploads/Card Games/Yu-gi-oh.jfif', true, 1),
(16, '/uploads/Card Games/Pokemon.jpg', true, 1),
(17, '/uploads/Card Games/Uno.jfif', true, 1),
(18, '/uploads/Card Games/Exploding Kittens.jpg', true, 1),
(19, '/uploads/Card Games/love letter.jpg', true, 1),
(20, '/uploads/Card Games/7 wonders.png', true, 1),
(21, '/uploads/Card Games/Fluxx.png', true, 1),
(22, '/uploads/Card Games/Tarot classic.jfif', true, 1),
(23, '/uploads/Card Games/riderbacks card.jpg', true, 1),
(24, '/uploads/Card Games/gwent.jfif', true, 1),
(25, '/uploads/Card Games/one piece.jfif', true, 1),
-- Dice & Accessories
(26, '/uploads/Dice&Accessories/RPG Polyhedral Dice set.jfif', true, 1),
(27, '/uploads/Dice&Accessories/Metal Dice Set.jfif', true, 1),
(28, '/uploads/Dice&Accessories/Crystal Dice Set.jpg', true, 1),
(29, '/uploads/Dice&Accessories/Chessex Speckled Dice Set.jpg', true, 1),
(30, '/uploads/Dice&Accessories/Dice Tray Leather.jpg', true, 1),
(31, '/uploads/Dice&Accessories/Dice Tower Wood.jpg', true, 1),
(32, '/uploads/Dice&Accessories/Velvet dice bage.jfif', true, 1),
(33, '/uploads/Dice&Accessories/Dice Box.jfif', true, 1),
(34, '/uploads/Dice&Accessories/D20 Metal Dice.jfif', true, 1),
(35, '/uploads/Dice&Accessories/Acrylic Dice set.jfif', true, 1),
(36, '/uploads/Dice&Accessories/Dice rolling mat.jfif', true, 1),
(37, 'https://placehold.co/400x400/6366f1/ffffff?text=Character+Sheets', true, 1),
(38, '/uploads/Dice&Accessories/miniature painting set.jpg', true, 1),
(39, '/uploads/Dice&Accessories/Dice Vault.jpg', true, 1),
(40, '/uploads/Dice&Accessories/Metal coin set.jpg', true, 1),
-- Mystery Boxes
(41, '/uploads/Mystery Box/funko pop.jpg', true, 1),
(42, '/uploads/Mystery Box/Squishmallows-5-Scented-Mystery-Bags-1.jpg', true, 1),
(43, '/uploads/Mystery Box/mini figure.jpg', true, 1),
(44, '/uploads/Mystery Box/Trading Card Mystery Booster.jfif', true, 1),
(45, '/uploads/Mystery Box/Dice & Miniatures Mystery Box.jfif', true, 1),
(46, '/uploads/Mystery Box/pokemon mystery bundle.png', true, 1),
(47, 'https://placehold.co/400x400/6366f1/ffffff?text=Board+Game+Expansion', true, 1),
(48, 'https://placehold.co/400x400/6366f1/ffffff?text=Vintage+Games+Box', true, 1),
(49, '/uploads/Mystery Box/anime figure mystery.jfif', true, 1),
(50, 'https://placehold.co/400x400/6366f1/ffffff?text=Deluxe+Gaming+Bundle', true, 1);


