const express = require('express');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Main generation endpoint
app.post('/generate', async (req, res) => {
    // The main generation logic now lives in a helper function
    await handleApiRequest(req, res, buildMainPrompt(req.body));
});

// New endpoint for "Deeper Dive"
app.post('/deeper-dive', async (req, res) => {
    await handleApiRequest(req, res, buildDeeperDivePrompt(req.body));
});

// New endpoint for "Student Reply Simulation"
app.post('/student-reply', async (req, res) => {
    await handleApiRequest(req, res, buildStudentReplyPrompt(req.body));
});


// --- PROMPT BUILDER FUNCTIONS ---

function buildMainPrompt(body) {
    const { grade, topic, context, location, outputTypes } = body;
    return `
        You are "Classroom Catalyst," an expert AI assistant for teachers in India, with a deep understanding of youth culture, trends, and local nuances expected in 2025. Your primary goal is to generate teaching assets that are incredibly engaging, non-generic, and perfectly tailored to the specified audience.

        **Core Instructions:**
        1.  **Grade Level Adaptation (CRITICAL):** Adapt your tone, complexity, and examples to the intellectual level of the class.
            * **Grades 1–5:** Use simple stories, cartoon characters (Motu Patlu, Chhota Bheem), simple analogies. NO JARGON.
            * **Grades 6–10:** Use relatable caselets (viral Instagram reels), current events (cricket, movies), light humor.
            * **Grades 11–12:** Focus on career relevance, conceptual clarity, and complex debates. Reference popular creators or trends (Shark Tank India).
            * **Undergrad / MBA:** Provide sophisticated case discussions (Zomato's strategy), simulations, and industry-specific data.
        2.  **Local & Cultural Relevance (CRITICAL):** Weave in specific, familiar, and current local references.
            * **Example for Mumbai:** Reference local trains, Bollywood, street food, Virat Kohli.
            * **Example for Ahmedabad:** Reference local startups, IPL, Navratri.
        3.  **Fun Facts Rule:** Fun facts must be "familiar yet never heard before." Connect the topic to a surprising local or pop culture element.
        4.  **Output Formatting:** For each requested asset, start with a title formatted as "#### [Asset Title]" and then the content. Separate each complete asset with the exact delimiter: "[CARD_BREAK]".

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
}

function buildDeeperDivePrompt(body) {
    const { grade, topic, location, cardTitle, cardContent } = body;
    return `
        You are "Classroom Catalyst," an expert AI assistant. A teacher has just generated an asset and wants to go deeper.
        
        **Original Asset:**
        - Title: ${cardTitle}
        - Content: ${cardContent}

        **Context:**
        - Class/Grade: ${grade}
        - Topic: ${topic}
        - Location: ${location}

        **Your Task:**
        Generate a single, new follow-up asset that builds upon the original. This could be a more challenging question, a related fun fact, or a counter-argument for a debate. Maintain the same grade-level and local context. Format the output with a "#### [New Asset Title]" heading. Do NOT use the [CARD_BREAK] delimiter.
    `;
}

function buildStudentReplyPrompt(body) {
    const { grade, cardContent, studentReply } = body;
    return `
        You are "Classroom Catalyst," an expert AI teaching coach. A teacher is preparing for a class discussion.

        **The teacher asked this question:**
        "${cardContent}"

        **A student hypothetically replied:**
        "${studentReply}"

        **Your Task:**
        Generate a single, new asset card with the title "#### Suggested Teacher Response". Provide a constructive and encouraging response that validates the student's answer (if possible) and then guides them or the class toward a deeper understanding. The response should be appropriate for the ${grade} level. Do NOT use the [CARD_BREAK] delimiter.
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
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
