const getCartQuantities = require('./middleware/getCartQuantities');
const validateInput = require('./middleware/validateInput');
const calculateTotalPrice = require('./middleware/calculateTotalPrice');

module.exports = (app, db) => {

    // Use the middleware for routes that need cart quantities
    app.use(getCartQuantities());

    // Home route
    app.get('/', (req, res, next) => {
        // Fetch items in the cart
        const query = `
        SELECT items.id AS id, items.name, items.price, cart.quantity
        FROM cart
        JOIN items ON cart.item_id = items.id
    `;
        db.all(query, (err, cartItems) => {
            if (err) {
                return res.status(500).send('Error fetching cart items');
            }

            req.items = cartItems; // Attach cart items to req
            next(); // Pass control to the getCartQuantities middleware
        });
    }, getCartQuantities(), (req, res) => {
        db.all('SELECT * FROM items', (err, items) => {
            if (err) {
                return res.status(500).send('Internal Server Error');
            }

            const cartCount = req.items.reduce((sum, item) => sum + item.quantity, 0); // Calculate cartCount
            res.render('index', {
                items,
                cartQuantities: req.cartQuantities, // Use cart quantities from middleware
                showRemoveForm: false,
                cartCount,
                message: req.query.message // Get the message from the query string
            });
        });
    });

    //Remove item route
    app.get('/remove', (req, res) => {
        db.all('SELECT * FROM items', (err, items) => {
            if (err) {
                return res.status(500).send('Error fetching items');
            }

            db.get('SELECT SUM(quantity) AS count FROM cart WHERE quantity > 0', (err, row) => {
                if (err) {
                    return res.status(500).send('Error fetching cart count');
                }

                const cartCount = row.count || 0;
                res.render('index', {
                    items,
                    cartQuantities: req.cartQuantities, // Use cart quantities from middleware
                    showRemoveForm: true,
                    cartCount
                });
            });
        });
    });

    // Add item to cart route
    app.post('/add-to-cart', validateInput, (req, res) => {
        const { itemId } = req.body;

        db.get('SELECT quantity FROM cart WHERE item_id = ?', [itemId], (err, row) => {
            if (err) {
                return res.status(500).send('Error querying cart');
            }
            if (row) {
                if (row.quantity < 10) {
                    db.run('UPDATE cart SET quantity = quantity + 1 WHERE item_id = ?', [itemId], (err) => {
                        if (err) {
                            return res.status(500).send('Error updating cart');
                        }
                        res.redirect('/?message=Item+successfully+added+to+cart');
                    });
                } else {
                    res.redirect('/?message=Item+already+at+max+quantity');
                }
            } else {
                db.run('INSERT INTO cart (item_id, quantity) VALUES (?, 1)', [itemId], (err) => {
                    if (err) {
                        return res.status(500).send('Error inserting into cart');
                    }
                    res.redirect('/?message=Item+successfully+added+to+cart');
                });
            }
        });
    });

    // Remove item from database route
    app.post('/remove-item', (req, res) => {
        const { itemId } = req.body; // Assuming the item ID is sent in the request body

        // Remove the item from the items table
        db.run('DELETE FROM items WHERE id = ?', [itemId], (err) => {
            if (err) {
                return res.status(500).send('Error removing item');
            }

            // Remove the corresponding entry from the cart table
            db.run('DELETE FROM cart WHERE item_id = ?', [itemId], (err) => {
                if (err) {
                    return res.status(500).send('Error removing item from cart');
                }

                res.redirect('/'); // Redirect back to the home page after deletion
            });
        });
    });

    // Update item quantity in cart route
    app.post('/update-quantity', (req, res) => {
        const { itemId, quantity } = req.body;

        // Parse the quantity as an integer and ensure it's within the allowed range (0 to 10)
        const validQuantity = Math.max(0, Math.min(10, parseInt(quantity, 10)));

        if (isNaN(validQuantity)) {
            return res.status(400).send('Invalid quantity');
        }

        if (validQuantity === 0) {
            // Remove the item from the cart if quantity is 0
            db.run('DELETE FROM cart WHERE item_id = ?', [itemId], (err) => {
                if (err) {
                    return res.status(500).send('Error updating quantity');
                }
                res.redirect('/cart');
            });
        } else {
            // Update the quantity in the cart
            db.run('UPDATE cart SET quantity = ? WHERE item_id = ?', [validQuantity, itemId], (err) => {
                if (err) {
                    return res.status(500).send('Error updating quantity');
                }
                res.redirect('/cart');
            });
        }
    });

    // Shopping cart route
    app.get('/cart', (req, res, next) => {
        // Fetch items in the cart
        const query = `
        SELECT items.id AS id, items.name, items.price, cart.quantity
        FROM cart
        JOIN items ON cart.item_id = items.id
    `;
        db.all(query, (err, cartItems) => {
            if (err) {
                return res.status(500).send('Error fetching cart items');
            }

            req.items = cartItems; // Attach cart items to req
            next(); // Pass control to the getCartQuantities middleware
        });
    }, getCartQuantities(), calculateTotalPrice(), (req, res) => {
        // Render the cart page
        const cartCount = req.items.reduce((sum, item) => sum + item.quantity, 0); // Calculate cartCount
        res.render('cart', {
            cartItems: req.items,
            totalPrice: req.totalPrice,
            cartCount
        });
    });

    // Reset cart route
    app.post('/reset-cart', (req, res) => {
        db.run('DELETE FROM cart', (err) => {
            if (err) {
                return res.status(500).send('Error resetting the cart');
            }

            // Redirect to the home page after resetting the cart
            res.redirect('/');
        });
    });

    // Checkout route
    app.get('/checkout', (req, res, next) => {
        // Fetch items in the cart
        const query = `
        SELECT items.id AS id, items.name, items.price, cart.quantity
        FROM cart
        JOIN items ON cart.item_id = items.id
    `;
        db.all(query, (err, cartItems) => {
            if (err) {
                return res.status(500).send('Error fetching cart items');
            }

            req.items = cartItems; // Attach cart items to req
            next(); // Pass control to the getCartQuantities middleware
        });
    }, getCartQuantities(), calculateTotalPrice(), (req, res) => {
        res.render('checkout', { totalPrice: req.totalPrice });
    });
};
