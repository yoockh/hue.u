const products = require('../data/products.json');
const { AppError } = require('../utils/errorHandler');

const getProducts = (req, res, next) => {
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
    next(new AppError('Gagal mengambil data katalog produk.', 500, 'products_fetch_error'));
  }
};

module.exports = {
  getProducts
};
