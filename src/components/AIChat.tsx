import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, RotateCcw, Heart } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatProps {
  onReset: () => void;
}

export default function AIChat({ onReset }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi there. I'm here to listen. How are you feeling after letting that out?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response (replace with actual AI API call)
    setTimeout(() => {
      const responses = [
        "That sounds really challenging. It's completely understandable to feel that way.",
        "Thank you for sharing that with me. You're being very brave by talking about this.",
        "Those feelings are valid. Sometimes we just need to acknowledge them and let them exist.",
        "It sounds like you're carrying a lot. Remember, you don't have to carry it all alone.",
        "That must have been difficult to experience. How are you taking care of yourself right now?",
        "I hear you. Sometimes the best thing we can do is just breathe and be present with ourselves.",
        "You've taken a big step by recognizing and expressing these feelings. That takes strength."
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const aiMessage: Message = {
        role: 'assistant',
        content: randomResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-accent-pink to-primary-purple rounded-full flex items-center justify-center">
            <Heart size={20} className="text-off-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-light-gray">Supportive Chat</h2>
            <p className="text-light-gray/70 text-sm">A safe space to talk</p>
          </div>
        </div>
        
        <button
          onClick={onReset}
          className="flex items-center space-x-2 px-4 py-2 bg-soft-lavender hover:bg-soft-lavender/80 text-light-gray rounded-lg transition-colors"
        >
          <RotateCcw size={16} />
          <span>Start Over</span>
        </button>
      </motion.div>

      {/* Messages */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex-1 overflow-y-auto space-y-4 mb-6"
      >
        {messages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-primary-purple text-off-white'
                  : 'bg-soft-lavender text-light-gray'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-soft-lavender text-light-gray px-4 py-3 rounded-2xl">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-light-gray/60 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-light-gray/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-light-gray/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </motion.div>

      {/* Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex items-center space-x-3"
      >
        <div className="flex-1 relative">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Share what's on your mind..."
            className="w-full bg-soft-lavender text-light-gray rounded-lg px-4 py-3 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-primary-purple placeholder-light-gray/60"
            rows={1}
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
        </div>
        
        <button
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isTyping}
          className="bg-primary-purple hover:bg-primary-purple/80 disabled:bg-soft-lavender disabled:cursor-not-allowed text-off-white p-3 rounded-lg transition-colors"
        >
          <Send size={20} />
        </button>
      </motion.div>

      {/* Disclaimer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-light-gray/60 text-xs text-center mt-4"
      >
        This conversation is not saved and will be cleared when you leave.
      </motion.p>
    </div>
  );
}