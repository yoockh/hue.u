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

// GET /api/history/latest — the single most recent scan (with its season), for
// the "use my latest result" shortcut in the Product tab. When there is no
// history yet this is a normal empty state, not an error: return 200 with
// { status: 'empty' } so the client can branch cleanly instead of parsing a 404.
const getLatestHistory = async (req, res, next) => {
  try {
    const [latest] = await getHistory(1);

    if (!latest) {
      return res.status(200).json({ status: 'empty', data: null });
    }

    return res.status(200).json({ status: 'success', data: latest });
  } catch (error) {
    next(new AppError('Failed to load latest scan history.', 502, 'history_fetch_error'));
  }
};

module.exports = { listHistory, getLatestHistory };
