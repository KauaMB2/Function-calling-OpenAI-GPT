// Import necessary libraries
import { OpenAI } from "openai"; // OpenAI API client to interact with the OpenAI model
import dotenv from 'dotenv'; // dotenv to load environment variables (like API keys)
import { ChatCompletionMessageParam } from "openai/resources/chat/completions"; // Type for defining messages used in chat completions
dotenv.config(); // Load environment variables from .env file

// Ensure the OpenAI API key is set in the environment
if (!process.env.OPENAI_API_KEY) throw new Error('OpenAI API key is not set.');
const openaiApiKey: string = process.env.OPENAI_API_KEY; // Store the OpenAI API key from environment variables
const openaiClient = new OpenAI({ apiKey: openaiApiKey }); // Initialize OpenAI client with the API key

// Define the tools (functions) that the model can use
const tools = [{
    type: "function", // The type of tool is a function
    function: {
        name: "getWeather", // Function name
        description: "Get current temperature for provided coordinates in celsius.", // Function description
        parameters: {
            type: "object", // Tool takes an object as input
            properties: {
                latitude: { type: "number" }, // Latitude (in degrees)
                longitude: { type: "number" } // Longitude (in degrees)
            },
            required: ["latitude", "longitude"], // Both latitude and longitude are required for the function to work
            additionalProperties: false // No additional properties are allowed
        },
        strict: true // Enforce strict validation for the parameters
    }
}];

// Define the user message that will be sent to the model
const messages: ChatCompletionMessageParam[] = [
    {
        role: "user", // The role of the message sender (user)
        content: "What's the weather like in Paris today?" // User's query about the weather
    }
];

// Function to fetch weather data from the Open Meteo API using latitude and longitude
async function getWeather(latitude: number, longitude: number) {
    // Fetch data from Open Meteo API for current temperature and other weather data
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`);
    const data = await response.json(); // Parse the JSON response from the API
    return data.current.temperature_2m; // Return the current temperature in Celsius
}

// Function to send the tool to the OpenAI model for processing
const SendingFunctionToGPT = async (tools: any) => {
    // Create a chat completion with the OpenAI model, passing in the messages and tools
    const completion = await openaiClient.chat.completions.create({
        model: "gpt-3.5-turbo", // Use the GPT-3.5 turbo model
        messages, // Include the user message
        tools, // Include the tools (functions) that the model can call
    });
    return completion; // Return the completion response
}

// Function to check if the model called the tool and fetch weather data
const ModelsCreateFunctionCalling = async (completion: OpenAI.Chat.Completions.ChatCompletion & {
    _request_id?: string | null;
}) => {
    // Check if the model's response includes a tool call (e.g., the getWeather function)
    if (completion.choices && completion.choices[0].message && completion.choices[0].message.tool_calls) {
        const toolCall = completion.choices[0].message.tool_calls[0]; // Get the first tool call
        console.log("ToolCall: ", toolCall); // Log the tool call for debugging
        const args = JSON.parse(toolCall.function.arguments); // Parse the tool arguments (latitude and longitude)
        const result = await getWeather(args.latitude, args.longitude); // Call the getWeather function with the parsed arguments
        return result; // Return the result (temperature)
    } else {
        throw new Error("Tool calls not available in completion response"); // Error if no tool call is found
    }
}

// Function to supply the model with the results of the tool call
const SupplyModelWithResults = async (completion: OpenAI.Chat.Completions.ChatCompletion & {
    _request_id?: string | null;
}, result: number, tools: any) => {
    // Check if the model's response includes a tool call
    if (completion.choices && completion.choices[0].message && completion.choices[0].message.tool_calls) {
        const toolCall = completion.choices[0].message.tool_calls[0]; // Get the first tool call
        messages.push(completion.choices[0].message); // Add the model's message to the conversation
        // Add the result of the tool call (weather data) to the conversation
        messages.push({
            role: "tool", // The role is 'tool' to indicate the message comes from a tool
            tool_call_id: toolCall.id, // The tool call ID for reference
            content: result.toString() // The result is the weather data (temperature)
        });

        // Send the updated conversation back to the model for further processing
        const finalCompletion = await openaiClient.chat.completions.create({
            model: "gpt-3.5-turbo", // Use the GPT-3.5 turbo model
            messages, // Include the updated messages
            tools, // Include the tools again (though the model doesn't need them now)
        });
        return finalCompletion; // Return the final response from the model
    } else {
        throw new Error("Tool calls not available in completion response"); // Error if no tool call is found
    }
}

// Main function to execute the whole process
const main = async () => {
    console.log("First step: Sending function to GPT...");
    const completion = await SendingFunctionToGPT(tools); // First step: Send the function (tool) to GPT
    console.log("Second step: Calling the model create function...");
    const response = await ModelsCreateFunctionCalling(completion); // Second step: Get the weather data based on model's decision
    console.log("Weather API Response:", response); // Log the weather data received from the API
    console.log("Third step: Supplying the model with results...");
    const finalCompletion = await SupplyModelWithResults(completion, response, tools); // Third step: Send the weather result back to the model
    console.log("Final response:", finalCompletion.choices[0].message.content); // Log the final response from the model (including the weather data)
}

// Run the main function to start the process
main();
