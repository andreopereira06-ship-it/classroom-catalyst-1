const express = require('express');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/generate', async (req, res) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'OPENAI_API_KEY is not configured on the server.' });
    }

    const { grade, topic, context, location, outputTypes, duration } = req.body;

    if (!outputTypes || !Array.isArray(outputTypes) || outputTypes.length === 0) {
        return res.status(400).json({ error: 'Please select at least one output type.' });
    }
    if (!duration) {
        return res.status(400).json({ error: 'Please provide a class duration.' });
    }

    const prompt = `
        You are "Classroom Catalyst," an expert AI instructional designer for teachers in India, with a deep understanding of 2025 youth culture. Your task is to create a complete, timed, and engaging lesson plan.

        **Core Instructions:**

        1.  **Structure as a Lesson Plan:** Create a timed agenda based on the ${duration}-minute duration.
        2.  **Grade Level Adaptation (CRITICAL):** Adapt all content to the specified grade level (e.g., simple stories for Grades 1-5, relatable caselets for Grades 6-10, career focus for Grades 11-12, sophisticated discussions for MBA).
        3.  **Local & Cultural Relevance (CRITICAL):** Weave in specific, familiar, and current local references based on the provided location.
        4.  **Resource Hub (CRITICAL):** As the final card, always include a "#### Suggested Resources" card. You MUST use a search tool to find 2-3 currently working, high-quality, and relevant links (e.g., to YouTube videos, educational websites like PhET, or news articles) that supplement the lesson. **You MUST format links as standard markdown: [Link Text](URL).**
        5.  **Output Formatting:** Structure the entire response as a single block of text. For each requested asset, start with a title formatted as "#### [Asset Title]". **Do not use bold asterisks (**) in the titles or content.** Separate each distinct part with the delimiter: "[CARD_BREAK]".

        ---
        **Teacher's Request:**
        - **Class/Grade:** ${grade}
        - **Topic:** ${topic}
        - **Total Class Duration:** ${duration} minutes
        - **Lesson Context:** ${context}
        - **Location for Nuances:** ${location}
        - **Assets to Include:** ${outputTypes.join(', ')}
        ---

        Generate the complete, timed lesson plan now.
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
                temperature: 0.75
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
