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
      content: '안녕하세요! 저는 레시피 생성 챗봇입니다. 원하는 레시피 종류, 식단 선호, 보유 재료, 또는 특별한 요청 사항을 알려주세요.',
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

  // thinkingMessage 를 try/catch 바깥에서 참조할 수 있도록 선언
  let thinkingMessage: Message | null = null;

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
        throw new Error('요구사항 생성에 실패했습니다.');
      }

      const requirement = await requirementResponse.json();

      // AI 처리 중 메시지 추가 (한국어)
      thinkingMessage = {
        id: (Date.now() + 1).toString(),
        content: '요구사항을 바탕으로 레시피를 생성 중입니다... 복잡한 레시피는 최대 5분 정도 소요될 수 있습니다.',
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, thinkingMessage!]);

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
          throw new Error('레시피 생성 시간이 초과되었습니다. 더 간단한 요청으로 다시 시도해 주세요.');
        }

        throw new Error(errorData.error || '레시피 생성에 실패했습니다.');
      }

      const recipe = await recipeResponse.json();
      setGeneratedRecipe(recipe);

      // 성공 메시지 (한국어)
      const successMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: `레시피를 생성했습니다: "${recipe.title}"! 아래에서 확인하세요.`,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => prev.filter(msg => msg.id !== thinkingMessage?.id).concat(successMessage));

    } catch (error) {
      console.error('Error generating recipe:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 3).toString(),
        content: error instanceof Error
          ? `죄송합니다. ${error.message}`
          : '죄송합니다. 레시피 생성 중 오류가 발생했습니다. 다른 요청으로 다시 시도해주세요.',
        isUser: false,
        timestamp: new Date(),
      };

      // thinkingMessage가 있었으면 제거하고 에러 메시지 추가
      setMessages(prev => prev.filter(m => m.id !== thinkingMessage?.id).concat(errorMessage));
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
                <h1 className="text-3xl font-bold text-gray-900">AI 레시피 생성기</h1>
                <p className="text-gray-600 mt-2">
                  AI와 대화하여 맞춤형 레시피를 만들어보세요
                </p>
              </div>
              <Link
                href="/dashboard/recipes"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                모든 레시피 보기
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
                          <span className="text-sm">AI가 레시피를 생성 중입니다...</span>
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
                      placeholder="원하는 레시피를 설명해보세요 (예: 재료, 시간, 난이도 등)"
                      className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      rows={3}
                      disabled={isLoading}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isLoading}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors self-end"
                    >
                      보내기
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Enter로 전송, Shift+Enter로 줄바꿈
                  </p>
                </div>
              </div>
            </div>

            {/* Generated Recipe Display */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  생성된 레시피
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
                      <span>작성자: {generatedRecipe.user.username}</span>
                      {generatedRecipe.score && (
                        <span>★ {generatedRecipe.score.toFixed(1)}</span>
                      )}
                    </div>
                    
                    <div className="pt-4 border-t">
                      <Link
                        href={`/dashboard/recipes/${generatedRecipe.id}`}
                        className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                      >
                        전체 레시피 보기
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🍳</span>
                    </div>
                    <p className="text-sm">
                      대화를 시작하여 첫 레시피를 생성하세요!
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Suggestions */}
              <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  빠른 제안
                </h3>
                <div className="space-y-2">
                  {[
                    '건강한 아침 식사 레시피를 원해요',
                    '30분 내 완성되는 빠른 저녁 아이디어',
                    '채식 파스타 레시피',
                    '특별한 날을 위한 디저트',
                    '저탄수화물 식단 옵션'
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
