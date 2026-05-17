async function getGoogleAccessToken() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing Google credentials');
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })
  });

  if (!response.ok) {
    throw new Error(`Google token request failed: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

function formatGoogleEvent(event) {
  const startRaw = event.start?.dateTime || event.start?.date;
  const endRaw = event.end?.dateTime || event.end?.date;
  const startDate = new Date(startRaw);
  const endDate = new Date(endRaw);
  const isAllDay = !event.start?.dateTime;
  const durationMinutes = Math.max(0, Math.round((endDate - startDate) / 60000));
  const duration =
    durationMinutes >= 60
      ? `${Math.round(durationMinutes / 60)}hr`
      : `${durationMinutes || 30}min`;

  return {
    id: event.id,
    name: event.summary || 'Untitled event',
    time: isAllDay
      ? 'All day'
      : startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    duration,
    date: startDate.toISOString().slice(0, 10),
    color: '#60a5fa',
    source: 'gcal'
  };
}

module.exports = { getGoogleAccessToken, formatGoogleEvent };
