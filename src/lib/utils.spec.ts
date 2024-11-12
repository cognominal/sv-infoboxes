// wikidataApi.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getWikidataID, getP31Property, getInstanceOf, 
    getLabelFromWikidataID, extractUrls } from '$lib/utils'

globalThis.fetch = vi.fn();

// Mock data responses for each function's API call
const mockWikidataResponse = {
    query: {
        pages: {
            "12345": {
                pageprops: {
                    wikibase_item: "Q42"
                }
            }
        }
    }
};

const mockP31Response = {
    claims: {
        P31: [{
            mainsnak: {
                datavalue: {
                    value: { id: "Q5" }
                }
            }
        }]
    }
};

const mockLabelResponse = {
    entities: {
        Q42: {
            labels: {
                en: {
                    value: "Douglas Adams"
                }
            }
        }
    }
};

describe('getWikidataID', () => {
    it('should return the Wikidata ID for a valid Wikipedia page', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            json: async () => mockWikidataResponse,
        });

        const result = await getWikidataID("Douglas Adams");
        expect(result).toBe("Q42");
    });

    it('should return null for an invalid page title', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            json: async () => ({ query: { pages: { "-1": {} } } }),
        });

        const result = await getWikidataID("Nonexistent Page");
        expect(result).toBeNull();
    });
});

describe('getP31Property', () => {
    it('should return the P31 property ID if available', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            json: async () => mockP31Response,
        });

        const result = await getP31Property("Q42");
        expect(result).toBe("Q5");
    });

    it('should return null if P31 property is not found', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            json: async () => ({ claims: {} }),
        });

        const result = await getP31Property("Q42");
        expect(result).toBeNull();
    });
});

describe('getInstanceOf', () => {
    it('should return the instance of property for a valid Wikipedia page', async () => {
        (fetch as jest.Mock)
            .mockResolvedValueOnce({ json: async () => mockWikidataResponse })
            .mockResolvedValueOnce({ json: async () => mockP31Response });

        const result = await getInstanceOf("Douglas Adams");
        expect(result).toBe("Q5");
    });

    it('should return null if Wikidata ID is not found', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            json: async () => ({ query: { pages: { "-1": {} } } }),
        });

        const result = await getInstanceOf("Nonexistent Page");
        expect(result).toBeNull();
    });
});

describe('getLabelFromWikidataID', () => {
    it('should return the label for a valid Wikidata ID', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            json: async () => mockLabelResponse,
        });

        const result = await getLabelFromWikidataID("Q42", "en");
        expect(result).toBe("Douglas Adams");
    });

    it('should return null if label is not found for the specified language', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            json: async () => ({ entities: { Q42: { labels: {} } } }),
        });

        const result = await getLabelFromWikidataID("Q42", "fr");
        expect(result).toBeNull();
    });
});

describe('extractUrls', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <a href="wikiArticle.html">Article</a>
            <a href="https://example.com/page">Example</a>
            <a href="wikiPage.html">Wiki Page</a>
        `;
    });

    it('should return URLs matching the provided pattern', () => {
        const pattern = /^wiki.*\.html$/;
        const result = extractUrls(pattern);
        expect(result).toEqual(['wikiArticle.html', 'wikiPage.html']);
    });

    it('should return an empty array if no URLs match', () => {
        const pattern = /^nonexistent.*\.html$/;
        const result = extractUrls(pattern);
        expect(result).toEqual([]);
    });

    it('should ignore links without href attribute', () => {
        document.body.innerHTML += `<a>No href</a>`;
        const pattern = /^wiki.*\.html$/;
        const result = extractUrls(pattern);
        expect(result).toEqual(['wikiArticle.html', 'wikiPage.html']);
    });
});