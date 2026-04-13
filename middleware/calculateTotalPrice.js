module.exports = () => (req, res, next) => {
  if (!req.cartQuantities || !req.items) {
    req.totalPrice = 0; // Default to 0 if cart or items data is missing
    return next();
  }

  // Calculate the total price programmatically
  req.totalPrice = req.items.reduce((total, item) => {
    const quantity = req.cartQuantities[item.id] || 0; // Get quantity from cartQuantities
    return total + item.price * quantity; // Add the item's total price to the total
  }, 0);

  next(); // Pass control to the next middleware or route handler
};