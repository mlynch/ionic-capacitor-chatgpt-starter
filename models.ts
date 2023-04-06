export interface ChatGPTCompletion {
  choices: ChatGPTChoice[];
  created: number;
  id: string;
  model: string;
  object: string;
  usage: ChatGPTCompletionUsage;
}

export interface ChatGPTChoice {
  finish_reason: string;
  index: 0;
  message: ChatGPTMessage;
}

export interface ChatGPTCompletionUsage {
  completion_tokens: number;
  prompt_tokens: number;
  total_tokens: number;
}

export interface ChatGPTMessage {
  content: string;
  role: 'assistant' | 'user' | 'system' | string;
}
