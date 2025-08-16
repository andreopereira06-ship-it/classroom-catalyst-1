document.getElementById('generate-btn').addEventListener('click', async () => {
    const classStandard = document.getElementById('class-standard').value;
    const topic = document.getElementById('topic').value;
    const context = document.getElementById('context').value;
    const location = document.getElementById('location').value;

    if (!classStandard || !topic) {
        // Using a custom message box instead of alert()
        showMessage("Please fill in at least the Class and Topic fields.");
        return;
    }

    const loadingDiv = document.getElementById('loading');
    const resultsDiv = document.getElementById('results');
    const outputDiv = document.getElementById('output');

    loadingDiv.classList.remove('hidden');
    resultsDiv.classList.add('hidden');

    try {
        // This is the most important part.
        // This fetch call should point to '/api/generate' to contact YOUR backend.
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
        // The backend sends the generated content in a 'completion' property.
        outputDiv.textContent = data.completion;

    } catch (error) {
        console.error("Error:", error);
        outputDiv.textContent = `An error occurred: ${error.message}. Please check the console for details.`;
    } finally {
        loadingDiv.classList.add('hidden');
        resultsDiv.classList.remove('hidden');
    }
});

// A simple function to show a message without using alert()
function showMessage(message) {
    const messageContainer = document.createElement('div');
    messageContainer.style.position = 'fixed';
    messageContainer.style.top = '20px';
    messageContainer.style.left = '50%';
    messageContainer.style.transform = 'translateX(-50%)';
    messageContainer.style.padding = '10px 20px';
    messageContainer.style.backgroundColor = '#f4a261';
    messageContainer.style.color = 'white';
    messageContainer.style.borderRadius = '5px';
    messageContainer.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
    messageContainer.style.zIndex = '1000';
    messageContainer.textContent = message;
    document.body.appendChild(messageContainer);

    setTimeout(() => {
        document.body.removeChild(messageContainer);
    }, 3000);
}
