import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, RotateCcw, Heart, Zap } from 'lucide-react';
import { gsap } from 'gsap';

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
      content: "I'm here to listen. How are you feeling after letting that out?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // GSAP entrance animation
    if (chatRef.current) {
      gsap.fromTo(chatRef.current,
        { 
          scale: 0.95, 
          opacity: 0,
          y: 20
        },
        { 
          scale: 1, 
          opacity: 1,
          y: 0,
          duration: 0.8, 
          ease: "power2.out"
        }
      );
    }
  }, []);

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

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "That sounds really challenging. It's completely understandable to feel that way.",
        "Thank you for sharing that with me. You're being very brave by talking about this.",
        "Those feelings are valid. Sometimes we just need to acknowledge them and let them exist.",
        "It sounds like you're carrying a lot. Remember, you don't have to carry it all alone.",
        "That must have been difficult to experience. How are you taking care of yourself right now?",
        "I hear you. Sometimes the best thing we can do is just breathe and be present with ourselves.",
        "You've taken a big step by recognizing and expressing these feelings. That takes strength.",
        "Your voice matters. Your feelings are real and important.",
        "Sometimes screaming is exactly what we need. How does it feel to let that out?",
        "You're not alone in feeling this way. Many people struggle with similar emotions."
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
    <div ref={chatRef} className="min-h-screen flex flex-col max-w-3xl mx-auto p-6 scanlines">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center space-x-4">
          <motion.div 
            className="w-12 h-12 bg-gradient-to-r from-neon-pink to-neon-purple rounded-full flex items-center justify-center shadow-neon"
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Heart size={24} className="text-white" />
          </motion.div>
          <div>
            <motion.h2 
              className="text-2xl font-black text-white glow-text"
              animate={{
                textShadow: [
                  "0 0 10px #ff3366",
                  "0 0 20px #9b5de5",
                  "0 0 15px #00ffff",
                  "0 0 10px #ff3366"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              ANONYMOUS SUPPORT
            </motion.h2>
            <p className="text-gray-400 text-sm font-medium">A SAFE SPACE TO TALK</p>
          </div>
        </div>
        
        <motion.button
          onClick={onReset}
          whileHover={{ scale: 1.05, filter: "brightness(1.2)" }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all duration-300 border border-gray-600 hover:border-neon-cyan scream-button"
        >
          <RotateCcw size={18} />
          <span className="font-bold">START OVER</span>
        </motion.button>
      </motion.div>

      {/* Messages */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex-1 overflow-y-auto space-y-6 mb-8"
      >
        {messages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              className={`max-w-xs lg:max-w-md px-6 py-4 rounded-2xl border ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-neon-purple to-neon-pink text-white shadow-neon border-neon-pink/30'
                  : 'bg-dark-card text-gray-300 border-gray-600'
              }`}
            >
              <p className="text-sm leading-relaxed font-medium">{message.content}</p>
              <p className="text-xs opacity-70 mt-2 font-mono">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </motion.div>
          </motion.div>
        ))}

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-dark-card text-gray-300 px-6 py-4 rounded-2xl border border-gray-600">
              <div className="flex space-x-2">
                <motion.div 
                  className="w-3 h-3 bg-neon-cyan rounded-full"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                />
                <motion.div 
                  className="w-3 h-3 bg-neon-purple rounded-full"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div 
                  className="w-3 h-3 bg-neon-pink rounded-full"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                />
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
        className="flex items-center space-x-4"
      >
        <div className="flex-1 relative">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Share what's on your mind..."
            className="w-full bg-dark-card text-white rounded-xl px-6 py-4 pr-16 resize-none focus:outline-none focus:ring-2 focus:ring-neon-pink border border-gray-600 focus:border-neon-pink placeholder-gray-500 font-medium"
            rows={1}
            style={{ minHeight: '56px', maxHeight: '120px' }}
          />
        </div>
        
        <motion.button
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isTyping}
          whileHover={{ scale: 1.05, filter: "brightness(1.2)" }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-neon-purple to-neon-pink hover:from-neon-purple/80 hover:to-neon-pink/80 disabled:from-gray-700 disabled:to-gray-600 disabled:cursor-not-allowed text-white p-4 rounded-xl transition-all duration-300 shadow-neon scream-button"
        >
          <Send size={24} />
        </motion.button>
      </motion.div>

      {/* Disclaimer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-gray-500 text-xs text-center mt-4 font-medium"
      >
        THIS CONVERSATION IS TEMPORARY AND WILL BE CLEARED WHEN YOU LEAVE.
      </motion.p>
    </div>
  );
}