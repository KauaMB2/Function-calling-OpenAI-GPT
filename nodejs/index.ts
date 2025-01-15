import { OpenAI } from "openai";

const openai = new OpenAI();

const tools = [{
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "Get current temperature for a given location.",
        "parameters": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "City and country e.g. Bogotá, Colombia"
                }
            },
            "required": [
                "location"
            ],
            "additionalProperties": false
        },
        "strict": true
    }
}];

const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: "What is the weather like in Paris today?" }],
    tools,
});

console.log(completion.choices[0].message.tool_calls);