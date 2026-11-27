import { TestSessionRecord, TestSessionRecordSchema } from "@/types";

const SESSIONS_STORAGE_KEY = "shutyuryoku_sessions_v1";

/**
 * LocalStorageが利用可能か判定（SSR対策）
 */
function getStorage(): Storage | null {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }
  if (typeof localStorage !== "undefined") {
    return localStorage;
  }
  return null;
}

/**
 * すべてのセッション履歴を取得する（新しい順にソート）
 */
export function getAllSessions(): TestSessionRecord[] {
  const storage = getStorage();
  if (!storage) return [];

  try {
    const raw = storage.getItem(SESSIONS_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Zodでバリデーションし、破損したデータは除外
    const validSessions: TestSessionRecord[] = [];
    for (const item of parsed) {
      const result = TestSessionRecordSchema.safeParse(item);
      if (result.success) {
        validSessions.push(result.data);
      }
    }

    // 新しい順（降順）にソート
    return validSessions.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (e) {
    console.error("Failed to load sessions from localStorage", e);
    return [];
  }
}

/**
 * 最新のセッション履歴を取得する
 */
export function getLatestSession(): TestSessionRecord | null {
  const sessions = getAllSessions();
  return sessions.length > 0 ? sessions[0] : null;
}

/**
 * 新しい測定セッションを保存する
 */
export function saveSession(
  recordInput: Omit<TestSessionRecord, "id" | "createdAt">
): TestSessionRecord {
  const newRecord: TestSessionRecord = {
    ...recordInput,
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
    createdAt: new Date().toISOString(),
  };

  const storage = getStorage();
  if (!storage) return newRecord;

  try {
    const currentSessions = getAllSessions();
    const updatedSessions = [newRecord, ...currentSessions];
    storage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updatedSessions));
  } catch (e) {
    console.error("Failed to save session to localStorage", e);
  }

  return newRecord;
}

/**
 * すべての履歴をクリアする（リセット用）
 */
export function clearAllSessions(): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(SESSIONS_STORAGE_KEY);
  } catch (e) {
    console.error("Failed to clear sessions", e);
  }
}
