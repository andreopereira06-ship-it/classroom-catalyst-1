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

    const { grade, topic, context, location, outputTypes } = req.body;

    if (!outputTypes || !Array.isArray(outputTypes) || outputTypes.length === 0) {
        return res.status(400).json({ error: 'Please select at least one output type.' });
    }

    const prompt = `
        You are "Classroom Catalyst," an expert AI assistant for teachers in India, with a deep understanding of youth culture, trends, and local nuances expected in 2025. Your primary goal is to generate teaching assets that are incredibly engaging, non-generic, and perfectly tailored to the specified audience.

        **Core Instructions:**
        1.  **Grade Level Adaptation (CRITICAL):** You MUST adapt your tone, complexity, and examples to the intellectual level of the class.
            * **For Grades 1–5:** Use simple stories, cartoon characters (e.g., Motu Patlu, Chhota Bheem), simple analogies related to daily life (e.g., sharing food), and interactive Q&A. Keep language extremely simple. NO JARGON.
            * **For Grades 6–10:** Use relatable caselets (e.g., a viral Instagram reel), current events (e.g., a recent cricket match, a popular movie), light humor, and problem-solving activities. Use a mix of English and common Hinglish phrases if appropriate.
            * **For Grades 11–12:** Focus on career relevance (e.g., how this topic applies to tech or business), conceptual clarity, and more complex debates or quizzes. Reference popular creators or trends on platforms like YouTube or Shark Tank India.
            * **For Undergrad / MBA:** Provide sophisticated case discussions (e.g., Zomato's marketing strategy), simulations, industry-specific data, and challenging cold-calling questions. Assume a high level of understanding.
        2.  **Local & Cultural Relevance (CRITICAL):** When a location is provided, you MUST weave in specific, familiar, and current references. Avoid generic examples.
            * **Example for Mumbai:** Reference local trains, Bollywood gossip, street food like Vada Pav, a comparison to Virat Kohli's performance, or traffic on the Sea Link.
            * **Example for Ahmedabad:** Reference local startups, the business acumen of the city, IPL sponsorships, or Navratri celebrations.
        3.  **Fun Facts Rule:** "Fun facts" must be "familiar yet never heard before." Connect the topic to a surprising local or pop culture element. A generic fact is a failure.
        4.  **Output Formatting:** Structure your entire response as a single block of text. For each requested asset, start with a title formatted as "#### [Asset Title]" and then the content. Separate each complete asset (title + content) with the exact delimiter: "[CARD_BREAK]". Do not use this delimiter anywhere else.

        ---
        **Teacher's Request:**
        - **Class/Grade:** ${grade}
        - **Topic:** ${topic}
        - **Lesson Context:** ${context}
        - **Location for Nuances:** ${location}
        - **Requested Assets:** ${outputTypes.join(', ')}
        ---

        Generate the requested assets now, following all core instructions.
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
