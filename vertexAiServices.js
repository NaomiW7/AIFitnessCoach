import { VertexAI } from "@google-cloud/vertexai";

// Decode the base64-encoded service key
const credential = JSON.parse(
  Buffer.from(process.env.GOOGLE_SERVICE_KEY ?? "", "base64").toString()
);

// Initialize the Vertex AI client
const vertexAI = new VertexAI({
  project: "linen-team-424400-k8", // Replace with your Google Cloud Project ID
  location: "us-central1",    // Adjust the location if necessary
  googleAuthOptions: {
    credentials: {
      client_email: credential.client_email,
      client_id: credential.client_id,
      private_key: credential.private_key,
    },
  },
});

// Specify the model name
const modelName = "gemini-1.5-pro-002"; // Use the model name from your sample code

// Get the generative model
const generativeModel = vertexAI.preview.getGenerativeModel({ model: modelName });

export const generateText = async (promptInput) => {
	try {
	  const result = await generativeModel.generateContent({
		contents: [
		  {
			role: "user",
			parts: [
			  {
				text: promptInput,
			  },
			],
		  },
		],
	  });
  
	  // Extract the generated text
	  const rawOutput = result.response.candidates?.[0]?.content.parts[0]?.text?.trim();
  
	  // Preprocess the output to remove code fences and extra text
	  const cleanedOutput = preprocessOutput(rawOutput);
  
	  // Parse the cleaned output as JSON
	  return JSON.parse(cleanedOutput);
	} catch (e) {
	  console.error("Error generating text:", e);
	  throw new Error(e.message);
	}
  };
  
  // Helper function to preprocess the output
  const preprocessOutput = (output) => {
	// Remove code fences and any text before or after the JSON array
	let cleanedOutput = output;
  
	// Remove markdown code fences (e.g., ```json and ```)
	cleanedOutput = cleanedOutput.replace(/```json\s*/g, '');
	cleanedOutput = cleanedOutput.replace(/```/g, '');
  
	// Trim whitespace
	cleanedOutput = cleanedOutput.trim();
  
	// Optionally, remove any text before the first '[' and after the last ']'
	const jsonStart = cleanedOutput.indexOf('[');
	const jsonEnd = cleanedOutput.lastIndexOf(']') + 1;
	if (jsonStart !== -1 && jsonEnd !== -1) {
	  cleanedOutput = cleanedOutput.substring(jsonStart, jsonEnd);
	}
  
	return cleanedOutput;
  };
  