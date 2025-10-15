'use client';

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center py-20">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Spoon AI에 오신 것을 환영합니다
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            AI의 힘으로 좋아하는 레시피를 발견하고, 만들고, 관리하세요.
            개인화된 요리 도우미로 끝없는 요리 영감을 제공합니다.
          </p>
          
          {isAuthenticated ? (
            <div className="space-y-4">
              <p className="text-lg text-gray-700">
                환영합니다, <span className="font-semibold">{user?.username}</span>님!
              </p>
              <Link
                href="/dashboard"
                className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors"
              >
                대시보드로 이동
              </Link>
            </div>
          ) : (
            <div className="space-x-4">
                <Link
                  href="/login"
                  className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors"
                >
                  로그인
                </Link>
                <Link
                  href="/register"
                  className="inline-block border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors"
                >
                  회원가입
                </Link>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="py-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Spoon AI를 선택해야 하는 이유
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-lg shadow-lg">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI 기반 레시피 생성</h3>
              <p className="text-gray-600">
                Chat with our AI to create personalized recipes based on your preferences, dietary restrictions, and available ingredients.
              </p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-lg">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">커뮤니티 레시피 라이브러리</h3>
              <p className="text-gray-600">
                Browse and discover recipes created by our community, with ratings and reviews to help you find the perfect dish.
              </p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-lg">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">❤️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">즐겨찾기 및 정리</h3>
              <p className="text-gray-600">
                Save your favorite recipes and organize them into collections for easy access whenever you need cooking inspiration.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action Section */}
        {!isAuthenticated && (
          <div className="bg-indigo-600 rounded-2xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">시작해 볼까요?</h2>
            <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
              이미 AI로 놀라운 레시피를 발견한 수천 명의 홈쿠커에 합류하세요.
              계정을 생성하고 지금 바로 개인화된 레시피를 만들어 보세요!
            </p>
            <div className="space-x-4">
                <Link
                  href="/register"
                  className="inline-block bg-white text-indigo-600 font-semibold py-3 px-8 rounded-lg text-lg hover:bg-gray-100 transition-colors"
                >
                  무료로 회원가입
                </Link>
                <Link
                  href="/login"
                  className="inline-block border-2 border-white text-white hover:bg-white hover:text-indigo-600 font-semibold py-3 px-8 rounded-lg text-lg transition-colors"
                >
                  로그인
                </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
