module.exports = (req, res, next) => {
  const { itemId, quantity } = req.body;

  if (!itemId || isNaN(itemId)) {
    return res.status(400).json({ error: 'Invalid or missing itemId' });
  }

  if (quantity !== undefined && (isNaN(quantity) || quantity < 0 || quantity > 5)) {
    return res.status(400).json({ error: 'Quantity must be between 0 and 5' });
  }

  next();
};