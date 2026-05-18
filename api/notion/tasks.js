const { applyCors, handleOptions } = require('../_lib/cors');

function getTaskTitle(page) {
  const titleProp = Object.values(page.properties || {}).find((prop) => prop.type === 'title');
  return titleProp?.title?.map((part) => part.plain_text).join('') || 'Untitled task';
}

function getSelectValue(page, type) {
  const prop = Object.values(page.properties || {}).find((entry) => entry.type === type);
  return prop?.[type]?.name || '';
}

function getCheckboxValue(page) {
  const prop = Object.values(page.properties || {}).find((entry) => entry.type === 'checkbox');
  return !!prop?.checkbox;
}

function getDateValue(page) {
  const prop = Object.values(page.properties || {}).find((entry) => entry.type === 'date');
  const start = prop?.date?.start || null;
  if (!start) return { date: null, time: null };

  // Notion returns either "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm:ss.000+HH:MM"
  if (start.includes('T')) {
    const [datePart, timePart] = start.split('T');
    const time = timePart.slice(0, 5); // "HH:mm"
    return { date: datePart, time };
  }

  return { date: start, time: null };
}

module.exports = async (req, res) => {
  if (handleOptions(req, res)) return;
  applyCors(req, res);

  try {
    const token = process.env.NOTION_TOKEN;
    const databaseId = process.env.NOTION_DATABASE_ID;

    if (!token || !databaseId) {
      throw new Error('Missing Notion credentials');
    }

    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        page_size: 20
      })
    });

    if (!response.ok) {
      throw new Error(`Notion request failed: ${response.status}`);
    }

    const data = await response.json();

    const tasks = (data.results || []).map((page) => {
      const { date, time } = getDateValue(page);
      return {
        id: page.id,
        title: getTaskTitle(page),
        status: getSelectValue(page, 'status') || getSelectValue(page, 'select') || 'Notion task',
        done: getCheckboxValue(page),
        url: page.url,
        date,
        time
      };
    });

    res.status(200).json({ tasks });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to load Notion tasks' });
  }
};
