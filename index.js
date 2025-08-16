const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to serve static files (CSS, JS) from the 'public' directory
app.use(express.static('public'));
// Middleware to parse JSON bodies from incoming requests
app.use(express.json());

// This is the endpoint your front-end calls
app.post('/generate', async (req, res) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'OPENAI_API_KEY is not configured on the server.' });
    }

    // Get the correct fields from the new form
    const { grade, topic, context, location } = req.body;

    // Build a detailed prompt for OpenAI
    const prompt = `
        You are an expert in creating engaging teaching materials.
        Generate a set of teaching assets based on the following criteria:

        Class/Grade: ${grade}
        Topic: ${topic}
        Lesson Context: ${context}
        Location for cultural nuance: ${location}

        Please generate the following, formatted clearly with markdown headings like "#### Heading":
        - A short, interesting "Hook" to grab students' attention.
        - Three open-ended "Discussion Questions" to foster conversation.
        - A simple, interactive "Fun Activity Idea".

        Make the content relatable and fun for the specified class and location.
    `;

    try {
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
        // Send the generated content back to the front-end
        res.json({ assets: data.choices[0].message.content });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
