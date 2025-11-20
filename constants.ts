import { TokenCandidate } from './types';

// Scenario: "今天天气真" -> Next token prediction
export const SCENARIO_INPUT = "今天天气真";

export const INITIAL_CANDIDATES: TokenCandidate[] = [
  { id: 1, token: "好", baseProb: 0.50 },
  { id: 2, token: "不错", baseProb: 0.30 },
  { id: 3, token: "热", baseProb: 0.15 },
  { id: 4, token: "怪", baseProb: 0.04 },
  { id: 5, token: "糟糕", baseProb: 0.005 },
  { id: 6, token: "冷", baseProb: 0.002 },
  { id: 7, token: "棒", baseProb: 0.001 },
  { id: 8, token: "一般", baseProb: 0.001 },
  { id: 9, token: "晴", baseProb: 0.0005 },
  { id: 10, token: "蓝", baseProb: 0.0005 },
];
