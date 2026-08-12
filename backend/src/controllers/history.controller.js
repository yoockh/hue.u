const { getHistory } = require('../services/firestore.service');
const { AppError } = require('../utils/errorHandler');

// GET /api/history — scan history, newest first.
const listHistory = async (req, res, next) => {
  try {
    const history = await getHistory();
    return res.status(200).json({ status: 'success', data: history });
  } catch (error) {
    next(new AppError('Failed to load scan history.', 502, 'history_fetch_error'));
  }
};

module.exports = { listHistory };
