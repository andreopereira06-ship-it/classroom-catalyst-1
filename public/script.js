document.getElementById('generate-btn').addEventListener('click', async () => {
    const classStandard = document.getElementById('class-standard').value;
    const topic = document.getElementById('topic').value;
    const context = document.getElementById('context').value;
    const location = document.getElementById('location').value;

    if (!classStandard || !topic) {
        alert("Please fill in at least the Class and Topic fields.");
        return;
    }

    const loadingDiv = document.getElementById('loading');
    const resultsDiv = document.getElementById('results');
    const outputDiv = document.getElementById('output');

    loadingDiv.classList.remove('hidden');
    resultsDiv.classList.add('hidden');

    // IMPORTANT: Replace "YOUR_API_KEY" with your actual OpenAI API key
    const apiKey = "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";

    const prompt = `
        You are an expert in creating engaging teaching materials. 
        Generate a set of teaching assets for a class.

        Class/Standard: ${classStandard}
        Topic: ${topic}
        Context: ${context}
        Location for cultural nuance: ${location}

        Please generate the following:
        1.  **A "Hook":** A short, interesting question or fact to grab students' attention.
        2.  **Three Discussion Questions:** Open-ended questions to foster classroom conversation.
        3.  **A Fun Activity Idea:** A simple, interactive activity that can be done in the classroom.

        Make the content relatable and fun for the specified class and location.
    `;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        outputDiv.textContent = data.choices[0].message.content;

    } catch (error) {
        console.error("Error:", error);
        outputDiv.textContent = "An error occurred while generating the assets. Please check the console for details.";
    } finally {
        loadingDiv.classList.add('hidden');
        resultsDiv.classList.remove('hidden');
    }
});
