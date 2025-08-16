document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('asset-form');
    const generateBtn = document.getElementById('generate-btn');
    const loadingSpinner = document.getElementById('loading-spinner');
    const resultsContent = document.getElementById('results-content');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form data
        const grade = document.getElementById('grade').value;
        const topic = document.getElementById('topic').value;
        const context = document.getElementById('context').value;
        const location = document.getElementById('location').value;

        // Show loading state
        resultsContent.innerHTML = '';
        loadingSpinner.classList.remove('hidden');
        generateBtn.disabled = true;
        generateBtn.textContent = 'Generating...';

        try {
            // This is the fetch request to your backend
            const response = await fetch('/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ grade, topic, context, location }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            displayResults(data.assets);

        } catch (error) {
            resultsContent.innerHTML = `<p style="color: red; text-align: center;">Error: ${error.message}</p>`;
            console.error('Error:', error);
        } finally {
            // Hide loading state
            loadingSpinner.classList.add('hidden');
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate Assets';
        }
    });

    function displayResults(text) {
        // Simple parsing to add some structure to the AI's response.
        const formattedText = text
            .replace(/#### (.*?)\n/g, '<h3>$1</h3>')
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/\n- /g, '<ul><li>')
            .replace(/(\n(?!- ))/g, '</p><p>')
            .replace(/<\/li>\n/g, '</li></ul>')
            .replace(/<\/li><\/ul>/g, '</li></ul>');

        let finalHtml = `<p>${formattedText}</p>`
            .replace(/<p><\/p>/g, '')
            .replace(/<p><ul>/g, '<ul>')
            .replace(/<\/ul><\/p>/g, '</ul>');

        resultsContent.innerHTML = finalHtml;
    }
});
