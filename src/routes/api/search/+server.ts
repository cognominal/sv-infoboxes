import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
    const query = url.searchParams.get('query');
    const apiUrl = 'https://en.wikipedia.org/w/api.php';

    if (!query) {
        return new Response(JSON.stringify({ error: 'Query parameter is required' }), { status: 400 });
    }

    try {
        const response = await fetch(
            `${apiUrl}?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`
        );
        const data = await response.json();

        const results = data.query.search.map((item: any) => ({
            title: item.title,
            snippet: item.snippet,
            pageId: item.pageid,
        }));

        return new Response(JSON.stringify(results), { status: 200 });
    } catch (error) {
        console.error('Error fetching data:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch Wikipedia data' }), { status: 500 });
    }
};