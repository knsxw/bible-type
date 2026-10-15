import { createBibleAPI } from '../bible-api.js';

const bible = createBibleAPI({
    key: process.env.API_BIBLE_KEY,
    bibleId: process.env.NIV_BIBLE_ID,
});

export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { action, chapter, id } = req.query;

        if (action === 'books') {
            return res.json(await bible.catalog());
        }
        if (action === 'verses') {
            return res.json(await bible.verses(chapter || ''));
        }
        if (action === 'verse') {
            return res.json(await bible.verse(id || ''));
        }

        return res.status(404).json({ error: 'Not found' });
    } catch (error) {
        return res.status(error.status || 500).json({
            error: error.status
                ? error.message
                : 'Unable to load Scripture. Please try again.',
        });
    }
}