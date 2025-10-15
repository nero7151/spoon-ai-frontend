"use client";

import React, { useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../components/Toast";

export default function SettingsPage() {
  const router = useRouter();
  const auth = useAuth();

  const user = auth.user;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const { showToast, ToastContainer } = useToast();

  // Map server error texts to short, user-friendly messages
  const mapServerError = (errMsg: string, action: "save" | "delete") => {
    const s = (errMsg || "").toString().toLowerCase();
    if (
      s.includes("비밀번호") ||
      s.includes("password") ||
      s.includes("현재") ||
      s.includes("incorrect") ||
      s.includes("invalid") ||
      s.includes("mismatch") ||
      s.includes("wrong")
    ) {
      return "현재 비밀번호가 올바르지 않습니다.";
    }
    if (s.includes("unauthorized") || s.includes("401") || s.includes("forbidden") || s.includes("403")) {
      return "권한이 없습니다. 다시 로그인해 주세요.";
    }
    return action === "save" ? "저장에 실패했습니다. 다시 시도해주세요." : "삭제에 실패했습니다. 다시 시도해주세요.";
  };

  const [username, setUsername] = useState(user?.username ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  // Remove ability to change password here; only require currentPassword when changing profile
  const [currentPassword, setCurrentPassword] = useState("");


  // Ensure inputs are pre-filled when user data is available/updated
  useEffect(() => {
    if (!user) {
      setUsername("");
      setEmail("");
      return;
    }

    setUsername(user.username ?? "");
    setEmail(user.email ?? "");
  }, [user]);

  if (!user) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold">사용자 설정</h2>
        <p className="mt-4">로그인이 필요합니다.</p>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsSaving(true);
    setMessage(null);

    // 변경 사항이 있는지 확인
    const nameChanged = username !== (user.username ?? "");
    const emailChanged = email !== (user.email ?? "");
    const hasChanges = nameChanged || emailChanged;

    // 변경이 없으면 요청하지 않음
    if (!hasChanges) {
      setMessage("변경된 항목이 없습니다.");
      setIsSaving(false);
      return;
    }

    // 변경이 있을 경우 현재 비밀번호로 확인하도록 요구
    if (!currentPassword) {
      setMessage("변경을 진행하려면 현재 비밀번호를 입력해주세요.");
      setIsSaving(false);
      return;
    }
    try {
      interface UpdateBody {
        username?: string;
        email?: string;
        currentPassword?: string;
      }

      const body: UpdateBody = { username, email };
      if (currentPassword) body.currentPassword = currentPassword;

      const res = await fetch(`/api/user/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setMessage("저장되었습니다.");
        // refresh user info in context
        if (auth.refreshUser) {
          await auth.refreshUser(token);
        }
        showToast("설정이 저장되었습니다.", "success");
      } else {
        // try to parse JSON { message } else fallback to text
        const contentType = res.headers.get("content-type") || "";
        let errMsg: string;
        if (contentType.includes("application/json")) {
          const json = await res.json();
          errMsg = json?.message ?? JSON.stringify(json);
        } else {
          errMsg = await res.text();
        }
        const friendly = mapServerError(errMsg, "save");
        setMessage(friendly);
        showToast(friendly, "error");
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      const friendly = mapServerError(msg, "save");
      setMessage(friendly);
      showToast(friendly, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!token) return;
    if (!confirm("정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;
    try {
      const res = await fetch(`/api/user/${user.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        // log out and redirect to login
        auth.logout();
        router.push("/login");
      } else {
        const contentType = res.headers.get("content-type") || "";
        let errMsg: string;
        if (contentType.includes("application/json")) {
          const json = await res.json();
          errMsg = json?.message ?? JSON.stringify(json);
        } else {
          errMsg = await res.text();
        }
        const friendly = mapServerError(errMsg, "delete");
        setMessage(friendly);
        showToast(friendly, "error");
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      const friendly = mapServerError(msg, "delete");
      setMessage(friendly);
      showToast(friendly, "error");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <ToastContainer />
      <h2 className="text-2xl font-semibold">사용자 설정</h2>

      <form onSubmit={handleSave} className="mt-6 space-y-4">
        {/* 아이디는 표시하지 않음 (요청에 따라) */}

        <div>
          <label className="block text-sm font-medium">사용자명</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">이메일</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">현재 비밀번호</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="mt-1 block w-full rounded border px-3 py-2"
            placeholder="현재 비밀번호를 입력하세요"
          />
        </div>

        {/* 비밀번호 변경은 이 화면에서 불가능합니다. */}

        {message && <div className="text-sm text-red-600">{message}</div>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60 hover:bg-blue-700 transition"
          >
            저장
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            계정 삭제
          </button>
        </div>
      </form>
    </div>
  );
}
