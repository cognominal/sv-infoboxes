<script lang="ts">
    import { writable } from 'svelte/store';
  
    let query = $state('')
    let results = writable([]);
  
    const searchWikipedia = async () => {
      if (!query) return;
  
      try {
        const equery = `/api/search?query=${encodeURIComponent(query)}`
        console.log(equery)
        const response = await fetch(equery);
        if (response.ok) {
          const data = await response.json();
          results.set(data);
        } else {
          console.error('Search error:', await response.json());
          results.set([]);
        }
      } catch (error) {
        console.error('Network error:', error);
        results.set([]);
      }
    };
  </script>
  
  <input
    type="text"
    placeholder="Search Wikipedia"
    bind:value={query}
    oninput={searchWikipedia}
  />
  
  {#if $results.length > 0}
    <div>
      {#each $results as { title, snippet, pageId }}
        <div>
            <h3><a href={`/api/wp?pageId=${pageId}`} target="_blank" rel="noopener">{title}</a></h3>
          <p>{@html snippet}</p>
        </div>
      {/each}
    </div>
  {:else if query}
    <p>No results found.</p>
  {/if}