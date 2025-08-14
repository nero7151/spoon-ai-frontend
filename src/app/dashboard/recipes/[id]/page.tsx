'use client';

import { useState, useEffect, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Recipe {
  id: number;
  title: string;
  description: string;
  created_at: string;
  views: number;
  score?: number;
  user: {
    id: number;
    username: string;
  };
  requirement: {
    content: string;
  };
  reviews?: Array<{
    id: number;
    content?: string;
    rating: number;
    created_at: string;
    user: {
      username: string;
    };
  }>;
}

export default function RecipeDetailPage() {
  const params = useParams();
  const recipeId = params?.id as string;
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [newReview, setNewReview] = useState({ content: '', rating: 5 });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const fetchRecipe = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/recipe/${recipeId}`);
      
      if (!response.ok) {
        throw new Error('Recipe not found');
      }

      const data = await response.json();
      setRecipe(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [recipeId]);

  useEffect(() => {
    if (recipeId) {
      fetchRecipe();
    }
  }, [recipeId, fetchRecipe]);

  const handleSaveRecipe = async () => {
    try {
      const token = localStorage.getItem('token');
      // Note: This endpoint may not be implemented yet
      const response = await fetch('/api/saved-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ recipe_id: parseInt(recipeId) }),
      });

      if (response.ok) {
        setIsSaved(true);
      } else {
        console.log('Save recipe endpoint not implemented yet');
      }
    } catch (error) {
      console.error('Error saving recipe:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (!newReview.content.trim()) return;

    try {
      setIsSubmittingReview(true);
      const token = localStorage.getItem('token');
      // Note: This endpoint may not be implemented yet
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipe_id: parseInt(recipeId),
          content: newReview.content,
          rating: newReview.rating,
        }),
      });

      if (response.ok) {
        setNewReview({ content: '', rating: 5 });
        fetchRecipe(); // Refresh to show new review
      } else {
        console.log('Review endpoint not implemented yet');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto py-6 px-4">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !recipe) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto py-6 px-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Recipe Not Found</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Link
                href="/dashboard/recipes"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
              >
                Back to Recipes
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const averageRating = recipe.reviews && recipe.reviews.length > 0 
    ? recipe.reviews.reduce((sum, review) => sum + review.rating, 0) / recipe.reviews.length 
    : 0;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-6 px-4">
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/dashboard/recipes"
              className="text-indigo-600 hover:text-indigo-500 mb-4 inline-flex items-center"
            >
              ← Back to Recipes
            </Link>
            
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{recipe.title}</h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                    <span>By {recipe.user.username}</span>
                    <span>•</span>
                    <span>{recipe.views} views</span>
                    <span>•</span>
                    <span>{new Date(recipe.created_at).toLocaleDateString()}</span>
                    {averageRating > 0 && (
                      <>
                        <span>•</span>
                        <span className="flex items-center">
                          <span className="text-yellow-400 mr-1">★</span>
                          {averageRating.toFixed(1)} ({recipe.reviews?.length || 0} reviews)
                        </span>
                      </>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={handleSaveRecipe}
                  disabled={isSaved}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isSaved 
                      ? 'bg-green-100 text-green-700 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {isSaved ? '✓ Saved' : '♡ Save Recipe'}
                </button>
              </div>
            </div>
          </div>

          {/* Recipe Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              {recipe.description && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">{recipe.description}</div>
                </div>
              )}

              {/* Original Requirement */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Original Request</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 italic">&ldquo;{recipe.requirement.content}&rdquo;</p>
                </div>
              </div>

              {/* Reviews Section */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Reviews ({recipe.reviews?.length || 0})
                </h2>

                {/* Add Review Form */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">Write a Review</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rating
                      </label>
                      <select
                        value={newReview.rating}
                        onChange={(e) => setNewReview(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value={5}>⭐⭐⭐⭐⭐ (5 stars)</option>
                        <option value={4}>⭐⭐⭐⭐ (4 stars)</option>
                        <option value={3}>⭐⭐⭐ (3 stars)</option>
                        <option value={2}>⭐⭐ (2 stars)</option>
                        <option value={1}>⭐ (1 star)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Your Review
                      </label>
                      <textarea
                        value={newReview.content}
                        onChange={(e) => setNewReview(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Share your thoughts about this recipe..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        rows={3}
                      />
                    </div>
                    <button
                      onClick={handleSubmitReview}
                      disabled={!newReview.content.trim() || isSubmittingReview}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                  {!recipe.reviews || recipe.reviews.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No reviews yet. Be the first to review this recipe!
                    </p>
                  ) : (
                    recipe.reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">{review.user.username}</span>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <span
                                  key={i}
                                  className={`text-sm ${
                                    i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                  }`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {review.content && (
                          <p className="text-gray-700">{review.content}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    href="/dashboard/generate"
                    className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Generate Similar Recipe
                  </Link>
                  <Link
                    href="/dashboard/recipes"
                    className="block w-full text-center border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Browse More Recipes
                  </Link>
                </div>
              </div>

              {/* Recipe Stats */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recipe Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Views:</span>
                    <span className="font-medium">{recipe.views}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reviews:</span>
                    <span className="font-medium">{recipe.reviews?.length || 0}</span>
                  </div>
                  {averageRating > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Rating:</span>
                      <span className="font-medium">{averageRating.toFixed(1)} ⭐</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">{new Date(recipe.created_at).toLocaleDateString()}</span>
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
