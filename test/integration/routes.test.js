const request = require('supertest');
const chai = require('chai');
const { expect } = chai;
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:'); // Use in-memory database
const app = require('../../app')(db); // Pass the in-memory database

// Helper function to execute SQL queries with async/await
function runQuery(db, query, params = []) {
    return new Promise((resolve, reject) => {
        db.run(query, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

describe('Integration tests for routes', () => {
    before(async () => {
        // Create tables in the in-memory database
        await runQuery(db, `
            CREATE TABLE items (
                id INTEGER PRIMARY KEY,
                name TEXT,
                price REAL
            )
        `);

        await runQuery(db, `
            CREATE TABLE cart (
                item_id INTEGER,
                quantity INTEGER
            )
        `);

        // Seed initial data
        await runQuery(db, 'INSERT INTO items (id, name, price) VALUES (1, "Test Item", 10.0)');
    });

    after(async () => {
        // Drop tables to clean up
        await runQuery(db, 'DROP TABLE IF EXISTS items');
        await runQuery(db, 'DROP TABLE IF EXISTS cart');
    });

    it('should add an item to the cart', async () => {
        const res = await request(app)
            .post('/add-to-cart')
            .send({ itemId: 1 });
        expect(res.status).to.equal(302); // Expect a redirect
        expect(res.headers.location).to.include('/?message=Item+successfully+added+to+cart');

        // Verify the item was added to the cart
        db.get('SELECT * FROM cart WHERE item_id = 1', (err, cart) => {
            expect(cart).to.not.be.null;
            expect(cart.quantity).to.equal(1);
        });
    });

    it('should display the cart page', async () => {
        await runQuery(db, 'INSERT INTO cart (item_id, quantity) VALUES (1, 2)');
    
        const res = await request(app).get('/cart');
        expect(res.status).to.equal(200);
        expect(res.text).to.include('Test Item');
    });

    it('should display the checkout page', async () => {
        await runQuery(db, 'INSERT INTO cart (item_id, quantity) VALUES (1, 2)');
    
        const res = await request(app).get('/checkout');
        expect(res.status).to.equal(200);
        expect(res.text).to.include('Thanks for your order!');
    });
});