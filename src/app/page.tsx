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
            Welcome to <span className="text-indigo-600">Spoon AI</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover, create, and manage your favorite recipes with the power of AI. 
            Your personal culinary assistant for endless cooking inspiration.
          </p>
          
          {isAuthenticated ? (
            <div className="space-y-4">
              <p className="text-lg text-gray-700">
                Welcome back, <span className="font-semibold">{user?.username}</span>!
              </p>
              <Link
                href="/dashboard"
                className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <div className="space-x-4">
              <Link
                href="/login"
                className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="inline-block border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="py-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Spoon AI?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-lg shadow-lg">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Recipe Generation</h3>
              <p className="text-gray-600">
                Chat with our AI to create personalized recipes based on your preferences, dietary restrictions, and available ingredients.
              </p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-lg">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Community Recipe Library</h3>
              <p className="text-gray-600">
                Browse and discover recipes created by our community, with ratings and reviews to help you find the perfect dish.
              </p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-lg">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">❤️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Save & Organize</h3>
              <p className="text-gray-600">
                Save your favorite recipes and organize them into collections for easy access whenever you need cooking inspiration.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action Section */}
        {!isAuthenticated && (
          <div className="bg-indigo-600 rounded-2xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
              Join thousands of home cooks who are already using AI to discover amazing recipes. 
              Create your account and start generating personalized recipes today!
            </p>
            <div className="space-x-4">
              <Link
                href="/register"
                className="inline-block bg-white text-indigo-600 font-semibold py-3 px-8 rounded-lg text-lg hover:bg-gray-100 transition-colors"
              >
                Sign Up Free
              </Link>
              <Link
                href="/login"
                className="inline-block border-2 border-white text-white hover:bg-white hover:text-indigo-600 font-semibold py-3 px-8 rounded-lg text-lg transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
