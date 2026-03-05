// 环境配置
const ENV = 'dev' as 'dev' | 'prod'

const config = {
  dev: {
    baseUrl: 'http://localhost:3100/v1',
    wsUrl: 'ws://localhost:3100',
  },
  prod: {
    baseUrl: 'https://api.snailshell.com/v1',
    wsUrl: 'wss://api.snailshell.com',
  },
}

export const BASE_URL = config[ENV].baseUrl
export const WS_URL = config[ENV].wsUrl
export const API_TIMEOUT = 30000

// 存储 key
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_INFO: 'user_info',
  TOKEN_EXPIRE_TIME: 'token_expire_time',
}

export default config[ENV]
