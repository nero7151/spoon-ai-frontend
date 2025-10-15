"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-800">🥄 Spoon AI</h1>
            </Link>

            {isAuthenticated && (
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-4">
                  <Link
                    href="/dashboard"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    대시보드
                  </Link>
                  <Link
                    href="/dashboard/recipes"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    레시피 목록
                  </Link>
                  <Link
                    href="/dashboard/generate"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    레시피 생성
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div
                  className="relative pb-1"
                  onMouseEnter={() => setIsOpen(true)}
                  onMouseLeave={() => setIsOpen(false)}
                >
                  <span
                    className="text-gray-700 text-sm cursor-pointer select-none"
                    onClick={() => setIsOpen((v) => !v)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setIsOpen(false);
                      if (e.key === "Enter") setIsOpen((v) => !v);
                    }}
                  >
                    {user?.username}님, 환영합니다!
                  </span>

                  {/* Dropdown: visible when isOpen true */}
                  <div
                    className={`absolute right-0 top-full w-48 bg-white border rounded-md shadow-lg transition-opacity z-10 ${
                      isOpen
                        ? "opacity-100 visible pointer-events-auto"
                        : "opacity-0 invisible pointer-events-none"
                    }`}
                  >
                    <div className="p-2">
                      <Link
                        href="/settings"
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                      >
                        사용자 설정
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100 rounded"
                      >
                        로그아웃
                      </button>
                    </div>
                    <div className="px-3 py-2 text-xs text-gray-400 border-t">v1.0.0</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-x-2">
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  로그인
                </Link>
                <Link
                  href="/register"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  회원가입
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
