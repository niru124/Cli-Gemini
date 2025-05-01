# Gemini CLI Chat with File Upload

A simple command-line interface (CLI) application that allows you to have a conversation with Google's Gemini AI model, including the ability to upload files (images, videos, audio) as part of the conversation context.

## Features

*   **Interactive Chat:** Engage in a back-and-forth conversation with the Gemini model.
*   **File Upload:** Upload local files (images, videos, audio) to provide context for your questions or descriptions.
*   **Editor Integration:** Uses your system's default editor (`$EDITOR` environment variable) for entering longer questions or descriptions.
*   **Response Display:** Shows the AI's response within your default editor for easy viewing and potential copying.
*   **Session History:** Maintains the conversation history within a single run of the application.
*   **Configurable:** Uses environment variables for API key management.

## Prerequisites

*   **Node.js:** Version 18 or higher recommended.
*   **npm** or **yarn:** Package manager for Node.js.
*   **Google AI API Key:** You need an API key from Google AI Studio or Google Cloud Console with the Generative Language API enabled.

## Setup

1.  **Clone or Download:** Get the project files onto your local machine.
2.  **Install Dependencies:** Open your terminal in the project directory and run:
    ```bash
    npm install
    # or
    yarn install
    ```
3.  **Configure API Key:**
    *   Create a file named `.env` in the root of the project directory.
    *   Add your Google AI API key to the `.env` file like this:
        ```env
        API_KEY="API_KEY_HERE"
        ```
        Replace `"API_KEY_HERE"` with your actual key. **Do not include the quotes** unless they are part of your key.

## Usage

1.  **Run the Script:** Open your terminal in the project directory and execute:
    ```bash
    node index.js
    ```
2.  **Follow Prompts:**
    *   The application will ask if you want to continue the chat.
    *   It will prompt you to enter a description or question, opening your default text editor. Write your input, save, and close the editor.
    *   It will ask if you want to upload a file.
    *   If you choose to upload, it will ask for the file path.
    *   The application will send your input (and file, if provided) to the Gemini model.
    *   The AI's response will be displayed in your default text editor. Close the editor to continue.
    *   The loop continues until you answer 'n' to the "Do you want to continue?" prompt.

## Dependencies

*   `@google/generative-ai`: Google AI SDK for Node.js.
*   `@inquirer/prompts`: Interactive command-line user prompts.
*   `cli-markdown`: Renders Markdown in the terminal (used for potential fallback display).
*   `dotenv`: Loads environment variables from a `.env` file.

## Notes

*   The specific Gemini model used is `gemini-2.0-pro-exp-02-05`. You can change this in `index.js` if needed.
*   The file upload functionality relies on the MIME type detection based on file extensions defined in the script.
*   Error handling is included for API calls and file uploads.
