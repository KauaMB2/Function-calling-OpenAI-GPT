import openai
import os
import requests
import json
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Ensure OpenAI API key is set in the environment
openai_api_key = os.getenv('OPENAI_API_KEY')
if not openai_api_key:
    raise ValueError('OpenAI API key is not set.')

# Set the OpenAI API key for the client
openai.api_key = openai_api_key

# Define the tools (functions) that the model can use
tools = [{
    "name": "get_weather",
    "description": "Get current temperature for provided coordinates in celsius.",
    "parameters": {
        "type": "object",
        "properties": {
            "latitude": {"type": "number"},
            "longitude": {"type": "number"}
        },
        "required": ["latitude", "longitude"]
    }
}]

# Define the user message
messages = [
    {
        "role": "user",
        "content": "What's the weather like in Paris today?"
    }
]

# Function to fetch weather data from Open Meteo API
def get_weather(latitude, longitude):
    response = requests.get(f'https://api.open-meteo.com/v1/forecast?latitude={latitude}&longitude={longitude}&current_weather=true')
    data = response.json()
    return data['current_weather']['temperature']  # Return the current temperature in Celsius

# Function to send the function to OpenAI for processing
def sending_function_to_gpt(tools):
    completion = openai.chat.completions.create(
        model="gpt-3.5-turbo",  # Use the chat model
        messages=messages,
        functions=tools
    )
    return completion

# Function to process tool calls from the model
def models_create_function_calling(completion):
    tool_call = completion.choices[0].message.function_call
    args = json.loads(tool_call.arguments)
    result = get_weather(args["latitude"], args["longitude"])
    return result

# Function to provide the model with the result of the tool call
def supply_model_with_results(completion, result):
    # Convert the result (float) to a string before appending
    result_str = str(result)
    
    # Append the result to the messages as a string
    messages.append(completion.choices[0].message)
    messages.append({
        "role": "user",  # or "assistant", depending on the context
        "content": result_str  # Convert the decimal to string
    })
    
    # Send the updated conversation to the model
    final_completion = openai.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages
    )
    return final_completion

# Main function
def main():
    print("First step: Sending function to GPT...")
    completion = sending_function_to_gpt(tools)
    
    print("Second step: Calling the model create function...")
    # Get the result of the function call (weather data)
    response = models_create_function_calling(completion)
    print("Weather API Response:", response)

    print("Third step: Supplying the model with results...")
    final_completion = supply_model_with_results(completion, response)
    
    print(final_completion.choices[0].message.content)

# Run the main function
if __name__ == "__main__":
    main()
