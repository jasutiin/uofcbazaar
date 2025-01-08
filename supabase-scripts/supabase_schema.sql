DROP TABLE IF EXISTS 
    notifications, 
    message, 
    chat, 
    listings,
    listing_follows,
    users 
CASCADE;

CREATE TABLE IF NOT EXISTS users (
    ucid VARCHAR(50) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS listings (
    listing_id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(ucid) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    item_condition VARCHAR(20) CHECK (item_condition IN ('new', 'used', 'like new')),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS listing_follows (
    follow_id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(ucid) ON DELETE CASCADE,
    listing_id INT REFERENCES listings(listing_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, listing_id)
);

CREATE TABLE IF NOT EXISTS chat (
    chat_id SERIAL PRIMARY KEY,
    buyer_user_id VARCHAR(50) NOT NULL,
    seller_user_id VARCHAR(50) NOT NULL,
    FOREIGN KEY (buyer_user_id) REFERENCES users(ucid) ON DELETE CASCADE,
    FOREIGN KEY (seller_user_id) REFERENCES users(ucid) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS message (
  message_id SERIAL PRIMARY KEY,
  chat_id INT NOT NULL,
  sender_user_id VARCHAR(50) NOT NULL,
  message_datetime TIMESTAMPTZ DEFAULT NOW(),
  message_text TEXT,
  FOREIGN KEY (chat_id) REFERENCES chat(chat_id) ON DELETE CASCADE,
  FOREIGN KEY (sender_user_id) REFERENCES users(ucid) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(ucid) ON DELETE CASCADE,
  message VARCHAR(255),
  link VARCHAR(255),
  type VARCHAR(255),
  timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  is_read BOOLEAN DEFAULT FALSE  
);
