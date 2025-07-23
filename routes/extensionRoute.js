const auth = require('../middleware/auth');
const express = require('express');
const { OpenAI } = require('openai');

const extensionRoute = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

extensionRoute.post('/', auth, async( req, res ) => {
    const { code } = req.body;
    try {
        if(!code) return res.status(400).json({ error: 'Code is required' });

        const prompt = `Convert the following code into clear, step-by-step pseudocode. The pseudocode should explain the logic in plain English, suitable for someone studying for coding interviews like LeetCode. Do not include any code—just numbered written steps.\n\n${code}`;

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {role: 'system', content: 'You are a coding assistant that generates clear, concise pseudocode.' },
                {role: 'user', content: prompt}
            ],
            max_tokens: 500
        });

        const pseudocode = response.choices[0].message.content.trim();

        res.status(200).json({ pseudocode });
    } catch (error) {
        console.error('Error getting pseudocode', error);
        res.status(500).json({ error: 'Could not generate pseudocode' });
    }
});

module.exports = extensionRoute;