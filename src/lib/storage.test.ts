import { describe, it, expect, beforeEach } from "vitest";
import { saveSession, getAllSessions, getLatestSession, clearAllSessions } from "./storage";

// LocalStorageのモック
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
  writable: true,
});

describe("LocalStorageデータ永続化モジュール", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("初期状態では空の配列を返すこと", () => {
    expect(getAllSessions()).toEqual([]);
    expect(getLatestSession()).toBeNull();
  });

  it("セッションを正しく保存し、取得できること", () => {
    const saved = saveSession({
      totalScore: 85,
      subScores: { memory: 80, calculation: 90, typing: 85, reading: 85 },
      contextTag: "normal",
      feedbackType: "high",
    });

    expect(saved.id).toBeDefined();
    expect(saved.createdAt).toBeDefined();
    expect(saved.totalScore).toBe(85);

    const all = getAllSessions();
    expect(all.length).toBe(1);
    expect(all[0].totalScore).toBe(85);
    expect(getLatestSession()?.id).toBe(saved.id);
  });

  it("複数セッションを保存した場合、新しい順にソートされて取得できること", async () => {
    saveSession({
      totalScore: 60,
      subScores: { memory: 60, calculation: 60, typing: 60, reading: 60 },
      contextTag: "normal",
      feedbackType: "medium",
    });

    // タイムスタンプの差分をつけるため少し待機
    await new Promise((r) => setTimeout(r, 10));

    const latest = saveSession({
      totalScore: 90,
      subScores: { memory: 90, calculation: 90, typing: 90, reading: 90 },
      contextTag: "after_exam",
      feedbackType: "high",
    });

    const all = getAllSessions();
    expect(all.length).toBe(2);
    expect(all[0].id).toBe(latest.id);
    expect(all[0].totalScore).toBe(90);
    expect(all[1].totalScore).toBe(60);
  });

  it("clearAllSessionsで履歴が削除されること", () => {
    saveSession({
      totalScore: 70,
      subScores: { memory: 70, calculation: 70, typing: 70, reading: 70 },
      contextTag: "normal",
      feedbackType: "medium",
    });

    expect(getAllSessions().length).toBe(1);
    clearAllSessions();
    expect(getAllSessions().length).toBe(0);
  });
});
