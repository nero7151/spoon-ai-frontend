"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

export default function PreferencesPage() {
  const auth = useAuth();
  // router not needed
  const user = auth.user;

  const [text, setText] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null);

  useEffect(() => {
    if (!user) return;
    // fetch from backend
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/user/preferences`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setText(data?.preferences ?? "");
        }
      } catch {
        // ignore
      }
    })();
  }, [user]);

  if (!user) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold">사전 요구사항</h2>
        <p className="mt-4">로그인이 필요합니다.</p>
      </div>
    );
  }

  const handleSave = async () => {
    try {
  const token = localStorage.getItem("token");
      const res = await fetch(`/api/user/preferences`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ preferences: text }),
      });
      if (res.ok) {
        const data = await res.json();
        setText(data.preferences ?? "");
        setMessage("저장되었습니다.");
        setMessageType("success");
      } else {
        // try to show server-provided error message
        let errMsg = `저장에 실패했습니다. (${res.status})`;
        try {
          const errBody = await res.json();
          if (errBody && errBody.message) errMsg = errBody.message;
        } catch {
          // ignore JSON parse errors
        }
        const respText = await res.text().catch(() => null);
        console.error('Preferences save failed', res.status, respText);
        setMessage(errMsg);
        setMessageType("error");
      }
    } catch (err) {
      setMessage("저장 중 오류가 발생했습니다. (네트워크 또는 CORS 문제일 수 있습니다)");
      setMessageType("error");
      console.error('Preferences save exception', err);
    }
  };

  const handleClear = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/user/preferences`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ preferences: "" }),
      });
      if (res.ok) {
        setText("");
        setMessage("삭제되었습니다.");
        setMessageType("success");
      } else {
        let errMsg = `삭제에 실패했습니다. (${res.status})`;
        try {
          const errBody = await res.json();
          if (errBody && errBody.message) errMsg = errBody.message;
        } catch {
          // ignore
        }
        const respText2 = await res.text().catch(() => null);
        console.error('Preferences clear failed', res.status, respText2);
        setMessage(errMsg);
        setMessageType("error");
      }
    } catch (err) {
      setMessage("삭제 중 오류가 발생했습니다. (네트워크 또는 CORS 문제일 수 있습니다)");
      setMessageType("error");
      console.error('Preferences clear exception', err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-semibold">사전 요구사항</h2>
      <p className="mt-2 text-sm text-gray-600">여기에 입력한 요구사항은 레시피 생성 시 AI에게 함께 전달됩니다. (레시피 상세의 Original Request에는 표시되지 않습니다.)</p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        className="mt-4 w-full rounded border p-3"
        placeholder="예: 맵지 않게, 유제품 제외, 30분 이내 조리"
      />

      {message && (
        <div className={`mt-2 text-sm ${messageType === "success" ? "text-green-600" : "text-red-600"}`}>
          {message}
        </div>
      )}

      <div className="mt-4 flex gap-3">
        <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">저장</button>
        <button onClick={handleClear} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">삭제</button>
        {/* Back button removed as requested */}
      </div>
    </div>
  );
}
