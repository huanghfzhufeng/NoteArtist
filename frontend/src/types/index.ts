// User types
export interface User {
  id: string;
  username: string;
  createdAt: Date;
}

// Prompt types
export interface Prompt {
  id: string;
  name: string;
  content: string;
  category: string;
  isPreset: boolean;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Persona types
export interface Persona {
  id: string;
  name: string;
  identity: string;       // 身份定位
  targetAudience: string; // 目标受众
  languageStyle: string;  // 语言风格
  coreValues: string;     // 核心价值观
  commonTags: string[];   // 常用话题标签
  isActive: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Work types
export interface Work {
  id: string;
  imageUrl: string;
  title: string;
  content: string;
  tags: string[];
  originalContent: string;
  promptUsed: string;
  personaId?: string;
  persona?: Persona;
  userId: string;
  createdAt: Date;
}

// Settings types
export interface Settings {
  id: string;
  geminiApiKey?: string;
  imagenApiKey?: string;
  userId: string;
}

// Generate result types
export interface GenerateResult {
  image: string;
  copy: {
    title: string;
    content: string;
    tags: string[];
  };
  debugPrompt: string;
}

// App status types
export type AppStatus = 'idle' | 'analyzing' | 'rendering' | 'done';

// Auth types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
