const TOKEN_KEY = 'admin_token'
const ADMIN_INFO_KEY = 'admin_info'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(ADMIN_INFO_KEY)
}

export function getAdminInfo(): any | null {
  const info = localStorage.getItem(ADMIN_INFO_KEY)
  return info ? JSON.parse(info) : null
}

export function setAdminInfo(info: any): void {
  localStorage.setItem(ADMIN_INFO_KEY, JSON.stringify(info))
}

export function isAuthenticated(): boolean {
  return !!getToken()
}
