module.exports = () => (req, res, next) => {
  if (!req.items) {
    req.cartQuantities = {}; // Default to an empty object if no items are available
    return next();
  }

  // Calculate cart quantities programmatically
  req.cartQuantities = req.items.reduce((acc, item) => {
    acc[item.id] = item.quantity; // Use the item's ID as the key and its quantity as the value
    return acc;
  }, {});

  next(); // Proceed to the next middleware or route
};