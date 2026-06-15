document.addEventListener('mouseup', async (event) => {
    // Eğer tıklanan yer eklenti kutusunun içiyse işlem yapma
    if (event.target.closest('#medium-translator-tooltip')) {
        return;
    }

    let selectedText = window.getSelection().toString().trim();
    
    if (selectedText.length > 2) {
        const existingTooltip = document.getElementById('medium-translator-tooltip');
        if (existingTooltip) existingTooltip.remove();

        try {
            // 1. Çeviriyi API'den çek
            const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(selectedText)}&langpair=en|tr`);
            const data = await response.json();
            const translation = data.responseData.translatedText;

            // 2. Hafızayı kontrol et (Modern MV3 Promise yapısı)
            const storage = await chrome.storage.local.get({ savedWords: [] });
            
            // Daha önce eklenmiş mi kontrolü
            const isAlreadySaved = storage.savedWords.some(
                item => item.original.toLowerCase() === selectedText.toLowerCase()
            );

            // 3. Arayüzü oluştur
            const tooltip = document.createElement('div');
            tooltip.id = 'medium-translator-tooltip';

            const textSpan = document.createElement('span');
            textSpan.textContent = translation;
            tooltip.appendChild(textSpan);

            const saveBtn = document.createElement('button');
            saveBtn.id = 'medium-translator-save-btn';

            if (isAlreadySaved) {
                saveBtn.innerHTML = '✅';
                saveBtn.disabled = true;
            } else {
                saveBtn.innerHTML = '⭐';
                saveBtn.addEventListener('click', async () => {
                    await saveToWordBank(selectedText, translation, window.location.href);
                    saveBtn.innerHTML = '✅';
                    saveBtn.disabled = true;
                });
            }

            tooltip.appendChild(saveBtn);
            tooltip.style.left = `${event.pageX + 10}px`;
            tooltip.style.top = `${event.pageY + 15}px`;
            document.body.appendChild(tooltip);

        } catch (error) {
            console.error("Çeviri veya storage hatası:", error);
        }
    }
});

document.addEventListener('mousedown', (e) => {
    const tooltip = document.getElementById('medium-translator-tooltip');
    if (tooltip && !tooltip.contains(e.target)) {
        tooltip.remove();
    }
});

// Kaydetme fonksiyonunu da asenkron yaptık
async function saveToWordBank(original, translation, url) {
    try {
        const result = await chrome.storage.local.get({ savedWords: [] });
        const currentWords = result.savedWords;
        
        currentWords.unshift({
            id: Date.now(), // Benzersiz ID (Timestamp)
            original: original,
            translation: translation,
            url: url,
            date: new Date().toLocaleDateString('tr-TR')
        });

        await chrome.storage.local.set({ savedWords: currentWords });
        console.log("Kelime başarıyla kumbaraya eklendi !");
    } catch (err) {
        console.error("Kumbaraya yazılırken hata oluştu:", err);
    }
}