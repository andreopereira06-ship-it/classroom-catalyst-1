const express = require('express');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory store for shared lesson plans (for this example)
const sharedPlans = {};

app.use(cors());
app.use(express.json());

// Main generation endpoint
app.post('/generate', async (req, res) => {
    await handleApiRequest(req, res, buildMainPrompt(req.body));
});

// New endpoint for "Remix"
app.post('/remix', async (req, res) => {
    await handleApiRequest(req, res, buildRemixPrompt(req.body));
});

// New endpoint to save a plan for sharing
app.post('/share', (req, res) => {
    const { plan } = req.body;
    const id = `plan_${Date.now()}`;
    sharedPlans[id] = plan;
    res.json({ shareId: id });
});

// New endpoint to retrieve a shared plan
app.get('/get-shared/:id', (req, res) => {
    const plan = sharedPlans[req.params.id];
    if (plan) {
        res.json({ plan });
    } else {
        res.status(404).json({ error: 'Shared plan not found.' });
    }
});


// --- PROMPT BUILDER FUNCTIONS ---

function buildMainPrompt(body) {
    const { grade, topic, context, location, outputTypes, duration } = body;
    return `
        You are "Classroom Catalyst," an expert AI instructional designer for teachers in India, with a deep understanding of 2025 youth culture. Your task is to create a complete, timed, and engaging lesson plan.

        **Core Instructions:**
        1.  **Structure as a Lesson Plan:** Create a timed agenda based on the ${duration}-minute duration.
        2.  **Grade Level Adaptation (CRITICAL):** Adapt all content to the specified grade level (e.g., simple stories for Grades 1-5, relatable caselets for Grades 6-10, career focus for Grades 11-12, sophisticated discussions for MBA).
        3.  **Local & Cultural Relevance (CRITICAL):** Weave in specific, familiar, and current local references based on the provided location.
        4.  **Resource Hub (NEW):** As the final card, always include a "#### Suggested Resources" card. Provide 2-3 clickable, real, and relevant links (e.g., to YouTube videos, educational websites like PhET, or news articles) that supplement the lesson. Format links as standard markdown: [Link Text](URL).
        5.  **Output Formatting:** Structure the response as a single text block. Start with "#### Lesson Plan: [Topic]". Then, for each segment and asset, use "#### [Title]". Separate each distinct part with the delimiter: "[CARD_BREAK]".

        ---
        **Teacher's Request:**
        - **Class/Grade:** ${grade}
        - **Topic:** ${topic}
        - **Total Class Duration:** ${duration} minutes
        - **Lesson Context:** ${context}
        - **Location for Nuances:** ${location}
        - **Assets to Include:** ${outputTypes.join(', ')}
        ---

        Generate the complete lesson plan now.
    `;
}

function buildRemixPrompt(body) {
    const { grade, topic, location, cardTitle, cardContent } = body;
    return `
        You are "Classroom Catalyst," an expert AI assistant. A teacher wants a different version of an asset they just generated.

        **Original Asset to Remix:**
        - Title: ${cardTitle}
        - Content: ${cardContent}

        **Context:**
        - Class/Grade: ${grade}
        - Topic: ${topic}
        - Location: ${location}

        **Your Task:**
        Generate a single, new, and creatively different version of this asset. It must serve the same purpose (e.g., if it's a Fun Fact, generate a new Fun Fact) but take a completely different angle. Maintain the same grade-level and local context. Format the output with a "#### ${cardTitle}" heading. Do NOT use the [CARD_BREAK] delimiter.
    `;
}


// --- GENERIC API HANDLER ---

async function handleApiRequest(req, res, prompt) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'OPENAI_API_KEY is not configured on the server.' });
    }

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
                temperature: 0.8 // Increased for more creative remixes
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
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
