document.addEventListener('DOMContentLoaded', async () => {
    const wordList = document.getElementById('word-list');

    try {
        const result = await chrome.storage.local.get({ savedWords: [] });
        const words = result.savedWords;

        if (words.length === 0) {
            wordList.innerHTML = '<li class="empty-msg">Kumbaranız henüz boş. Metin seçip ⭐ butonuna basarak ekleyebilirsin!</li>';
            return;
        }

        words.forEach(item => {
            const li = document.createElement('li');
            li.className = 'word-item';
            li.innerHTML = `
                <div class="word-header">
                    <div class="original">${escapeHtml(item.original)}</div>
                    <button class="show-btn" data-id="${item.id}">Göster</button>
                </div>
                <div class="translation" id="trans-${item.id}">${escapeHtml(item.translation)}</div>
                <div class="meta">
                    <span class="date">${item.date} | <a href="${item.url}" target="_blank">Kaynağa Git</a></span>
                    <button class="delete-btn" data-id="${item.id}">Sil</button>
                </div>
            `;
            wordList.appendChild(li);
        });

        document.querySelectorAll('.show-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const transDiv = document.getElementById(`trans-${id}`);
                
                if (transDiv.style.display === 'block') {
                    transDiv.style.display = 'none';
                    e.target.textContent = 'Göster';
                    e.target.style.backgroundColor = '#03a87c';
                } else {
                    transDiv.style.display = 'block';
                    e.target.textContent = 'Gizle';
                    e.target.style.backgroundColor = '#6b7280';
                }
            });
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const idToDelete = parseInt(e.target.getAttribute('data-id'));
                const targetLi = e.target.closest('.word-item');
                await deleteWord(idToDelete, targetLi);
            });
        });

    } catch (err) {
        console.error("Popup yüklenirken hata:", err);
    }
});

async function deleteWord(id, element) {
    try {
        const result = await chrome.storage.local.get({ savedWords: [] });
        const updatedWords = result.savedWords.filter(item => item.id !== id);
        
        await chrome.storage.local.set({ savedWords: updatedWords });
        
        // Elemanı DOM'dan (ekrandan) kaldır
        element.remove();
        console.log("Kelime hafızadan silindi!");

        if (updatedWords.length === 0) {
            document.getElementById('word-list').innerHTML = '<li class="empty-msg">Kumbaranız boş.</li>';
        }
    } catch (err) {
        console.error("Silme işlemi sırasında storage hatası:", err);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.innerText = text;
    return div.innerHTML;
}