// import { type searchResult } from '$type';
import {type  Cache, createTimedCache}  from '$lib/cache'

export type SearchResult = {
    title: string,
    snippet: string,
    pageId: string,
    category?: string
}

export const searchResultCache : Cache<searchResult> = 
    createTimedCache<searchResult>()