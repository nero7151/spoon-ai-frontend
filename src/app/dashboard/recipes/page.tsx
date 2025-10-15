"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";

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
  _count?: {
    reviews?: number;
  };
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "popular" | "rating">(
    "newest",
  );

  useEffect(() => {
    fetchRecipes();
    fetchSaved();
  }, []);

  const fetchRecipes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/recipe");

      if (!response.ok) {
        throw new Error("Failed to fetch recipes");
      }

      const data = await response.json();
      setRecipes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRecipe = async (recipeId: number) => {
    try {
      const token = localStorage.getItem("token");
      // Note: This endpoint may not be implemented yet
      const response = await fetch("/api/saved-recipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipe_id: recipeId }),
      });

      if (response.ok) {
        const data = await response.json();
        setSavedIds((prev) => {
          const next = new Set(prev);
          if (data.saved) next.add(recipeId);
          else next.delete(recipeId);
          return next;
        });
      } else {
        console.log("Save recipe endpoint not implemented yet");
      }
    } catch (error) {
      console.error("Error saving recipe:", error);
    }
  };

  const fetchSaved = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/saved-recipe", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSavedIds(new Set(data.map((s: any) => s.recipe_id)));
      }
    } catch (err) {
      // ignore
    }
  };

  const filteredAndSortedRecipes = recipes
    .filter(
      (recipe) =>
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.requirement.content
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "popular":
          return b.views - a.views;
        case "rating": {
          // Put rated items first, unrated (no score) after
          const aHas = typeof a.score === "number";
          const bHas = typeof b.score === "number";
          if (aHas && bHas) return (b.score || 0) - (a.score || 0);
          if (aHas && !bHas) return -1;
          if (!aHas && bHas) return 1;
          return 0;
        }
        default:
          return 0;
      }
    });

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto py-6 px-4">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto py-6 px-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Error Loading Recipes
              </h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchRecipes}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 px-4">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  All Recipes
                </h1>
                <p className="text-gray-600 mt-2">
                  Discover and explore recipes from our community
                </p>
              </div>
              <div className="mt-4 sm:mt-0">
                <Link
                  href="/dashboard/generate"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
                >
                  <span className="mr-2">✨</span>
                  Generate Recipe with AI
                </Link>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search recipes, descriptions, or requirements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as "newest" | "popular" | "rating")
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="newest">Newest First</option>
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Recipe Grid */}
          {filteredAndSortedRecipes.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🍽️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Recipes Found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm
                  ? "Try adjusting your search terms or filters."
                  : "Be the first to create a recipe with our AI generator!"}
              </p>
              <Link
                href="/dashboard/generate"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
              >
                <span className="mr-2">✨</span>
                Generate Your First Recipe
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {recipe.title}
                      </h3>
                      <button
                        onClick={() => handleSaveRecipe(recipe.id)}
                        className={`ml-2 transition-colors ${
                          savedIds.has(recipe.id)
                            ? 'text-red-500'
                            : 'text-gray-400 hover:text-red-500'
                        }`}
                        title={savedIds.has(recipe.id) ? 'Unsave' : 'Save recipe'}
                      >
                        {savedIds.has(recipe.id) ? '❤️' : '♡'}
                      </button>
                    </div>

                    {recipe.description && (
                      <div className="text-gray-600 text-sm mb-4 line-clamp-3 whitespace-pre-line">
                        {recipe.description}
                      </div>
                    )}

                    <div className="mb-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Based on requirement:
                      </p>
                      <p className="text-sm text-gray-700 italic line-clamp-2">
                        &ldquo;{recipe.requirement.content}&rdquo;
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>By {recipe.user.username}</span>
                      <div className="flex items-center space-x-3">
                        <span>
                          {recipe.views} views / {recipe._count?.reviews ?? 0}{" "}
                          reviews
                        </span>
                        {typeof recipe.score === "number" && (
                          <span className="flex items-center">
                            <span className="text-yellow-400 mr-1">★</span>
                            {recipe.score.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {new Date(recipe.created_at).toLocaleDateString()}
                      </span>
                      <Link
                        href={`/dashboard/recipes/${recipe.id}`}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                      >
                        View Recipe
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="mt-8 text-center text-gray-500">
            <p>
              Showing {filteredAndSortedRecipes.length} of {recipes.length}{" "}
              recipes
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
