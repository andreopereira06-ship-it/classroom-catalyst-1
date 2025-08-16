const express = require('express');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

app.post('/generate', async (req, res) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'OPENAI_API_KEY is not configured on the server.' });
    }

    // Destructure the new `outputTypes` array from the request
    const { grade, topic, context, location, outputTypes } = req.body;

    // Validate that outputTypes is present
    if (!outputTypes || !Array.isArray(outputTypes) || outputTypes.length === 0) {
        return res.status(400).json({ error: 'Please select at least one output type.' });
    }

    // Build the new, dynamic prompt
    const prompt = `
        You are an expert AI assistant for teachers called "Classroom Catalyst". Your goal is to create highly engaging, age-appropriate, and contextually relevant teaching assets.

        **Teacher's Request:**
        - **Class/Grade:** ${grade}
        - **Topic:** ${topic}
        - **Lesson Context:** ${context}
        - **Location for Cultural/Generational Nuances:** ${location}

        **Your Task:**
        Based on the request above, generate the following assets. Ensure all content is tailored to the specified grade and location (e.g., for Grade 1 Mumbai, use simple language and local cartoon characters; for an MBA class, use business caselets). Format the output clearly with markdown using "####" for each asset's title.

        **Requested Assets:**
        - ${outputTypes.join('\n- ')}

        Generate the content now.
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
                temperature: 0.75 // Slightly increased for more creative outputs
            })
        });

        if (!openaiResponse.ok) {
            const errorData = await openaiResponse.json();
            console.error('OpenAI API Error:', errorData);
            return res.status(openaiResponse.status).json({ error: 'Failed to get a response from OpenAI.' });
        }

        const data = await openaiResponse.json();
        res.json({ assets: data.choices[0].message.content });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
