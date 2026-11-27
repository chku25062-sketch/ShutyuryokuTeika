"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getLatestSession } from "@/lib/storage";
import { getFeedbackForScore } from "@/lib/score";
import { TestSessionRecord } from "@/types";

export default function HomePage() {
  const [latestSession, setLatestSession] = useState<TestSessionRecord | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLatestSession(getLatestSession());
  }, []);

  if (!mounted) {
    return (
      <div className="py-12 text-center text-gray-400">
        読み込み中...
      </div>
    );
  }

  const feedback = latestSession ? getFeedbackForScore(latestSession.totalScore) : null;

  return (
    <div className="space-y-6">
      {/* ヒーローカード / 最新ステータス */}
      <section className="bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          現在のコンディション
        </h2>

        {latestSession && feedback ? (
          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-4xl sm:text-5xl font-extrabold text-blue-600 dark:text-blue-400">
                  {latestSession.totalScore}
                </span>
                <span className="text-lg text-gray-500 ml-1">/ 100</span>
              </div>
              <span className="text-xs text-gray-400">
                最終計測: {new Date(latestSession.createdAt).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>

            {/* 集中度ゲージバー */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-3 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  latestSession.totalScore >= 75
                    ? "bg-green-500"
                    : latestSession.totalScore >= 50
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${latestSession.totalScore}%` }}
              />
            </div>

            {/* フィードバックカード */}
            <div className={`p-4 rounded-xl border ${
              feedback.type === "high"
                ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-900 dark:text-green-300"
                : feedback.type === "medium"
                ? "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-300"
                : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-900 dark:text-red-300"
            }`}>
              <div className="font-bold text-base mb-1">{feedback.title}</div>
              <div className="text-sm leading-relaxed">{feedback.actionAdvice}</div>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center space-y-2">
            <p className="text-gray-600 dark:text-gray-300 font-medium">
              まだ集中力の計測記録がありません
            </p>
            <p className="text-xs text-gray-400">
              まずは約15秒の簡易テストを受けて、今の状態をチェックしてみましょう。
            </p>
          </div>
        )}
      </section>

      {/* アクションボタン */}
      <div className="flex flex-col gap-3">
        <Link
          href="/test"
          className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-center shadow transition flex items-center justify-center gap-2 text-lg"
        >
          <span>⚡</span>
          <span>集中力を計測する（簡易テスト）</span>
        </Link>
        <Link
          href="/history"
          className="w-full py-3 px-6 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl text-center transition text-sm"
        >
          過去の履歴を見る
        </Link>
      </div>

      {/* 第9回スライスの説明カード */}
      <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-500 space-y-1">
        <p className="font-semibold text-gray-700 dark:text-gray-300">
          💡 第9回スライス（最小開通版）
        </p>
        <p>
          完全オフラインで動作します。テスト受検〜スコア算出〜ローカル保存（LocalStorage）〜結果表示の一連の流れが開通しています。
        </p>
      </div>
    </div>
  );
}
