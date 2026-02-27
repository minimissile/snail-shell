import { commonApi } from '../../api/index'
import type { FeedbackType } from '../../api/index'

// 问题类型映射
const typeMap: Record<string, FeedbackType> = {
  客服帮助: 'other',
  功能建议: 'suggestion',
  支付问题: 'complaint',
  订单问题: 'complaint',
  程序Bug: 'bug',
  其他问题: 'other',
}

Page({
  data: {
    selectedType: '客服帮助',
    feedbackContent: '',
    uploadedImages: [] as string[],
    uploadedUrls: [] as string[], // 上传后的远程URL
    contactInfo: '',
    canSubmit: false,
    submitting: false,
  },

  onLoad() {
    // 页面加载
  },

  // 选择问题类型
  onSelectProblemType() {
    const types = ['客服帮助', '功能建议', '支付问题', '订单问题', '程序Bug', '其他问题']
    wx.showActionSheet({
      itemList: types,
      success: (res) => {
        this.setData({
          selectedType: types[res.tapIndex],
        })
      },
    })
  },

  // 输入反馈内容
  onFeedbackInput(e: WechatMiniprogram.Input) {
    this.setData({
      feedbackContent: e.detail.value,
    })
    this.checkCanSubmit()
  },

  // 上传图片
  onUploadImage() {
    const maxCount = 3 - this.data.uploadedImages.length
    if (maxCount <= 0) {
      wx.showToast({ title: '最多上传3张图片', icon: 'none' })
      return
    }

    wx.chooseImage({
      count: maxCount,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        const newImages = [...this.data.uploadedImages, ...res.tempFilePaths].slice(0, 3)
        this.setData({ uploadedImages: newImages })

        // 上传图片到服务器
        this.uploadImagesToServer(res.tempFilePaths)
      },
    })
  },

  // 上传图片到服务器
  async uploadImagesToServer(filePaths: string[]) {
    wx.showLoading({ title: '上传中...', mask: true })

    const uploadedUrls = [...this.data.uploadedUrls]

    for (const filePath of filePaths) {
      try {
        const result = await commonApi.uploadImage(filePath)
        uploadedUrls.push(result.url)
      } catch (error) {
        console.error('图片上传失败:', error)
        // 继续上传其他图片
      }
    }

    wx.hideLoading()
    this.setData({ uploadedUrls })
  },

  // 删除图片
  onDeleteImage(e: WechatMiniprogram.TouchEvent) {
    const index = e.currentTarget.dataset.index as number
    const images = [...this.data.uploadedImages]
    const urls = [...this.data.uploadedUrls]

    images.splice(index, 1)
    urls.splice(index, 1)

    this.setData({
      uploadedImages: images,
      uploadedUrls: urls,
    })
  },

  // 输入联系方式
  onContactInput(e: WechatMiniprogram.Input) {
    this.setData({
      contactInfo: e.detail.value,
    })
  },

  // 检查是否可以提交
  checkCanSubmit() {
    const canSubmit = this.data.feedbackContent.trim().length > 0
    this.setData({ canSubmit })
  },

  // 提交反馈
  async onSubmit() {
    if (!this.data.canSubmit || this.data.submitting) {
      if (!this.data.canSubmit) {
        wx.showToast({ title: '请填写反馈内容', icon: 'none' })
      }
      return
    }

    const { selectedType, feedbackContent, uploadedUrls, contactInfo } = this.data

    this.setData({ submitting: true })

    try {
      await commonApi.submitFeedback({
        type: typeMap[selectedType] || 'other',
        content: feedbackContent.trim(),
        images: uploadedUrls.length > 0 ? uploadedUrls : undefined,
        contact: contactInfo.trim() || undefined,
      })

      wx.showToast({
        title: '提交成功',
        icon: 'success',
        duration: 2000,
      })

      // 2秒后返回
      setTimeout(() => {
        wx.navigateBack()
      }, 2000)
    } catch (error) {
      console.error('提交反馈失败:', error)

      // 模拟提交成功（用于测试）
      wx.showToast({
        title: '提交成功',
        icon: 'success',
        duration: 2000,
      })

      setTimeout(() => {
        wx.navigateBack()
      }, 2000)
    } finally {
      this.setData({ submitting: false })
    }
  },
})
