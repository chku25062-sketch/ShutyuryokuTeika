"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { saveSession } from "@/lib/storage";
import { calculatePerformanceScore, getFeedbackForScore } from "@/lib/score";
import { FeedbackMessage } from "@/types";

interface Question {
  text: string;
  answer: number;
  options: number[];
}

function generateQuestions(): Question[] {
  const list: Question[] = [];
  for (let i = 0; i < 5; i++) {
    const a = Math.floor(Math.random() * 8) + 2; // 2〜9
    const b = Math.floor(Math.random() * 8) + 2; // 2〜9
    const answer = a + b;

    const wrongOptions = new Set<number>();
    while (wrongOptions.size < 3) {
      const offset = (Math.floor(Math.random() * 5) + 1) * (Math.random() > 0.5 ? 1 : -1);
      const val = answer + offset;
      if (val > 0 && val !== answer) {
        wrongOptions.add(val);
      }
    }

    const options = [answer, ...Array.from(wrongOptions)].sort(() => Math.random() - 0.5);
    list.push({ text: `${a} + ${b} = ?`, answer, options });
  }
  return list;
}

export default function TestPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [responseTimes, setResponseTimes] = useState<number[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [finalScore, setFinalScore] = useState<number>(0);
  const [avgTime, setAvgTime] = useState<number>(0);
  const [accuracyRate, setAccuracyRate] = useState<number>(0);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);

  useEffect(() => {
    setQuestions(generateQuestions());
    setQuestionStartTime(Date.now());
  }, []);

  const handleAnswer = (selectedOption: number) => {
    const timeTakenSec = Math.max(0.1, (Date.now() - questionStartTime) / 1000);
    const updatedTimes = [...responseTimes, timeTakenSec];
    setResponseTimes(updatedTimes);

    const currentQ = questions[currentIndex];
    const isCorrect = selectedOption === currentQ.answer;
    const newCorrectCount = isCorrect ? correctCount + 1 : correctCount;
    setCorrectCount(newCorrectCount);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      setQuestionStartTime(Date.now());
    } else {
      finishTest(newCorrectCount, updatedTimes);
    }
  };

  const finishTest = (finalCorrect: number, times: number[]) => {
    const totalTime = times.reduce((sum, t) => sum + t, 0);
    const averageSec = totalTime / times.length;
    const accuracy = (finalCorrect / questions.length) * 100;

    setAvgTime(Math.round(averageSec * 10) / 10);
    setAccuracyRate(Math.round(accuracy));

    // 正答率と平均所要時間に基づく統合スコア
    const computedTotal = calculatePerformanceScore({
      totalQuestions: questions.length,
      correctCount: finalCorrect,
      averageTimeSec: averageSec,
      targetTimeSec: 2.0,
    });

    setFinalScore(computedTotal);
    const fb = getFeedbackForScore(computedTotal);
    setFeedback(fb);
    setIsFinished(true);

    // LocalStorageへ自動保存
    saveSession({
      totalScore: computedTotal,
      subScores: {
        memory: computedTotal,
        calculation: computedTotal,
        typing: computedTotal,
        reading: computedTotal,
      },
      contextTag: "normal",
      feedbackType: fb.type,
    });
  };

  if (questions.length === 0) {
    return <div className="py-12 text-center text-gray-400">テストを準備中...</div>;
  }

  if (isFinished && feedback) {
    return (
      <div className="space-y-6 max-w-md mx-auto py-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm text-center space-y-4">
          <div className="text-sm font-semibold text-gray-500">計測完了</div>
          <div>
            <span className="text-6xl font-extrabold text-blue-600 dark:text-blue-400">
              {finalScore}
            </span>
            <span className="text-xl text-gray-400 ml-1">/ 100</span>
          </div>

          {/* 測定メトリクス（正答率・平均回答時間） */}
          <div className="grid grid-cols-2 gap-3 py-2 border-y border-gray-100 dark:border-gray-700/60 text-center">
            <div>
              <div className="text-xs text-gray-400">正答率</div>
              <div className="text-lg font-bold text-gray-800 dark:text-gray-200">
                {accuracyRate}% ({correctCount}/5問)
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400">平均回答時間</div>
              <div className="text-lg font-bold text-gray-800 dark:text-gray-200">
                {avgTime} 秒 / 問
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl border text-left ${
            feedback.type === "high"
              ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-900 dark:text-green-300"
              : feedback.type === "medium"
              ? "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-300"
              : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-900 dark:text-red-300"
          }`}>
            <div className="font-bold text-base mb-1">{feedback.title}</div>
            <div className="text-sm leading-relaxed">{feedback.actionAdvice}</div>
          </div>

          <p className="text-xs text-gray-400">
            結果は端末に自動保存されました。
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Link
            href="/"
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-center transition"
          >
            ホームへ戻る
          </Link>
          <Link
            href="/history"
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl text-center transition text-sm"
          >
            履歴を確認する
          </Link>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="space-y-6 max-w-md mx-auto py-6">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>問題 {currentIndex + 1} / 5</span>
        <span className="text-xs bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">
          簡易計算テスト
        </span>
      </div>

      <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
        <div
          className="bg-blue-600 h-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / 5) * 100}%` }}
        />
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-sm text-center">
        <div className="text-3xl sm:text-4xl font-extrabold tracking-wide mb-6">
          {currentQ.text}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {currentQ.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(opt)}
              className="py-4 text-xl font-bold bg-gray-50 hover:bg-blue-50 dark:bg-gray-700/60 dark:hover:bg-blue-900/40 border border-gray-200 dark:border-gray-600 hover:border-blue-500 rounded-xl transition active:scale-95"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <p className="text-center text-xs text-gray-400">
        スピードと正確性の両方がスコアに影響します
      </p>
    </div>
  );
}
