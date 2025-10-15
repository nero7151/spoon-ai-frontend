"use client";

import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [sort, setSort] = useState<string>("newest");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/user/me/recipes", {
          headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });
        if (res.ok) {
          const data = await res.json();
          setRecipes(data || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("정말로 이 레시피를 삭제하시겠습니까?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/recipe/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (res.ok) {
        setRecipes((prev) => prev.filter((r) => r.id !== id));
      } else {
        const text = await res.text();
        alert("삭제 실패: " + text);
      }
    } catch (e) {
      console.error(e);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const sortedRecipes = [...recipes].sort((a, b) => {
    if (sort === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sort === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (sort === "rating") return (b._count?.reviews || 0) - (a._count?.reviews || 0);
    return 0;
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* dotted title box with three action cards inside */}
            <div className="border-4 border-dashed border-gray-200 rounded-lg p-8 text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{user?.username}님의 대시보드에 오신 것을 환영합니다!</h1>
              <p className="text-lg text-gray-600 mb-8">개인 레시피 관리 공간입니다.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">레시피 탐색</h3>
                  <p className="text-gray-600">커뮤니티의 레시피를 둘러보세요</p>
                  <Link href="/dashboard/recipes" className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 inline-block">View All Recipes</Link>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">AI 레시피 생성기</h3>
                  <p className="text-gray-600">AI의 도움으로 개인화된 레시피를 만드세요</p>
                  <Link href="/dashboard/generate" className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 inline-block">Generate Recipe</Link>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">즐겨찾기</h3>
                  <p className="text-gray-600">저장한 레시피를 빠르게 확인하세요</p>
                  <Link href="/dashboard/favorites" className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 inline-block">View Favorites</Link>
                </div>
              </div>
            </div>

            {/* my recipes list */}
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">내가 생성한 레시피</h2>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <label className="mr-2 text-sm">정렬:</label>
                  <select value={sort} onChange={(e) => setSort(e.target.value)} className="border rounded px-2 py-1">
                    <option value="newest">최신순</option>
                    <option value="oldest">등록순</option>
                    <option value="rating">리뷰 수</option>
                  </select>
                </div>
                <div className="text-sm text-gray-600">총 {recipes.length}개</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {loading && <div>로딩 중...</div>}
                {!loading && sortedRecipes.length === 0 && <div className="text-gray-600">생성한 레시피가 없습니다.</div>}
                {!loading && sortedRecipes.map((r) => (
                  <div key={r.id} className="bg-white p-4 rounded shadow">
                    <h3 className="font-semibold">{r.title}</h3>
                    <p className="text-sm text-gray-600">{(r.description || '').length > 200 ? (r.description || '').slice(0, 200) + '...' : r.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-gray-500">{new Date(r.created_at).toLocaleString()}</span>
                      <div>
                        <a href={`/dashboard/recipes/${r.id}`} className="text-indigo-600 mr-3">보기</a>
                        <button onClick={() => handleDelete(r.id)} className="text-red-600">삭제</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
