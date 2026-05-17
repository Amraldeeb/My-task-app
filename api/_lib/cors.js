function applyCors(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.APP_FRONTEND_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function handleOptions(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}

module.exports = { applyCors, handleOptions };
