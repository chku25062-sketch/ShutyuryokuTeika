import { describe, it, expect } from "vitest";
import { calculateTotalScore, calculatePerformanceScore, getFeedbackForScore } from "./score";

describe("パフォーマンス集中力スコア算出ロジック（正答率×所要時間）", () => {
  it("基準時間以内で全問正解した場合、95〜100点のハイスコアとなること", () => {
    const score = calculatePerformanceScore({
      totalQuestions: 5,
      correctCount: 5,
      averageTimeSec: 1.8,
      targetTimeSec: 2.0,
    });
    expect(score).toBe(100);
  });

  it("全問正解でも回答に時間がかかった場合（平均4.0秒）、スコアが減衰すること", () => {
    const score = calculatePerformanceScore({
      totalQuestions: 5,
      correctCount: 5,
      averageTimeSec: 4.0,
      targetTimeSec: 2.0,
    });
    // diffSec = 2.0 -> speedScore = 100 - 50 = 50 -> total = 50
    expect(score).toBe(50);
  });

  it("回答が高速（平均1.5秒）でも正答率が低い場合（5問中2問正解）、大幅減点されること", () => {
    const score = calculatePerformanceScore({
      totalQuestions: 5,
      correctCount: 2, // 正答率 40%
      averageTimeSec: 1.5,
      targetTimeSec: 2.0,
    });
    // speedScore = 100, accuracy = 0.4, 0.4^1.8 ~ 0.19 -> total ~ 19点
    expect(score).toBeLessThan(30);
  });

  it("0問正解の場合は0点となること", () => {
    const score = calculatePerformanceScore({
      totalQuestions: 5,
      correctCount: 0,
      averageTimeSec: 1.5,
    });
    expect(score).toBe(0);
  });
});

describe("4種総合スコア算出ロジック", () => {
  it("4種のサブスコアの平均値を四捨五入して正確に算出すること", () => {
    const scores = {
      memory: 80,
      calculation: 85,
      typing: 75,
      reading: 90,
    };
    expect(calculateTotalScore(scores)).toBe(83);
  });
});

describe("行動フィードバック判定ロジック", () => {
  it("75点以上で「high」のフィードバックを返すこと", () => {
    const feedback = getFeedbackForScore(80);
    expect(feedback.type).toBe("high");
    expect(feedback.actionAdvice).toContain("重い課題");
  });

  it("50点〜74点で「medium」のフィードバックを返すこと", () => {
    const feedback = getFeedbackForScore(60);
    expect(feedback.type).toBe("medium");
  });

  it("49点以下で「low」のフィードバックを返すこと", () => {
    const feedback = getFeedbackForScore(40);
    expect(feedback.type).toBe("low");
    expect(feedback.actionAdvice).toContain("休憩");
  });
});
