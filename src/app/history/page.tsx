"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllSessions, clearAllSessions } from "@/lib/storage";
import { getFeedbackForScore } from "@/lib/score";
import { TestSessionRecord } from "@/types";

export default function HistoryPage() {
  const [sessions, setSessions] = useState<TestSessionRecord[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSessions(getAllSessions());
  }, []);

  const handleClear = () => {
    if (confirm("すべての測定履歴を削除しますか？")) {
      clearAllSessions();
      setSessions([]);
    }
  };

  if (!mounted) {
    return <div className="py-12 text-center text-gray-400">読み込み中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">測定履歴</h1>
          <p className="text-xs text-gray-400">
            端末ローカル（オフライン）に保存された記録一覧
          </p>
        </div>
        {sessions.length > 0 && (
          <button
            onClick={handleClear}
            className="text-xs text-red-500 hover:text-red-700 underline"
          >
            履歴を消去
          </button>
        )}
      </div>

      {sessions.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center space-y-3">
          <p className="text-gray-500">まだ測定履歴がありません。</p>
          <Link
            href="/test"
            className="inline-block py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition"
          >
            テストを受けて記録する
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((item) => {
            const fb = getFeedbackForScore(item.totalScore);
            const dateObj = new Date(item.createdAt);
            const dateStr = dateObj.toLocaleDateString("ja-JP", {
              month: "short",
              day: "numeric",
              weekday: "short",
            });
            const timeStr = dateObj.toLocaleTimeString("ja-JP", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-400">
                      {dateStr} {timeStr}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      平常
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    {fb.title}：{fb.actionAdvice}
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className={`text-2xl font-black ${
                    item.totalScore >= 75
                      ? "text-green-600 dark:text-green-400"
                      : item.totalScore >= 50
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-red-600 dark:text-red-400"
                  }`}>
                    {item.totalScore}
                  </span>
                  <span className="text-xs text-gray-400 ml-0.5">点</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="pt-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          <span>&larr;</span>
          <span>ホームへ戻る</span>
        </Link>
      </div>
    </div>
  );
}
