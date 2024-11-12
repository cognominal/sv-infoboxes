import type { RequestHandler } from '@sveltejs/kit';
import { searchcache } from '$lib/serverstate';
import { getLabelFromWikidataID } from '$lib/utils';
import { type SearchResult } from '$type';

export const GET: RequestHandler = async ({ url }) => {
    const query = url.searchParams.get('query');
    const apiUrl = 'https://en.wikipedia.org/w/api.php';

    if (!query) {
        return new Response(JSON.stringify({ error: 'Query parameter is required' }), { status: 400 });
    }

    // Check if the result is in the cache
    const cachedResults = searchcache.get(query);
    if (cachedResults) {
        return new Response(JSON.stringify(cachedResults), { status: 200 });
    }

    try {
        console.log(`fetch ${query}`)
        const response = await fetch(
            `${apiUrl}?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srprop=snippet|titlesnippet|categorysnippet`
        );
        // const response = await fetch(
        //     `${apiUrl}?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&prop=categories&clshow=!hidden&cllimit=max`
        // );        
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2))
       
        // weed out unecessary entires
        const results = data.query.search.map((item: any) => ({
            title: item.title,
            snippet: item.snippet,
            pageId: item.pageid,
        }));

        results.forEach((element: SearchResult) => {
            

        } )

        // Store the results in cache
        searchcache.set(query, results);

        return new Response(JSON.stringify(results), { status: 200 });
    } catch (error) {
        console.error('Error fetching data:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch Wikipedia data' }), { status: 500 });
    }
};