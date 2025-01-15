# Function Calling with OpenAI in Python and Node.js

This repository demonstrates how to implement function calling with OpenAI's language models using both Python and Node.js. Function calling allows the language model to interact with external functions (like fetching weather data) to answer user queries.

## What is Function Calling?

Function calling is a feature where a language model (like OpenAI's GPT-3.5) can invoke external functions based on the user's request. For example, if a user asks about the weather, the model can call a weather API to get the current temperature and return the result in its response.

This setup allows for dynamic and interactive applications, where the model can fetch real-time data or execute code on demand to provide more accurate responses.

---

## Features:
- **Python and Node.js implementations**: Two separate implementations of function calling, one in Python and the other in Node.js.
- **Weather API integration**: Both implementations query an external weather API (Open Meteo) to get the current temperature based on user-specified coordinates.
- **Seamless interaction**: The model dynamically calls the function and supplies the results back to continue the conversation.

---

## How It Works

1. **User Input**: The user asks a question (e.g., "What's the weather like in Paris today?").
2. **Model Determines Function Call**: The OpenAI model identifies that the user's request requires calling an external function (like `get_weather`).
3. **Function Execution**: The model sends the required parameters (e.g., latitude and longitude) to the function.
4. **Fetching Data**: The function (e.g., `get_weather`) fetches data from an external source (like the weather API).
5. **Model Response**: The model uses the result from the function (e.g., the temperature) to complete its response.

## Example:

### Input (User Question):
> "What's the weather like in Paris today?"

### Output (Model Response):
> "The current temperature in Paris is 5.4°C."

---

## Key Concepts

- **Function Call**: A mechanism where the model invokes an external function to get data and use it in the conversation.
- **API Integration**: External data sources (like weather APIs) are queried to provide real-time information to the model.
- **JSON Arguments**: The model sends parameters (like latitude and longitude) in a structured JSON format for the function to process.

Feel free to modify or extend this example for more advanced use cases!
