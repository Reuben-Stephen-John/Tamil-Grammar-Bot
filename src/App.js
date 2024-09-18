import React, { useState, useEffect } from 'react';
import { Sun, Moon, ChevronDown, Copy } from 'lucide-react';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import Typewriter  from './typeanime';

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GOOGLE_GEMINI_API_KEY);

const App = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState('grammar');
  const [summaryLength, setSummaryLength] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [exampleIndex, setExampleIndex] = useState(0);

  useEffect(() => {
    document.body.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const isTamilText = (text) => {
    const tamilRegex = /^[\u0B80-\u0BFF\s.,?!]+$/;
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

    // Map slider value to percentage
    const percentageOptions = [10, 30, 70];
    const selectedPercentage = percentageOptions[summaryLength];
    if (mode === 'summarize') {
      prompt = `Summarize the following Tamil passage in clear and concise Tamil, with a length of approximately ${selectedPercentage}% of the original passage. Ensure the summary captures the main ideas accurately and excludes any offensive, harmful, or irrelevant content. The text is: ${inputText}`;
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
          model: "gemini-1.5-flash",
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema,
          },
        });
        const result = await model.generateContent(prompt);
        const data = result.response.text(); 
        const jsonData = JSON.parse(data);

        setOutputText(jsonData.correctedText); // Update UI with the corrected text
        setIsLoading(false);
      } else if (mode === 'summarize') {
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          generationConfig: {
            // responseMimeType: "application/json",
            // responseSchema: schema,
          },
        });
        const result = await model.generateContent(prompt);
        const data = result.response.text(); 

        setOutputText(data); // Update UI with the summarized text
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error generating content:", error);
      setOutputText("An error occurred while processing the request.");
      setIsLoading(false);
    }    
  };

  const handleReset = () => {
    setInputText(''); // Clear input text
    setOutputText(''); // Clear output text (if you have an output state)
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
  };

  const handleExamples = () => {
    const grammarExamples = [
      'எனக்கு மிகவும் சந்தோஷமாக இருக்கிறது. நான் புத்தகங்களை படிக்கிறேன்.', 
      'நான் இந்த மாதிரியான செய்திகள நம்பவில்லை.', 
      'உங்களுக்கு எப்படி இருக்கிறீர்கள்? நான் நல்லா இருக்கிறேன்.',
      'அவர் கேட்டனான்.',
      'அவள் படிக்கிறான்',
    ];

    const summarizeExamples = [
      'தமிழகத்தின் வரலாற்று செழுமை மிகுந்த காலகட்டங்களில் இருந்து, பெரும்பாலான பழங்கால தமிழ் நாட்டு மக்களின் வாழ்க்கை, நாகரிகம், கலாசாரம், மற்றும் அவர்களின் கலைப்பண்புகள் நம்மை நவீன உலகின் வண்ணங்களுடன் இணைக்கின்றன. சோழர், சேட்டியர், பாண்டியர், மற்றும் கல்லரைக்குள் வாழ்ந்த தமிழ் மக்களின் உயரிய மரபுகளும், ஆன்மீக பக்கங்களும், வரலாற்றுப் பரந்த பரப்புகளை எடுத்துக்காட்டுகின்றன. தமிழகத்தின் மரபின் இச்செழுமை, தற்போது நம்முடைய உயிர்த்தொகுப்புகளுக்கு நமக்குத் தேவையான செல்வாக்கையும், சிறந்த கல்வியையும் வழங்குகிறது. இந்நிலையில், பழங்காலச் சாகசங்கள், தலமைகள், கலைகளும், வணிகப் பரிமாற்றங்களும் தமிழகத்தின் உலகளாவிய அளவிலான அடையாளமாக திகழ்கின்றன.',
      'இந்து தத்துவத்தின் அடிப்படையைப் புரிந்து கொள்ளும் போது, வாழ்க்கையின் பல்வேறு பரிமாணங்கள் தொடர்புடையவையாக உள்ளன என்பதை புரிந்து கொள்ளலாம். இந்த தத்துவத்தில், ஆன்மிகம் மற்றும் materialism ஆகியவற்றின் மையமாக நிற்கும் அர்த்தங்களை நம் வாழ்க்கையில் ஒரு பொருத்தமான மற்றும் அமைதியான நிலையை உருவாக்குவதற்கு உதவுகின்றன. உலகின் அனைத்து கலாச்சாரங்களும் வாழ்க்கையின் மிக முக்கியமான அம்சங்களை முன்னணி இடத்தில் வைத்திருக்கின்றன. இந்த அடிப்படையில், வாழ்க்கை என்னும் பயணத்தின் எல்லா தரப்புகளிலும் சுயவிவரத்தை மேம்படுத்துவதற்கும், தன்னம்பிக்கையுடன் மாறும் உலகத்திற்கும் தயாராக இருக்க உதவுகிறது. இதன் மூலம், நம் வாழ்க்கை உயர் அடிப்படையில் இருக்கும் என்பது தெளிவாக நம்பக்கூடியது.',
      'தற்காலிக வளர்ச்சியின் மூலம், உலகம் இன்று மாறுபட்ட கால நிலைகளை அனுபவிக்கிறது. தொழில்நுட்ப முன்னேற்றம் மற்றும் அறிவியல் கண்டுபிடிப்புகள், மனிதனின் அடுத்தடுத்த செழிப்புகளை உருவாக்குவதாக அமைந்துள்ளன. புதிய கண்டுபிடிப்புகள், இதற்கான பல்வேறு செயல்முறைகள், மற்றும் மனிதன் வாழ்க்கையின் முன்னேற்றத்தை எவ்வாறு அடையலாம் என்பதற்கான வழிமுறைகள் ஆகியவை, ஒரு புதிய கோணத்தில் பொருந்துகின்றன. இதனாலேயே, உலகம் மாறும் போது, அதனை முழுமையாக அணுகுவதற்கும், அது எப்படி செயல்படுகிறதோ அதை புரிந்துகொள்ளுவதற்கும் உதவுகின்றன. இது, தற்காலிகப் பரிமாணங்களை அடையாளம் காண வேண்டிய அவசியத்தை உணர்த்துகிறது.'
    ];

    if (mode === 'grammar') {
      setInputText(grammarExamples[exampleIndex]);
    } else if (mode === 'summarize') {
      setInputText(summarizeExamples[exampleIndex]);
    }
    setOutputText('');
    setExampleIndex((prevIndex) => (prevIndex + 1) % (mode === 'grammar' ? grammarExamples.length : summarizeExamples.length));
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
          <h1 className="text-2xl font-bold text-blue-600">தமிழ் Bot</h1>
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
        <div className="mb-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <div className="relative md:w-auto">
          <select
            value={mode}
            onChange={(e) => {
              setMode(e.target.value);
              setInputText('');   // Reset the input text
              setOutputText('');  // Reset the output text
            }}
            className={`appearance-none border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blu-800'} rounded-md px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="grammar">Grammar Check</option>
            <option value="summarize">Summarize</option>
          </select>
          <ChevronDown size={20} className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500" />
        </div>
        
        {mode === 'summarize' && (
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-2">
            <span className="text-sm">Summary Length:</span>
            <input
              type="range"
              min="0"
              max="2"
              step="1"
              value={summaryLength}
              onChange={(e) => setSummaryLength(e.target.value)}
              className="w-full md:w-24"
            />
            <span className="text-sm font-semibold">{['Short', 'Medium', 'Long'][summaryLength]}</span>
          </div>
        )}
        
        <button
          onClick={handleExamples}
          className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition duration-200"
        >
          Examples
        </button>
      </div>



          <div className="flex flex-col md:flex-row gap-6">
            {/* Input */}
            <div className={`w-full md:w-1/2 space-y-4 p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-800'} shadow-lg rounded-md`}>
              <h2 className="text-xl font-semibold text-blue-600">Input Text</h2>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter or paste your text here..."
                className={`w-full h-96 p-4 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`}
              />
              <div className="flex justify-between">
                <button
                  onClick={handleReset}
                  disabled={!inputText}
                  className={`bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition duration-200 ${!inputText ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  Reset
                </button>
                <button
                  onClick={handleProcess}
                  disabled={isLoading || !inputText}
                  className={`w-auto ${inputText ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-400 text-gray-500 cursor-not-allowed'} text-white py-2 px-4 rounded-md transition duration-200`}
                >
                  {isLoading ? 'Processing...' : mode === 'summarize' ? 'Summarize' : 'Check Grammar'}
                </button>
              </div>
            </div>

            {/* Output */}
            <div className={`w-full md:w-1/2 space-y-4 p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-800'} shadow-lg rounded-md`}>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-blue-600">
                  {mode === 'summarize' ? 'Summary' : 'Corrected Text'}
                </h2>
                <button
                  onClick={handleCopy}
                  disabled={!outputText}
                  className={`flex items-center space-x-1 text-sm px-3 py-2 rounded-md transition duration-200 ${outputText ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                >
                  <Copy size={16} />
                  <span>Copy</span>
                </button>
              </div>
              <div className={`w-full h-96 p-4 border rounded-md overflow-y-auto ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`}>
                {isLoading ? <Spinner /> : <Typewriter text={outputText} delay={20} />}
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
