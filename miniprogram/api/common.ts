// 通用 API
import { get, post } from '../utils/request'

// 反馈类型
export type FeedbackType = 'bug' | 'suggestion' | 'complaint' | 'other'

// 反馈信息
export interface FeedbackParams {
  type: FeedbackType
  content: string
  images?: string[]
  contact?: string
}

// 城市信息
export interface CityInfo {
  code: string
  name: string
  pinyin: string
  hotCities?: boolean
}

// 协议信息
export interface AgreementInfo {
  title: string
  content: string
  version: string
  updatedAt: string
}

// 提交反馈
export function submitFeedback(params: FeedbackParams): Promise<{ id: string }> {
  return post<{ id: string }>('/common/feedback', params, {
    needAuth: true,
    showLoading: true,
    loadingText: '提交中...',
  })
}

// 获取城市列表
export function getCities(): Promise<CityInfo[]> {
  return get<CityInfo[]>('/common/cities')
}

// 获取热门城市
export function getHotCities(): Promise<CityInfo[]> {
  return get<CityInfo[]>('/common/cities/hot')
}

// 获取用户协议
export function getUserAgreement(): Promise<AgreementInfo> {
  return get<AgreementInfo>('/common/agreements/user')
}

// 获取隐私政策
export function getPrivacyPolicy(): Promise<AgreementInfo> {
  return get<AgreementInfo>('/common/agreements/privacy')
}

// 上传图片
export function uploadImage(filePath: string): Promise<{ url: string }> {
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: `${require('../config/index').BASE_URL}/common/upload`,
      filePath,
      name: 'file',
      header: {
        Authorization: `Bearer ${require('../utils/auth').getAccessToken()}`,
      },
      success: (res) => {
        try {
          const data = JSON.parse(res.data)
          if (data.code === 0) {
            resolve(data.data)
          } else {
            reject(new Error(data.message || '上传失败'))
          }
        } catch {
          reject(new Error('解析响应失败'))
        }
      },
      fail: reject,
    })
  })
}
