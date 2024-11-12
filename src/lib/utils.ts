export function extractUrls(pattern: RegExp): string[] {
    // Select all anchor elements on the page
    const links = document.querySelectorAll('a');
    
    // Filter the URLs based on the provided pattern
    const matchingUrls = Array.from(links)
        .map(link => link.getAttribute('href')) // Get href attributes
        .filter(href => href && pattern.test(href)); // Filter by the pattern
    
    return matchingUrls as string[];
}

// Example usage with the pattern for URLs that start with "wiki" and end with ".html"
// const pattern = /^wiki.*\.html$/;
// console.log(extractUrls(pattern));


// import fetch from 'node-fetch';


// Step 1: Get the Wikidata ID from a Wikipedia page URL
export async function getWikidataID(wpPageTitle: string): Promise<string | null> {
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(wpPageTitle)}&prop=pageprops&format=json`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  const pages = data.query.pages;
  const pageID = Object.keys(pages)[0];
  
  return pages[pageID]?.pageprops?.wikibase_item || null;
}

// Step 2: Get the P31 property from Wikidata
export async function getP31Property(wikidataID: string): Promise<string | null> {
  const url = `https://www.wikidata.org/w/api.php?action=wbgetclaims&entity=${wikidataID}&property=P31&format=json`;

  const response = await fetch(url);
  const data = await response.json();

  // Extract the value label from the P31 claims
  const claims = data.claims.P31;
  if (claims && claims.length > 0) {
    const mainClaim = claims[0].mainsnak?.datavalue?.value;
    return mainClaim?.id || null; // returns the ID of the entity type (e.g., Q5 for "human")
  }
  return null;
}

// Main function to get the "instance of" property from a Wikipedia page
export async function getInstanceOf(wpPageTitle: string): Promise<string | null> {
  const wikidataID = await getWikidataID(wpPageTitle);
  if (wikidataID) {
    return await getP31Property(wikidataID);
  }
  return null;
}

// Example usage
getInstanceOf("Albert Einstein").then(instanceOf => {
  console.log("Instance of:", instanceOf); // Should output "Q5" for "human"
});


export async function getLabelFromWikidataID(wikidataID: string, language: string = "en"): Promise<string | null> {
    const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${wikidataID}&format=json&languages=${language}&props=labels`;
    
    const response = await fetch(url);
    const data = await response.json();
  
    return data.entities[wikidataID]?.labels[language]?.value || null;
  }