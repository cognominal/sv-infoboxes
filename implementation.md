We used [sv](https://svelte.dev/blog/sv-the-svelte-cli) the svelte 5 cli to scaffold the app.

The end goal is to build interactive timelines from wikipedia infoboxes.
First we want a command widget which given a text entry gives a menu of
wikipedia page. The infobox of the selected wp page will be added to a current
set of infoxboxes. For a given page info in the menu, we want to have the
category.

`type.d.ts` : types used across the app

`lib/` contains stuff related to drizzle (DB access), paraglide (i18n) that 
we don't use yet.
in `lib/`
* utils.ts : various utility functions
* cache.ts : generic cached maps. we don't use yet the file base cache, and when we will they will be replaced by 
* serverstate.ts : use cache.ts to cache info to avoid hitting wikipedia to hard

+server.ts files will search and cache data :

* api/search : given a query string, use the wikimedia api to get info about pages that match the query
* api/wp : access the pages


sample of answer for a search

```json
{
    "batchcomplete": "",
    "continue": {
        "sroffset": 10,
        "continue": "-||"
    },
    "query": {
        "searchinfo": {
            "totalhits": 1533652
        },
        "search": [
            {
                "ns": 0,
                "title": "W",
                "pageid": 33180,
                "size": 38256,
                "wordcount": 3477,
                "snippet": "<span class=\"searchmatch\">w</span> is used in Indo-European studies ꭩ : Modifier letter small turned <span class=\"searchmatch\">w</span> is used in linguistic transcriptions of Scots <span class=\"searchmatch\">W</span> with diacritics: <span class=\"searchmatch\">Ẃ</span> <span class=\"searchmatch\">ẃ</span> <span class=\"searchmatch\">Ẁ</span> <span class=\"searchmatch\">ẁ</span> <span class=\"searchmatch\">Ŵ</span> <span class=\"searchmatch\">ŵ</span> <span class=\"searchmatch\">Ẅ</span> ẅ",
                "timestamp": "2024-10-29T21:31:08Z"
            }
        }
    }