const { applyCors, handleOptions } = require('../_lib/cors');
const { getGoogleAccessToken, formatGoogleEvent } = require('../_lib/google');

module.exports = async (req, res) => {
  if (handleOptions(req, res)) return;
  applyCors(req, res);

  try {
    const accessToken = await getGoogleAccessToken();
    const calendarId = encodeURIComponent(process.env.GOOGLE_CALENDAR_ID || 'primary');
    const timeMin = new Date().toISOString();
    const timeMax = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?singleEvents=true&orderBy=startTime&timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&maxResults=100`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Google Calendar request failed: ${response.status}`);
    }

    const data = await response.json();
    const events = (data.items || []).map(formatGoogleEvent);

    res.status(200).json({ events });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to load Google Calendar events' });
  }
};
