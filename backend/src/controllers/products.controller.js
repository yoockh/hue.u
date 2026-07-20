const products = require('../data/products.json');

const getProducts = (req, res) => {
  try {
    const { colors } = req.query;

    if (!colors) {
      return res.status(200).json({ status: 'success', data: products });
    }

    const filterColors = colors.split(',')
      .map(c => c.trim().toLowerCase())
      .filter(Boolean);

    if (filterColors.length === 0) {
      return res.status(200).json({ status: 'success', data: products });
    }

    const filteredProducts = products.filter(product => {
      const prodColor = product.dominant_color.toLowerCase();
      return filterColors.some(filterColor => 
        prodColor === filterColor || 
        prodColor.includes(filterColor) ||
        filterColor.includes(prodColor)
      );
    });

    return res.status(200).json({
      status: 'success',
      data: filteredProducts
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve products',
      error: error.message
    });
  }
};

module.exports = {
  getProducts
};
