import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, User, Sparkles, Shield, Cpu, Flame, CheckCircle2, RotateCcw } from 'lucide-react';

export default function AIChatbot({ user }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const isChairman = user?.is_chairman || user?.username === 'harsha';
  const userName = user?.name || user?.username || 'Analyst';

  useEffect(() => {
    // Initial welcome greeting
    setMessages([
      {
        sender: 'ai',
        text: isChairman 
          ? `👑 **Greetings, Chairman Harsha!**\n\nI am your SHADOW AI Security Intelligence Advisor. I have live access to our ML classification engine, real-time telemetry stream, quarantined firewall rules, and SOC alert queues.\n\nHow can I assist you with executive security oversight today?`
          : `👋 **Hello ${userName}!**\n\nI am your SHADOW AI Security Intelligence Assistant. Ask me anything about current threat levels, ML model inference, suspicious IPs, or SOC response procedures!`
      }
    ]);
  }, [user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (customPrompt) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim()) return;

    const userMsg = { sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          username: userName,
          is_chairman: isChairman
        })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { sender: 'ai', text: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: '⚠️ Apologies, error connecting to the SHADOW AI Intelligence service.' }]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "📊 Current Threat & Event Statistics",
    "🎯 Which IPs are attacking us right now?",
    "🧠 How does the ML Risk Scoring model work?",
    "🚨 Summarize Active Security Alerts",
    "👥 Team & Staff Credentials overview"
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-4 py-2">
      {/* Header */}
      <div className="card-light rounded-2xl p-5 bg-gradient-to-r from-indigo-50/80 via-white to-blue-50/60 border border-indigo-100 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900">
                SHADOW AI Security Intelligence Advisor
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                ONLINE • LIVE DB CONNECTED
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Trained on platform telemetry, Random Forest/XGBoost models, and active firewall directives
            </p>
          </div>
        </div>

        <button
          onClick={() => setMessages(messages.slice(0, 1))}
          className="p-2 text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition shadow-sm"
          title="Reset conversation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Messages Container */}
      <div className="card-light rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col h-[520px]">
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`p-4 rounded-2xl text-xs max-w-2xl leading-relaxed whitespace-pre-wrap ${
                m.sender === 'user'
                  ? 'bg-indigo-600 text-white font-medium shadow-md shadow-indigo-100 rounded-tr-none'
                  : 'bg-slate-50 border border-slate-200 text-slate-800 shadow-sm rounded-tl-none font-sans'
              }`}>
                {m.text}
              </div>

              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                  {userName[0]}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start items-center text-xs text-indigo-600 font-semibold pl-2">
              <div className="w-7 h-7 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center animate-spin">
                <Sparkles className="w-4 h-4" />
              </div>
              <span>SHADOW AI is analyzing live telemetry & generating answer...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Question Chips */}
        <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-bold text-slate-400 shrink-0">Quick Ask:</span>
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold whitespace-nowrap transition shadow-sm active:scale-95"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 rounded-b-2xl"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask anything about threats, statistics, ML models, or SOC actions${isChairman ? ', Chairman Harsha' : ''}...`}
            className="flex-1 bg-slate-50 border border-slate-200 text-xs text-slate-900 px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition shadow-md shadow-indigo-100 flex items-center gap-1.5 shrink-0"
          >
            <Send className="w-4 h-4" /> Send
          </button>
        </form>
      </div>
    </div>
  );
}
