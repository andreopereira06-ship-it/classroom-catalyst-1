{
  "name": "classroom-catalyst-backend",
  "version": "1.0.0",
  "description": "Secure backend for Classroom Catalyst",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "node-fetch": "^2.6.7"
  }
}
```javascript
// File 2: index.js
// This is our secure backend server.

const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies and serve static files from the 'public' directory
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// This is our secure API endpoint. The browser will send requests here.
app.post('/api/generate', async (req, res) => {
    // The API key is retrieved from the secure environment variables, not from the client.
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API key is not configured on the server.' });
    }

    const { classStandard, topic, context, location } = req.body;

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
        const openaiResponse = await fetch('[https://api.openai.com/v1/chat/completions](https://api.openai.com/v1/chat/completions)', {
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

        if (!openaiResponse.ok) {
            const errorData = await openaiResponse.json();
            console.error('OpenAI API Error:', errorData);
            return res.status(openaiResponse.status).json({ error: 'Failed to get a response from OpenAI.' });
        }

        const data = await openaiResponse.json();
        res.json({ completion: data.choices[0].message.content });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
});

// Fallback to serve the main HTML file for any other request
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
