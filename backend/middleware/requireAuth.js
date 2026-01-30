const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const token = req.cookies.session;
  if (!token) return res.sendStatus(401);

  try {
    // eslint-disable-next-line no-undef
    const secret = process.env.JWT_SECRET || "dev_secret"; // <-- fallback
    const payload = jwt.verify(token, secret);
    req.user = { id: payload.userId };
    next();
  } catch (err) {
    console.error("JWT verify failed:", err.message);
    res.sendStatus(401);
  }
}

module.exports = requireAuth;
