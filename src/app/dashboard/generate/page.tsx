'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface Recipe {
  id: number;
  title: string;
  description: string;
  created_at: string;
  views: number;
  score?: number;
  user: {
    username: string;
  };
}

export default function GenerateRecipePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi! I'm your AI recipe assistant. Tell me what kind of recipe you're looking for, your dietary preferences, ingredients you have, or any specific requirements!",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // First, create a requirement with the user's message
      const token = localStorage.getItem('token');
      
      const requirementResponse = await fetch('/api/requirement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content: userMessage.content }),
      });

      if (!requirementResponse.ok) {
        throw new Error('Failed to create requirement');
      }

      const requirement = await requirementResponse.json();

      // Add AI thinking message
      const thinkingMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Let me create a recipe based on your requirements... This may take up to 5 minutes for complex recipes.",
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, thinkingMessage]);

      // Generate recipe using the requirement ID
      const recipeResponse = await fetch('/api/recipe/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ requirement_id: requirement.id }),
      });

      if (!recipeResponse.ok) {
        const errorData = await recipeResponse.json().catch(() => ({}));
        
        if (recipeResponse.status === 504) {
          throw new Error('Recipe generation timed out. Please try again with a simpler request.');
        }
        
        throw new Error(errorData.error || 'Failed to generate recipe');
      }

      const recipe = await recipeResponse.json();
      setGeneratedRecipe(recipe);

      // Add success message
      const successMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: `I've created a recipe for you: "${recipe.title}"! Check it out below.`,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => prev.filter(msg => msg.id !== thinkingMessage.id).concat(successMessage));

    } catch (error) {
      console.error('Error generating recipe:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 3).toString(),
        content: error instanceof Error 
          ? `I'm sorry, ${error.message.toLowerCase()}` 
          : "I'm sorry, I encountered an error while generating your recipe. Please try again with a different request.",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => prev.filter(m => !m.content.includes("Let me create")).concat(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-6 px-4">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">AI Recipe Generator</h1>
                <p className="text-gray-600 mt-2">
                  Chat with our AI to create personalized recipes
                </p>
              </div>
              <Link
                href="/dashboard/recipes"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                View All Recipes
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat Interface */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border h-[600px] flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.isUser
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.isUser ? 'text-indigo-200' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="animate-pulse flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                          <span className="text-sm">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="border-t p-4">
                  <div className="flex space-x-2">
                    <textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Describe what kind of recipe you want..."
                      className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      rows={3}
                      disabled={isLoading}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isLoading}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors self-end"
                    >
                      Send
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                </div>
              </div>
            </div>

            {/* Generated Recipe Display */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Generated Recipe
                </h3>
                
                {generatedRecipe ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900">{generatedRecipe.title}</h4>
                      {generatedRecipe.description && (
                        <div className="text-sm text-gray-600 mt-2 whitespace-pre-line">{generatedRecipe.description}</div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>By {generatedRecipe.user.username}</span>
                      {generatedRecipe.score && (
                        <span>★ {generatedRecipe.score.toFixed(1)}</span>
                      )}
                    </div>
                    
                    <div className="pt-4 border-t">
                      <Link
                        href={`/dashboard/recipes/${generatedRecipe.id}`}
                        className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                      >
                        View Full Recipe
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🍳</span>
                    </div>
                    <p className="text-sm">
                      Start a conversation to generate your first recipe!
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Suggestions */}
              <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Suggestions
                </h3>
                <div className="space-y-2">
                  {[
                    "I want a healthy breakfast recipe",
                    "Quick 30-minute dinner ideas",
                    "Vegetarian pasta recipes",
                    "Dessert for a special occasion",
                    "Low-carb meal options"
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setInputValue(suggestion)}
                      className="block w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded border border-gray-200 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
