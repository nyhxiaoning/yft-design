const GITHUB_API = 'https://api.github.com'

export interface GithubConfig {
  owner: string
  repo: string
  path: string
  token: string
}

interface GithubContentResponse {
  name: string
  path: string
  sha: string
  size: number
  content: string
  encoding: string
}

interface GithubError {
  message: string
  documentation_url?: string
}

async function request<T>(url: string, token: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  const body = await res.json()

  if (!res.ok) {
    const err = body as GithubError
    throw new Error(err.message || `GitHub API error: ${res.status}`)
  }

  return body as T
}

/** 获取仓库文件内容（base64 编码） */
export async function getFile(config: GithubConfig): Promise<{ data: any; sha: string }> {
  const url = `${GITHUB_API}/repos/${config.owner}/${config.repo}/contents/${config.path}`
  const res = await request<GithubContentResponse>(url, config.token)

  // base64 解码
  const decoded = atob(res.content.replace(/\n/g, ''))
  const data = JSON.parse(decoded)
  return { data, sha: res.sha }
}

/** 创建或更新仓库文件 */
export async function createOrUpdateFile(
  config: GithubConfig,
  content: any,
  sha?: string,
): Promise<void> {
  const url = `${GITHUB_API}/repos/${config.owner}/${config.repo}/contents/${config.path}`
  const body: Record<string, any> = {
    message: `yft-design: sync projects ${new Date().toISOString().slice(0, 10)}`,
    content: btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2)))),
  }
  if (sha) body.sha = sha

  await request<any>(url, config.token, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

/** 删除仓库文件 */
export async function deleteFile(config: GithubConfig, sha: string): Promise<void> {
  const url = `${GITHUB_API}/repos/${config.owner}/${config.repo}/contents/${config.path}`
  const body = {
    message: `yft-design: remove sync file`,
    sha,
  }

  await request<any>(url, config.token, {
    method: 'DELETE',
    body: JSON.stringify(body),
  })
}
