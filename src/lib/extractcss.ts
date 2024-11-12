function getUniqueCSSRules(element: Element): string[] {
    const matchedRules = new Set<string>();

    function collectRules(element: Element) {
        for (const sheet of Array.from(document.styleSheets)) {
            try {
                for (const rule of Array.from(sheet.cssRules)) {
                    if (rule instanceof CSSStyleRule && element.matches(rule.selectorText)) {
                        matchedRules.add(rule.cssText);
                    }
                }
            } catch (e) {
                console.warn('Could not access rules for a stylesheet:', (sheet as CSSStyleSheet).href);
            }
        }
    }

    function traverse(element: Element) {
        // Collect rules for the current element
        collectRules(element);

        // Traverse child elements
        for (const child of Array.from(element.children)) {
            traverse(child);
        }
    }

    traverse(element);

    // Convert Set to Array to return unique CSS rules
    return Array.from(matchedRules);
}

// Example usage
const rootElement = document.querySelector('#root-element-id'); // Replace with your root element selector
if (rootElement) {
    const cssRules = getUniqueCSSRules(rootElement);
    console.log(cssRules);
}