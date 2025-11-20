export interface TokenCandidate {
  id: number;
  token: string;
  baseProb: number; // The raw probability from the model (softmax output)
}

export interface ProcessedCandidate extends TokenCandidate {
  adjustedProb: number; // After Temperature
  normalizedProb: number; // After Re-normalization (visual only)
  cumulativeProb: number;
  isKeptByTopK: boolean;
  isKeptByTopP: boolean;
  finalProb: number; // The probability used for the actual roll (0 if excluded)
}

export interface SimulationState {
  temperature: number;
  topK: number;
  topP: number;
}
