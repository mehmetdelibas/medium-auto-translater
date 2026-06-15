let hoverTimeout;

document.addEventListener('mousemove', (event) => {
    clearTimeout(hoverTimeout);
    
    const existingTooltip = document.getElementById('medium-translator-tooltip');
    if (existingTooltip) existingTooltip.remove();

    hoverTimeout = setTimeout(() => {
        let range;
        
        if (document.caretRangeFromPoint) {
            range = document.caretRangeFromPoint(event.clientX, event.clientY);
        }

        if (range && range.startContainer.nodeType === Node.TEXT_NODE) {
            const textNode = range.startContainer;
            const offset = range.startOffset;
            const text = textNode.textContent;

            let start = offset;
            while (start > 0 && /\w/.test(text[start - 1])) {
                start--;
            }
            let end = offset;
            while (end < text.length && /\w/.test(text[end])) {
                end++;
            }

            const word = text.slice(start, end).trim();

            if (word.length > 1 && /^[a-zA-Z]+$/.test(word)) {
                fetchTranslation(word, event.pageX, event.pageY);
            }
        }
    }, 400);
});

async function fetchTranslation(word, x, y) {
    try {
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${word}&langpair=en|tr`);
        const data = await response.json();
        const translation = data.responseData.translatedText;

        const tooltip = document.createElement('div');
        tooltip.id = 'medium-translator-tooltip';
        tooltip.textContent = translation;
        
        tooltip.style.left = `${x + 10}px`;
        tooltip.style.top = `${y + 15}px`;

        document.body.appendChild(tooltip);
    } catch (error) {
        console.error("Çeviri alınamadı:", error);
    }
}