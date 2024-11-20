import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GOOGLE_GEMINI_API_KEY);

export const processText = async (inputText, mode, summaryLength = 1) => {
  let prompt;
  const percentageOptions = [10, 30, 70];
  const selectedPercentage = percentageOptions[summaryLength];

  if (mode === 'summarize') {
    prompt = `Summarize the following Tamil passage in clear and concise Tamil, with a length of approximately ${selectedPercentage}% of the original passage. Ensure the summary captures the main ideas accurately and excludes any offensive, harmful, or irrelevant content. The text is: ${inputText}`;
  } else {
    prompt = `Correct the grammar of the following Tamil sentence without altering the original meaning or introducing any offensive, harmful, or irrelevant content. Only focus on grammar corrections: ${inputText}`;
  }

  const schema = {
    type: SchemaType.OBJECT,
    properties: {
      correctedText: {
        type: SchemaType.STRING,
        description: "The grammatically corrected Tamil sentence.",
        nullable: true,
      },
      summarizedText: {
        type: SchemaType.STRING,
        description: "The summarized Tamil text, if summarization mode is chosen.",
        nullable: true,
      },
    },
  };

  try {
    let model;
    let result;
    
    switch (mode) {
      case 'grammar':
        model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema,
          },
        });
        result = await model.generateContent(prompt);
        return JSON.parse(result.response.text()).correctedText;

      case 'grammar-a':
        model = genAI.getGenerativeModel({
          model: "gemini-1.5-pro",
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema,
          },
        });
        result = await model.generateContent(prompt);
        return JSON.parse(result.response.text()).correctedText;

      case 'summarize':
        model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
        });
        result = await model.generateContent(prompt);
        return result.response.text();

      default:
        throw new Error('Invalid mode');
    }
  } catch (error) {
    console.error("Error generating content:", error);
    throw error;
  }
};