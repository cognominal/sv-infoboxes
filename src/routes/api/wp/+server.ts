import type { RequestHandler } from '@sveltejs/kit';

// In-memory cache object
const cache: Record<string, { title: string; content: string; timestamp: number }> = {};
const CACHE_DURATION = 1000 * 60 * 60; // Cache for 1 hour

export const GET: RequestHandler = async ({ url }) => {
    const pageId = url.searchParams.get('pageId');
    const apiUrl = 'https://en.wikipedia.org/w/api.php';

    if (!pageId) {
        return new Response(JSON.stringify({ error: 'pageId parameter is required' }), { status: 400 });
    }

    // Check cache
    const cached = cache[pageId];
    const now = Date.now();

    if (cached && now - cached.timestamp < CACHE_DURATION) {
        // Return cached data if it's still valid
        return new Response(JSON.stringify({ title: cached.title, content: cached.content }), { status: 200 });
    }

    try {
        // Fetch data from Wikipedia if not cached or cache is stale
        const response = await fetch(
            `${apiUrl}?action=query&prop=extracts&pageids=${encodeURIComponent(pageId)}&format=json&origin=*`
        );
        const data = await response.json();

        if (!data.query.pages[pageId]) {
            return new Response(JSON.stringify({ error: 'Page not found' }), { status: 404 });
        }

        const page = data.query.pages[pageId];
        const pageData = {
            title: page.title,
            content: page.extract, // Full content of the Wikipedia page
        };

        // Store data in cache with a timestamp
        cache[pageId] = { ...pageData, timestamp: now };

        return new Response(JSON.stringify(pageData), { status: 200 });
    } catch (error) {
        console.error('Error fetching page data:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch Wikipedia page data' }), { status: 500 });
    }
};

