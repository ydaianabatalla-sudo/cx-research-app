export type SurveyType = "NPS" | "CSAT" | "CES";
export type SurveyStatus = "active" | "paused" | "closed";

export interface Survey {
  id: string;
  owner_id: string;
  share_id: string;
  name: string;
  type: SurveyType;
  industry: string | null;
  question: string;
  open_question: string | null;
  segments: string[];
  products: string[];
  channels: string[];
  status: SurveyStatus;
  created_at: string;
}

export interface Response {
  id: string;
  survey_id: string;
  score: number;
  comment: string | null;
  segment: string | null;
  product: string | null;
  channel: string | null;
  respondent_email: string | null;
  created_at: string;
}

export type LoopPriority = "high" | "med" | "low";
export type LoopStatus = "pending" | "in_progress" | "done" | "skipped";

export interface LoopAction {
  id: string;
  response_id: string;
  priority: LoopPriority;
  status: LoopStatus;
  owner: string | null;
  action_taken: string | null;
  notes: string | null;
  updated_at: string;
  created_at: string;
}

export interface ResponseWithLoop extends Response {
  loop_action?: LoopAction | null;
}

export type Sentiment = "positive" | "neutral" | "negative" | "mixed";

export interface ThemeStat {
  name: string;
  count: number;
  percentage: number;
  representativeQuote: string;
}
