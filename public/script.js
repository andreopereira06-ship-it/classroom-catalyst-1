document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const backBtn = document.getElementById('back-btn');
    
    const formView = document.getElementById('form-view');
    const resultsView = document.getElementById('results-view');
    const loadingDiv = document.getElementById('loading');
    const resultsContent = document.getElementById('results-content');
    const buttonContainer = document.querySelector('.button-container');

    generateBtn.addEventListener('click', async () => {
        const classInput = document.getElementById('class-input').value;
        const topic = document.getElementById('topic').value;
        const context = document.getElementById('context').value;
        const location = document.getElementById('location').value;
        const gradeLevel = document.getElementById('grade-level').value;

        if (!classInput || !topic || !gradeLevel) {
            showMessage("Please fill in Class, Teaching Topic, and Grade.");
            return;
        }

        buttonContainer.classList.add('hidden');
        loadingDiv.classList.remove('hidden');

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    classStandard: classInput, 
                    topic, 
                    context, 
                    location,
                    grade: gradeLevel
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            displayFormattedResults(data.completion);
            
            formView.classList.add('hidden');
            resultsView.classList.remove('hidden');

        } catch (error) {
            console.error("Error:", error);
            showMessage(`Error: ${error.message}`);
        } finally {
            buttonContainer.classList.remove('hidden');
            loadingDiv.classList.add('hidden');
        }
    });

    backBtn.addEventListener('click', () => {
        resultsView.classList.add('hidden');
        formView.classList.remove('hidden');
    });

    function displayFormattedResults(completionText) {
        resultsContent.innerHTML = ''; 
        const sections = completionText.split('####').filter(s => s.trim() !== '');
        sections.forEach(section => {
            const card = document.createElement('div');
            card.className = 'result-card';
            const lines = section.trim().split('\n');
            const titleLine = lines.shift().replace(/[\d.\*]/g, '').trim();
            const content = lines.join('\n').trim();
            const titleElement = document.createElement('h3');
            titleElement.textContent = titleLine;
            card.appendChild(titleElement);

            if (content.includes('- ') || content.includes('1.')) {
                const list = document.createElement('ul');
                const items = content.split(/\n- |\n\d\.\s/).filter(item => item.trim() !== '');
                items.forEach(itemText => {
                    const listItem = document.createElement('li');
                    listItem.textContent = itemText.trim();
                    list.appendChild(listItem);
                });
                card.appendChild(list);
            } else {
                const contentElement = document.createElement('p');
                contentElement.textContent = content;
                card.appendChild(contentElement);
            }
            resultsContent.appendChild(card);
        });
    }

    function showMessage(message) {
        const existingMessage = document.querySelector('.toast-message');
        if (existingMessage) existingMessage.remove();
        const messageContainer = document.createElement('div');
        messageContainer.className = 'toast-message';
        messageContainer.textContent = message;
        document.body.appendChild(messageContainer);
        Object.assign(messageContainer.style, {
            position: 'fixed', bottom: '20px', left: '50%',
            transform: 'translateX(-50%)', padding: '12px 24px',
            backgroundColor: '#EF4444', color: 'white',
            borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: '1000', fontWeight: '500'
        });
        setTimeout(() => messageContainer.remove(), 3000);
    }
});
