'use client';

import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Welcome to your Dashboard, {user?.username}!
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  This is your personal recipe management space.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Browse Recipes</h3>
                    <p className="text-gray-600">Explore recipes from our community</p>
                    <Link
                      href="/dashboard/recipes"
                      className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 inline-block"
                    >
                      View All Recipes
                    </Link>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Recipe Generator</h3>
                    <p className="text-gray-600">Create personalized recipes with AI assistance</p>
                    <Link
                      href="/dashboard/generate"
                      className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 inline-block"
                    >
                      Generate Recipe
                    </Link>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Favorites</h3>
                    <p className="text-gray-600">Quick access to your saved recipes</p>
                    <button className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                      View Favorites
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
