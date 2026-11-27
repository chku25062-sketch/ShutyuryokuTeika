import { SubTestScore, FeedbackMessage, FeedbackType } from "@/types";

export interface PerformanceInput {
  totalQuestions: number;
  correctCount: number;
  averageTimeSec: number;
  targetTimeSec?: number; // デフォルト 2.0秒
}

/**
 * 正答率と平均所要時間から、0〜100のパフォーマンス集中力スコアを算出する
 * - 正確性（Accuracy Rate）: 正答率が高いほどベーススコアが高くなる
 * - 速度（Speed）: 基準時間（targetTimeSec）に近いほど加点。遅いと減点
 * - 正答率の二乗ペナルティ: 当てずっぽうの早打ちは大幅に減点
 */
export function calculatePerformanceScore(input: PerformanceInput): number {
  const { totalQuestions, correctCount, averageTimeSec, targetTimeSec = 2.0 } = input;

  if (totalQuestions <= 0) return 0;

  // 正答率（0.0 〜 1.0）
  const accuracy = Math.max(0, Math.min(1.0, correctCount / totalQuestions));

  // 速度スコア（0 〜 100）
  // targetTime（例2.0秒）で100点、以降1秒遅れるごとに20点減点（6秒以上で0点）
  const diffSec = averageTimeSec - targetTimeSec;
  const speedScore = Math.max(0, Math.min(100, Math.round(100 - Math.max(0, diffSec) * 25)));

  // 正確性と速度の統合
  // accuracy^2 を掛けることで、ミスが多いとスピードがどれだけ速くても低スコアになる
  const total = Math.round(Math.pow(accuracy, 1.8) * speedScore);

  return Math.max(0, Math.min(100, total));
}

/**
 * 4つのサブテストスコアから総合集中力スコア（0〜100）を算出する
 */
export function calculateTotalScore(subScores: SubTestScore): number {
  const { memory, calculation, typing, reading } = subScores;
  const average = (memory + calculation + typing + reading) / 4;
  return Math.round(Math.max(0, Math.min(100, average)));
}

/**
 * 集中力スコアからフィードバックメッセージを決定する
 */
export function getFeedbackForScore(score: number): FeedbackMessage {
  if (score >= 75) {
    return {
      type: "high",
      title: "⚡ 集中力十分",
      actionAdvice: "素早く正確に解答できています。重い課題や難関タスクを一気に進めましょう！",
    };
  } else if (score >= 50) {
    return {
      type: "medium",
      title: "☕ 標準コンディション",
      actionAdvice: "集中力は標準的です。無理のないペースで、通常の作業を進めましょう。",
    };
  } else {
    return {
      type: "low",
      title: "🛌 集中力低下中",
      actionAdvice: "回答に遅れやミスが目立っています。時間を浪費する前に、軽い作業に切り替えるか休憩を挟みましょう。",
    };
  }
}
