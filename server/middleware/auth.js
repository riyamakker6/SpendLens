// middleware/auth.js
module.exports = (req, res, next) => {
  if (req.session && req.session.userId) {
    req.userId = req.session.userId;
    next();
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
};
