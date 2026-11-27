import { z } from "zod";

// ユーザー分類
export const UserCategorySchema = z.enum([
  "university_student",
  "graduate_student",
  "high_school_student",
  "working_adult",
  "other",
]);
export type UserCategory = z.infer<typeof UserCategorySchema>;

// 計測環境タグ
export const ContextTagSchema = z.enum([
  "normal",
  "after_exam",
  "sleep_deprived",
  "after_exercise",
  "after_meal",
  "after_holiday",
]);
export type ContextTag = z.infer<typeof ContextTagSchema>;

// 4種テストの各結果
export const SubTestScoreSchema = z.object({
  memory: z.number().min(0).max(100),
  calculation: z.number().min(0).max(100),
  typing: z.number().min(0).max(100),
  reading: z.number().min(0).max(100),
});
export type SubTestScore = z.infer<typeof SubTestScoreSchema>;

// アクションフィードバック種別
export type FeedbackType = "high" | "medium" | "low";

export interface FeedbackMessage {
  type: FeedbackType;
  title: string;
  actionAdvice: string;
}

// 測定セッション記録
export const TestSessionRecordSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  totalScore: z.number().min(0).max(100),
  subScores: SubTestScoreSchema,
  contextTag: ContextTagSchema.default("normal"),
  userCategory: UserCategorySchema.optional(),
  feedbackType: z.enum(["high", "medium", "low"]),
});
export type TestSessionRecord = z.infer<typeof TestSessionRecordSchema>;
