import { login, bindPhone, getProfile } from '../../store/user'

Component({
  properties: {
    visible: {
      type: Boolean,
      value: false,
    },
  },

  data: {
    currentStep: 'wechat-login' as 'wechat-login' | 'phone-auth' | 'error',
    isLoading: false,
    errorMessage: '',
  },

  observers: {
    visible(val: boolean) {
      if (val) {
        this.setData({
          currentStep: 'wechat-login',
          isLoading: false,
          errorMessage: '',
        })
      }
    },
  },

  methods: {
    // WeChat one-tap login
    async onWechatLogin() {
      if (this.data.isLoading) return

      this.setData({ isLoading: true })
      try {
        const profile = await login()
        if (profile.phone) {
          this.triggerLoginSuccess(profile)
        } else {
          this.setData({ currentStep: 'phone-auth', isLoading: false })
        }
      } catch (err) {
        this.setData({
          currentStep: 'error',
          isLoading: false,
          errorMessage: '登录失败，请重试',
        })
      }
    },

    // Phone number authorization
    async onGetPhoneNumber(e: any) {
      const code = e.detail?.code
      if (!code) {
        // User denied authorization - stay on current step
        return
      }

      this.setData({ isLoading: true })
      try {
        await bindPhone(code)
        const profile = getProfile()
        this.triggerLoginSuccess(profile)
      } catch (err) {
        this.setData({ isLoading: false })
        wx.showToast({ title: '绑定手机号失败', icon: 'none' })
      }
    },

    // Skip phone auth
    onSkipPhone() {
      const profile = getProfile()
      this.triggerLoginSuccess(profile)
    },

    // Retry from error state
    onRetry() {
      this.setData({
        currentStep: 'wechat-login',
        isLoading: false,
        errorMessage: '',
      })
    },

    // Close popup
    onClose() {
      this.triggerEvent('visiblechange', { visible: false })
    },

    // Handle t-popup visible change (e.g. tap overlay)
    onVisibleChange(e: any) {
      if (!e.detail.visible) {
        this.triggerEvent('visiblechange', { visible: false })
      }
    },

    // Trigger login success event
    triggerLoginSuccess(profile: any) {
      this.setData({ isLoading: false })
      this.triggerEvent('loginsuccess', { userProfile: profile })
      this.triggerEvent('visiblechange', { visible: false })
    },
  },
})
