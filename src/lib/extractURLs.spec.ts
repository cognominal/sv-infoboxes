// extractUrls.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { extractUrls } from './yourModuleFile';

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