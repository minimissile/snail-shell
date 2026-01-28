Page({
  data: {
    selectedType: '客服帮助', // 选中的问题类型
    feedbackContent: '', // 反馈内容
    uploadedImages: [] as string[], // 已上传的图片
    contactInfo: '', // 联系方式
    canSubmit: false // 是否可以提交
  },

  onLoad() {
    // 页面加载
  },

  // 选择问题类型
  onSelectProblemType() {
    const types = ['客服帮助', '功能建议', '支付问题', '订单问题', '其他问题'];
    wx.showActionSheet({
      itemList: types,
      success: (res) => {
        this.setData({
          selectedType: types[res.tapIndex]
        });
      }
    });
  },

  // 输入反馈内容
  onFeedbackInput(e: WechatMiniprogram.Input) {
    this.setData({
      feedbackContent: e.detail.value
    });
    this.checkCanSubmit();
  },

  // 上传图片
  onUploadImage() {
    wx.chooseImage({
      count: 3 - this.data.uploadedImages.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newImages = [...this.data.uploadedImages, ...res.tempFilePaths];
        this.setData({
          uploadedImages: newImages.slice(0, 3)
        });
      }
    });
  },

  // 删除图片
  onDeleteImage(e: WechatMiniprogram.TouchEvent) {
    const index = e.currentTarget.dataset.index as number;
    const images = [...this.data.uploadedImages];
    images.splice(index, 1);
    this.setData({
      uploadedImages: images
    });
  },

  // 输入联系方式
  onContactInput(e: WechatMiniprogram.Input) {
    this.setData({
      contactInfo: e.detail.value
    });
  },

  // 检查是否可以提交
  checkCanSubmit() {
    const canSubmit = this.data.feedbackContent.trim().length > 0;
    this.setData({
      canSubmit
    });
  },

  // 提交反馈
  onSubmit() {
    if (!this.data.canSubmit) {
      wx.showToast({
        title: '请填写反馈内容',
        icon: 'none'
      });
      return;
    }

    // 显示加载
    wx.showLoading({
      title: '提交中...'
    });

    // 模拟提交
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '提交成功',
        icon: 'success',
        duration: 2000
      });

      // 2秒后返回
      setTimeout(() => {
        wx.navigateBack();
      }, 2000);
    }, 1000);
  }
});
