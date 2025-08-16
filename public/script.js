document.getElementById('generate-btn').addEventListener('click', async () => {
    const classStandard = document.getElementById('class-standard').value;
    const topic = document.getElementById('topic').value;
    const context = document.getElementById('context').value;
    const location = document.getElementById('location').value;

    if (!classStandard || !topic) {
        showMessage("Please fill in at least the Class and Topic fields.");
        return;
    }

    const loadingDiv = document.getElementById('loading');
    const resultsDiv = document.getElementById('results');
    
    // Clear previous results
    resultsDiv.innerHTML = ''; 

    loadingDiv.classList.remove('hidden');
    resultsDiv.classList.add('hidden');

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                classStandard,
                topic,
                context,
                location
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // New function to parse and display the results beautifully
        displayFormattedResults(data.completion);

    } catch (error) {
        console.error("Error:", error);
        resultsDiv.innerHTML = `<div class="result-card"><p style="color: #e76f51;">An error occurred: ${error.message}. Please check the console for details.</p></div>`;
    } finally {
        loadingDiv.classList.add('hidden');
        resultsDiv.classList.remove('hidden');
    }
});

function displayFormattedResults(completionText) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = ''; // Clear previous results

    // Split the text into sections based on the "####" marker
    const sections = completionText.split('####').filter(s => s.trim() !== '');

    sections.forEach(section => {
        const card = document.createElement('div');
        card.className = 'result-card';

        // Extract the title and content
        const lines = section.trim().split('\n');
        const titleLine = lines.shift().replace(/[\d.\*]/g, '').trim(); // Clean up title
        const content = lines.join('\n').trim();

        const titleElement = document.createElement('h2');
        titleElement.textContent = titleLine;
        card.appendChild(titleElement);

        // Check for list items
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
        
        resultsDiv.appendChild(card);
    });
}


// A simple function to show a message without using alert()
function showMessage(message) {
    // Remove any existing message
    const existingMessage = document.querySelector('.toast-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    const messageContainer = document.createElement('div');
    messageContainer.className = 'toast-message';
    messageContainer.style.position = 'fixed';
    messageContainer.style.bottom = '20px';
    messageContainer.style.left = '50%';
    messageContainer.style.transform = 'translateX(-50%)';
    messageContainer.style.padding = '12px 24px';
    messageContainer.style.backgroundColor = '#F76A8C';
    messageContainer.style.color = 'white';
    messageContainer.style.borderRadius = '8px';
    messageContainer.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    messageContainer.style.zIndex = '1000';
    messageContainer.style.fontWeight = '500';
    messageContainer.textContent = message;
    document.body.appendChild(messageContainer);

    setTimeout(() => {
        messageContainer.remove();
    }, 3000);
}
