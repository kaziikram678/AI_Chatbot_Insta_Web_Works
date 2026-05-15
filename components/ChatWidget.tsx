'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';
import { ConversationContext } from '@/lib/intent';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const QUICK_ACTIONS = [
  'Find the Right Extension',
  'Zoho CRM Customization',
  'Get Extension Support',
  'Book a Consultation',
  'Explore Services'
];

const WELCOME_MESSAGES: Message[] = [
  {
    role: 'assistant',
    content: "Hi 👋 I'm the Insta Web Works Assistant. I can help you with Zoho CRM services, automation, integrations, custom widgets, portals, and extensions.",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  },
  {
    role: 'assistant',
    content: "What would you like help with today?",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
];

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<ConversationContext | null>(null);
  const [activeQuickReply, setActiveQuickReply] = useState<string | null>(null);
  const [showGreeting, setShowGreeting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const greetingTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages(WELCOME_MESSAGES);
      setShowGreeting(false);
      if (greetingTimerRef.current) clearTimeout(greetingTimerRef.current);
    }
  }, [isOpen]);

  useEffect(() => {
    greetingTimerRef.current = setTimeout(() => {
      setShowGreeting(true);
    }, 2000);

    return () => {
      if (greetingTimerRef.current) clearTimeout(greetingTimerRef.current);
    };
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage: Message = { role: 'user', content: text, timestamp: now };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setActiveQuickReply(null);
    setShowGreeting(false);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })), context }),
      });

      const data = await res.json();
      if (data.response) {
        const botMsg: Message = { role: 'assistant', content: data.response, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        setMessages(prev => [...prev, botMsg]);
        if (data.context) setContext(data.context);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setMessages(WELCOME_MESSAGES);
    setContext(null);
    setActiveQuickReply(null);
    setInput('');
  };

  const handleQuickReply = (action: string) => {
    setActiveQuickReply(action);
    sendMessage(action);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setShowGreeting(false);
  };

  if (!isOpen) {
    return (
      <>
        {showGreeting && (
          <div className="fixed bottom-24 right-5 z-[999998] animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200 px-4 py-3 max-w-[200px]">
              <p className="text-sm text-gray-700 font-medium">Hi!  Need help with Zoho CRM?</p>
              <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white border-r border-b border-gray-200 rotate-45"></div>
            </div>
          </div>
        )}
        <button
          onClick={handleOpen}
          className="fixed bottom-5 right-5 z-[999999] flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 transition-all duration-200 hover:scale-105 hover:bg-blue-700"
          aria-label="Open chat"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-7 w-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" />
          </svg>
        </button>
      </>
    );
  }

  const showQuickReplies = messages.length <= 2 && !isLoading;

  return (
    <div className={`fixed bottom-5 right-5 z-[999999] flex flex-col rounded-3xl border border-gray-200 bg-white shadow-2xl overflow-hidden transition-all duration-300 ${
      isExpanded 
        ? 'w-[720px] max-w-[calc(100vw-2.5rem)] h-[760px] max-h-[calc(100vh-3rem)]' 
        : 'w-[420px] max-w-[calc(100vw-2.5rem)] h-[620px] max-h-[calc(100vh-3rem)]'
    }`}>
      <div className="flex items-center justify-between bg-white px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">Insta Web Works Assistant</h3>
            <p className="text-xs text-green-500 font-medium">● Online</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleRefresh} title="Refresh conversation" className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-.001 4.992H3.983m12.04-12.04h4.992m0 0v4.992m0 0h-4.992M7.977 4.356H2.985m0 0v4.992m0 0H7.977" />
            </svg>
          </button>
          <button onClick={() => setIsExpanded(!isExpanded)} title={isExpanded ? "Minimize" : "Expand"} className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition">
            {isExpanded ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5M15 15l5.25 5.25" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
              </svg>
            )}
          </button>
          <button onClick={() => setIsOpen(false)} title="Close" className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white p-4 space-y-1">
        {messages.length > 2 && (
          <div className="flex items-center justify-center py-2">
            <div className="h-px flex-1 bg-gray-200"></div>
            <span className="px-3 text-[10px] font-medium text-gray-400 uppercase tracking-wider">Today</span>
            <div className="h-px flex-1 bg-gray-200"></div>
          </div>
        )}
        {messages.map((msg, i) => (
          <MessageBubble key={i} role={msg.role} content={msg.content} timestamp={msg.timestamp} />
        ))}
        {isLoading && <MessageBubble role="assistant" content="..." isLoading />}
        <div ref={messagesEndRef} />
      </div>

      {showQuickReplies && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2 font-medium">Quick replies</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_ACTIONS.map(action => (
              <button
                key={action}
                onClick={() => handleQuickReply(action)}
                className={`text-xs px-3 py-1.5 rounded-full transition border ${
                  activeQuickReply === action
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300'
                }`}
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex border-t border-gray-100 p-3 bg-white">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="ml-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </form>

      <div className="flex items-center justify-center py-2 bg-gray-50 border-t border-gray-100">
        <span className="text-[10px] text-gray-400">Powered by Insta Web Works</span>
      </div>
    </div>
  );
}
