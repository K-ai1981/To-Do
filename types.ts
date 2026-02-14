export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  subtasks: Subtask[];
  githubIssueNumber?: number; // Linked issue number
  githubUrl?: string; // Link to the issue
  tags: string[];
}

export interface GithubConfig {
  token: string;
  owner: string;
  repo: string;
}

export enum FilterType {
  ALL = 'ALL',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED'
}

export interface GithubIssue {
  number: number;
  title: string;
  state: string;
  html_url: string;
  body?: string;
}