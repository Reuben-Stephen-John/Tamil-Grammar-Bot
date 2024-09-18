import React, { useState, useEffect } from 'react';
import { Sun, Moon, ChevronDown, Copy } from 'lucide-react';
import { GoogleGenerativeAI,SchemaType  } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GOOGLE_GEMINI_API_KEY);


const App = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState('grammar');
  const [summaryLength, setSummaryLength] = useState(50);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);
  const isTamilText = (text) => {
    const tamilRegex = /^[\u0B80-\u0BFF\s]+$/; // Tamil Unicode range
    return tamilRegex.test(text.trim());
  };

  const handleProcess = async () => {
    setIsLoading(true);
    let prompt;

    if (!isTamilText(inputText)) {
      setIsLoading(false);
      setOutputText('Error: The input is not in Tamil. Please provide Tamil text.');
      return;
    }

    if (mode === 'summarize') {
      prompt = `Summarize the following Tamil passage in clear and concise Tamil, with a length of approximately ${summaryLength}% of the original. Ensure the summary captures the main ideas accurately and excludes any offensive, harmful, or irrelevant content. The text is: ${inputText}`;
    } else {
      prompt = `Correct the grammar of the following Tamil sentence without altering the original meaning or introducing any offensive, harmful, or irrelevant content. Only focus on grammar corrections: ${inputText}`;
    }

    try {
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
  
      
      if (mode === 'grammar') {
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-pro",
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema,
          },
        });
        const result = await model.generateContent(prompt);
        const data = result.response.text(); 
        const jsonData = JSON.parse(data);
        // console.log(result);
        // console.log(data);
        // console.log(jsonData);
        // console.log(jsonData.correctedText);
  
        setOutputText(jsonData.correctedText); // Update UI with the corrected text
        setIsLoading(false);
      } else if (mode === 'summarize') {
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-pro",
          generationConfig: {
            // responseMimeType: "application/json",
            // responseSchema: schema,
          },
        });
        const result = await model.generateContent(prompt);
        const data = result.response.text(); 
        // console.log(result);
        // console.log(data);
        setOutputText(data); // Update UI with the summarized text
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error generating content:", error);
      setOutputText("An error occurred while processing the request.");
      setIsLoading(false);
    }    
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
  };
  
  const Spinner = () => (
    <div className="flex justify-center items-center h-full">
      <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-500"></div>
    </div>
  );

  return (
    <div className={`flex flex-col min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Navbar */}
      <nav className={`p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Tamil Bot</h1>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-100 text-gray-600'} hover:bg-opacity-80 transition-colors duration-200`}
          >
            {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-grow container mx-auto p-6 flex flex-col items-center">
        <div className="w-full max-w-5xl">
          <div className="mb-6 flex justify-between items-center">
            <div className="relative">
              <select
                value={mode}
                onChange={(e) => {
                  setMode(e.target.value);
                  setInputText('');   // Reset the input text
                  setOutputText('');  // Reset the output text
                }}
                className={`appearance-none border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} rounded-md px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="grammar">Grammar Check</option>
                <option value="summarize">Summarize</option>

              </select>
              <ChevronDown size={20} className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500" />
            </div>
            {mode === 'summarize' && (
              <div className="flex items-center space-x-2">
                <span className="text-sm">Summary Length:</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={summaryLength}
                  onChange={(e) => setSummaryLength(e.target.value)}
                  className="w-24"
                />
                <span className="text-sm font-semibold">{summaryLength}%</span>
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Input */}
            <div className="w-full md:w-1/2 space-y-4 p-4 border shadow-lg rounded-md">
              <h2 className="text-xl font-semibold text-blue-600">Input Text</h2>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter or paste your text here"
                className={`w-full h-96 p-4 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                }`}
              />
              <button
                onClick={handleProcess}
                disabled={isLoading}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
              >
                {isLoading ? 'Processing...' : mode === 'summarize' ? 'Summarize' : 'Check Grammar'}
              </button>
            </div>

            {/* Output */}
            <div className="w-full md:w-1/2 space-y-4 p-4 border shadow-lg rounded-md">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-blue-600">
                  {mode === 'summarize' ? 'Summary' : 'Corrected Text'}
                </h2>
                <button
                  onClick={handleCopy}
                  disabled={!outputText}
                  className={`flex items-center space-x-1 text-sm px-3 py-2 rounded-md transition duration-200 ${
                    outputText ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Copy size={16} />
                  <span>Copy</span>
                </button>
              </div>
              <div
                className={`w-full h-96 p-4 border rounded-md overflow-y-auto ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                }`}
              >
                {isLoading ? <Spinner /> : outputText}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md mt-8`}>
        <div className="container mx-auto text-center text-gray-600">
          <p>Made by Team RPA 😉</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
