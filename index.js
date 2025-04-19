import 'dotenv/config';
import cliMd from 'cli-markdown';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import { editor, confirm, input } from '@inquirer/prompts';

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-pro-exp-02-05' });
const fileManager = new GoogleAIFileManager(process.env.API_KEY);

const rackMimes = {
  video: ['mp4', 'mpeg', 'mov', 'avi', 'x-flv', 'mpg', 'webm', 'wmv', '3gpp'],
  image: ['png', 'jpeg', 'webp', 'heic', 'heif'],
  // document: ['pdf'],
  audio: ['wav', 'mp3', 'aiff', 'aac', 'ogg', 'flac'],
};

// Helper: Determine MIME Type
function getMimeType(filePath) {
  const extension = filePath.split('.').pop().toLowerCase();
  for (const [type, extensions] of Object.entries(rackMimes)) {
    if (extensions.includes(extension)) {
      return `${type}/${extension}`;
    }
  }
  return "video/mp4"; // Default fallback
}

// Upload file and handle result
async function uploadFile(filePath) {
  const mimeType = getMimeType(filePath);
  try {
    const uploadResult = await fileManager.uploadFile(filePath, {
      mimeType,
      displayName: filePath.split('/').pop(),
    });
    console.log(`Uploaded file: ${uploadResult.file.displayName} (${uploadResult.file.uri})`);
    return uploadResult.file;
  } catch (error) {
    console.error(`Error uploading file: ${error.message}`);
    return null;
  }
}

// Start a chat session
async function chatSessionHandler() {
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 15000,
    responseMimeType: 'text/plain',
  };

  const history = [];

  const chatSession = model.startChat({
    generationConfig,
    history,
  });

  while (true) {
    const continueChat = await confirm({ message: 'Do you want to continue?' });

    if (!continueChat) {
      console.log('GOOD DAY!!');
      break;
    }

    const question = await editor({ message: 'Enter a description or question:' });
    const parts = [{ text: question }];

    const uploadFileConfirmation = await confirm({ message: 'Do you want to upload a file?' });
    if (uploadFileConfirmation) {
      try {
        const filePath = await input({ message: 'Enter a file path: ' });
        const uploadedFile = await uploadFile(filePath);

        if (uploadedFile) {
          parts.push({
            fileData: {
              mimeType: uploadedFile.mimeType,
              fileUri: uploadedFile.uri,
            },
          });
        }
      } catch (error) {
        console.error('File upload failed:', error.message);
      }
    }

    history.push({ role: 'user', parts });
    // TODO
    // let result = await chat.sendMessageStream("I have 2 dogs in my house.");
    // for await (const chunk of result.stream) {
    //   const chunkText = chunk.text();
    //   process.stdout.write(chunkText);
    // }
    try {
      const result = await chatSession.sendMessage(question);
      const responseText = result.response.text(); // Get the text first

      try {
        // Use the 'default' option to pre-fill the editor
        await editor({
          message: "AI Response (edit or close):", // Add a meaningful message
          default: responseText, // Pass the response text here
        });
        console.log("Editor closed."); // Maybe change the log message
      } catch (err) {
        // Handle potential editor errors (e.g., user cancelling)
        if (err.isTtyError) {
          console.warn("Editor couldn't be opened in this environment.");
          // Fallback: just print the response if editor fails
          console.log(cliMd(responseText));
        } else if (err.message.includes('cancelled')) {
           console.log("Editor cancelled by user.");
        }
         else {
          console.error("Error with editor:", err);
        }
      }

      // You might not need this cliMd log anymore if you show it in the editor
      // console.log(cliMd(responseText));

      history.push({ role: 'model', parts: [{ text: responseText }] });
    } catch (error) {
      console.error('Error generating content:', error.message);
    }
  }
}

// Start the Application
chatSessionHandler();