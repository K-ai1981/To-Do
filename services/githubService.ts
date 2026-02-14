import { GithubConfig, GithubIssue, Todo } from '../types';

const GITHUB_API_BASE = 'https://api.github.com';

export const validateGithubToken = async (token: string): Promise<boolean> => {
  try {
    const response = await fetch(`${GITHUB_API_BASE}/user`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    return response.ok;
  } catch (error) {
    console.error('GitHub Validation Error:', error);
    return false;
  }
};

export const fetchGithubIssues = async (config: GithubConfig): Promise<GithubIssue[]> => {
  if (!config.token || !config.owner || !config.repo) {
    throw new Error('Incomplete GitHub configuration');
  }

  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${config.owner}/${config.repo}/issues?state=open`,
    {
      headers: {
        Authorization: `token ${config.token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch issues');
  }

  return await response.json();
};

export const createGithubIssue = async (todo: Todo, config: GithubConfig): Promise<GithubIssue> => {
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${config.owner}/${config.repo}/issues`,
    {
      method: 'POST',
      headers: {
        Authorization: `token ${config.token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: todo.text,
        body: `Created via TaskFlow.\n\nSubtasks:\n${todo.subtasks.map(s => `- [${s.completed ? 'x' : ' '}] ${s.text}`).join('\n')}`,
      }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to create issue');
  }

  return await response.json();
};
