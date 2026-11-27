# 機能仕様書：ローカルデータ保存（ストレージ仕様）

## 1. 概要・設計原則
- **完全オフライン対応**: ネットワーク状態に一切依存せず、テスト完了時に即座にクライアント側（LocalStorage）へ永続化する。
- **データ整合性と堅牢性**: 保存・読み込み時に **Zod** スキーマによるランタイムバリデーションを実施し、不正データや古いバージョンのデータによるクラッシュを防ぐ。
- **将来のクラウド同期への備え**: 各レコードにユニークID（UUID）とISOタイムスタンプ（`createdAt`）を持たせ、後のスライスでSupabaseと容易にマージ・同期できるようにする。

---

## 2. ストレージ仕様（LocalStorage）

### 2.1 ストレージキー
- `shutyuryoku_sessions_v1`: 測定セッションの履歴リスト（JSON配列）
- `shutyuryoku_profile_v1`: ユーザー設定・属性（ユーザー分類等）

### 2.2 データスキーマ定義
```typescript
interface TestSessionRecord {
  id: string;              // UUID v4
  createdAt: string;       // ISO 8601 (例: "2026-11-27T11:30:00.000Z")
  totalScore: number;      // 0〜100
  subScores: {
    memory: number;        // 0〜100
    calculation: number;   // 0〜100
    typing: number;        // 0〜100
    reading: number;       // 0〜100
  };
  contextTag: "normal" | "after_exam" | "sleep_deprived" | "after_exercise" | "after_meal" | "after_holiday";
  userCategory?: "university_student" | "graduate_student" | "high_school_student" | "working_adult" | "other";
  feedbackType: "high" | "medium" | "low";
}
```

---

## 3. ストレージ操作API（クライアント関数）
- `saveSession(record: Omit<TestSessionRecord, "id" | "createdAt">): TestSessionRecord`: 新規記録の追加
- `getAllSessions(): TestSessionRecord[]`: 過去全履歴の取得（新しい順にソート）
- `getLatestSession(): TestSessionRecord | null`: 最新の1件を取得
- `clearAllSessions(): void`: デバッグ・リセット用全消去
