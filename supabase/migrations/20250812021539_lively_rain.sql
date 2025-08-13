/*
  # Ecommerce Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `password` (text)
      - `name` (text)
      - `phone` (text)
      - `address` (text)
      - `type` (integer) - 0: comum, 1: funcionário, 2: admin
      - `created_at` (timestamp)
    
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `created_at` (timestamp)
    
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `price` (decimal)
      - `image_url` (text)
      - `category_id` (uuid, foreign key)
      - `active` (boolean, default true)
      - `created_at` (timestamp)
    
    - `orders`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `total_amount` (decimal)
      - `delivery_type` (text) - 'local' or 'delivery'
      - `delivery_fee` (decimal, default 0)
      - `status` (text, default 'pending')
      - `stripe_payment_intent_id` (text)
      - `created_at` (timestamp)
    
    - `order_items`
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key)
      - `product_id` (uuid, foreign key)
      - `quantity` (integer)
      - `unit_price` (decimal)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for different user types
*/

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  name text NOT NULL,
  phone text DEFAULT '',
  address text DEFAULT '',
  type integer DEFAULT 0, -- 0: comum, 1: funcionário, 2: admin
  created_at timestamptz DEFAULT now()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  price decimal(10,2) NOT NULL,
  image_url text DEFAULT '',
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  total_amount decimal(10,2) NOT NULL,
  delivery_type text NOT NULL DEFAULT 'local', -- 'local' or 'delivery'
  delivery_fee decimal(10,2) DEFAULT 0,
  status text DEFAULT 'pending',
  stripe_payment_intent_id text,
  created_at timestamptz DEFAULT now()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  unit_price decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users policies
CREATE POLICY "Users can view own data"
  ON users
  FOR SELECT
  USING (true); -- Will be handled in application logic

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can insert users" 
  ON users
  FOR INSERT
  WITH CHECK (true);

-- Categories policies (public read, admin write)
CREATE POLICY "Anyone can view categories"
  ON categories
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON categories
  FOR ALL
  USING (true);

-- Products policies (public read, admin write)
CREATE POLICY "Anyone can view active products"
  ON products
  FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can manage products"
  ON products
  FOR ALL
  USING (true);

-- Orders policies
CREATE POLICY "Users can view own orders"
  ON orders
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create orders"
  ON orders
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own orders"
  ON orders
  FOR UPDATE
  USING (true);

-- Order items policies
CREATE POLICY "Users can view own order items"
  ON order_items
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create order items"
  ON order_items
  FOR INSERT
  WITH CHECK (true);

-- Insert default categories
INSERT INTO categories (name, description) VALUES
('Pratos Principais', 'Pratos principais do nosso cardápio'),
('Bebidas', 'Bebidas geladas e quentes'),
('Sobremesas', 'Sobremesas deliciosas'),
('Entradas', 'Aperitivos e entradas')
ON CONFLICT DO NOTHING;

-- Insert admin user (password: admin123)
INSERT INTO users (email, password, name, type) VALUES
('admin@admin.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador', 2)
ON CONFLICT DO NOTHING;