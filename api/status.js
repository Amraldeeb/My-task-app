const { applyCors, handleOptions } = require('./_lib/cors');

module.exports = async (req, res) => {
  if (handleOptions(req, res)) return;
  applyCors(req, res);

  res.status(200).json({
    ok: true,
    googleCalendar: Boolean(
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REFRESH_TOKEN
    ),
    notion: Boolean(process.env.NOTION_TOKEN && process.env.NOTION_DATABASE_ID),
    vercel: true,
    timestamp: new Date().toISOString()
  });
};
