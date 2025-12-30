import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const AIChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "System Online. I am ARK's digital twin. How can I assist with architecture inquiries?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('THINKING');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    // Add user message immediately
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);
    setLoadingStatus('INITIATING UPLINK...');

    try {
      // Check if API Key exists
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        throw new Error("MISSING_API_KEY");
      }

      const ai = new GoogleGenAI({ apiKey });

      const systemPrompt = `
        You are the AI Digital Twin of 'ARK', a senior backend engineer.
        Tone: Professional, concise, precise (Swiss style).
        Focus: Scalability, Robustness, Efficiency.
        
        Key Info:
        - Expert in Rust, Go, K8s.
        - High-frequency systems specialist.
        
        Keep answers under 60 words.
      `;

      setLoadingStatus('COMPUTING TENSORS...');

      // Add a placeholder message for the model that we will update continuously
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      const streamResult = await ai.models.generateContentStream({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: systemPrompt,
        }
      });

      let fullText = "";

      for await (const chunk of streamResult) {
        const chunkText = chunk.text;
        if (chunkText) {
          fullText += chunkText;
          setLoading(false);

          setMessages(prev => {
            const newArr = [...prev];
            newArr[newArr.length - 1] = { role: 'model', text: fullText };
            return newArr;
          });
        }
      }

    } catch (error: any) {
      console.error("AI Error:", error);
      let errorMessage = "Error: Connection interrupted.";

      if (error.message === "MISSING_API_KEY") {
        errorMessage = "Error: API Key not configured in Vercel Settings.";
      }

      setMessages(prev => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg.role === 'model' && lastMsg.text === '') {
          const newArr = [...prev];
          newArr[newArr.length - 1] = { role: 'model', text: errorMessage };
          return newArr;
        } else {
          return [...prev, { role: 'model', text: errorMessage }];
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        id="ai-chat-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-8 right-8 z-50 p-4 rounded-full shadow-xl transition-all duration-300 hover:scale-105 ${isOpen ? 'bg-black rotate-45' : 'bg-black hover:bg-zinc-800'}`}
      >
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"} />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 md:right-8 w-[90vw] md:w-[380px] h-[500px] bg-white border border-zinc-200 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden animate-fade-in-up font-sans">
          <div className="p-4 border-b border-zinc-100 bg-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-bold text-sm text-black">ARK Assistant</span>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">GEMINI-3-STREAM</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] p-3 text-sm rounded-lg ${msg.role === 'user'
                      ? 'bg-black text-white'
                      : 'bg-white border border-zinc-200 text-zinc-800 shadow-sm'
                    }`}
                >
                  {/* Empty text check for the placeholder */}
                  {msg.text === '' ? (
                    <span className="inline-block w-2 h-4 bg-zinc-300 animate-pulse"></span>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-zinc-200 p-2 px-3 rounded-lg flex items-center gap-2 shadow-sm">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">{loadingStatus}</span>
                  <div className="flex gap-1">
                    <span className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce"></span>
                    <span className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce delay-100"></span>
                    <span className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce delay-200"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-zinc-100 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type command..."
                className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2 text-sm text-black focus:outline-none focus:border-black transition-colors placeholder-zinc-400 font-mono"
              />
              <button
                onClick={handleSend}
                disabled={loading}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50 text-sm font-bold"
              >
                RUN
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};