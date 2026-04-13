const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./shop.db');

db.serialize(() => {

  // Create items table
  db.run(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      price REAL NOT NULL,
      image_url TEXT NOT NULL
    )
  `, (err) => {
    if (err) 
      console.error('Error creating items table:', err.message);
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS cart (
      item_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      PRIMARY KEY (item_id)
    )
  `, (err) => {
    if (err)
      console.error('Error creating cart table:', err.message);
  });

  // Pre-load items into the database
  const items = [
    { name: 'Dog', price: 5, image_url: '/images/dog.jpeg' },
    { name: 'Cat', price: 6, image_url: '/images/cat.jpeg' },
    { name: 'Fox', price: 5, image_url: '/images/fox.jpeg' },
    { name: 'Goat', price: 4, image_url: '/images/goat.jpeg' },
    { name: 'Koala', price: 6, image_url: '/images/koala.jpeg' },
    { name: 'Lion', price: 5, image_url: '/images/lion.jpeg' },
    { name: 'Raccoon', price: 6, image_url: '/images/raccoon.jpeg' },
    { name: 'Tiger', price: 7, image_url: '/images/tiger.jpeg' },
    { name: 'Zebra', price: 7, image_url: '/images/zebra.jpeg' },
    { name: 'Bunny', price: 5, image_url: '/images/bunny.jpeg' }
  ];

  items.forEach((item) => {
    db.get('SELECT * FROM items WHERE name = ?', [item.name], (err, row) => {
      if (err) {
        console.error(`Error checking item existence for ${item.name}:`, err.message);
        return;
      }

      if (!row) {
        db.run(
          'INSERT INTO items (name, price, image_url) VALUES (?, ?, ?)',
          [item.name, item.price, item.image_url],
          (err) => {
            if (err) {
              console.error(`Error inserting item ${item.name}:`, err.message);
            } else {
              console.log(`Inserted item: ${item.name}`);
            }
          }
        );
      }
    });
  });
});

module.exports = db;