import { login, bindPhone, getProfile, setProfile } from '../../store/user'
import { updateProfile } from '../../api/user'

Component({
  properties: {
    visible: {
      type: Boolean,
      value: false,
    },
  },

  data: {
    currentStep: 'wechat-login' as 'wechat-login' | 'phone-auth' | 'set-profile' | 'error',
    isLoading: false,
    errorMessage: '',
    tempNickname: '',
    tempAvatarUrl: '',
  },

  observers: {
    visible(val: boolean) {
      if (val) {
        this.setData({
          currentStep: 'wechat-login',
          isLoading: false,
          errorMessage: '',
          tempNickname: '',
          tempAvatarUrl: '',
        })
      }
    },
  },

  methods: {
    // Check if user needs to set profile
    shouldSetProfile(profile: any): boolean {
      return !profile?.nickname
    },

    // Proceed after auth step: check if profile setup is needed
    proceedAfterAuth(profile: any) {
      if (this.shouldSetProfile(profile)) {
        this.setData({ currentStep: 'set-profile', isLoading: false })
      } else {
        this.triggerLoginSuccess(profile)
      }
    },

    // WeChat one-tap login
    async onWechatLogin() {
      if (this.data.isLoading) return

      this.setData({ isLoading: true })
      try {
        const profile = await login()
        if (profile.phone) {
          this.proceedAfterAuth(profile)
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
        return
      }

      this.setData({ isLoading: true })
      try {
        await bindPhone(code)
        const profile = getProfile()
        this.proceedAfterAuth(profile)
      } catch (err) {
        this.setData({ isLoading: false })
        wx.showToast({ title: '绑定手机号失败', icon: 'none' })
      }
    },

    // Skip phone auth
    onSkipPhone() {
      const profile = getProfile()
      this.proceedAfterAuth(profile)
    },

    // Nickname input handler
    onNicknameInput(e: any) {
      this.setData({ tempNickname: e.detail.value })
    },

    // Avatar selection handler
    onChooseAvatar(e: any) {
      this.setData({ tempAvatarUrl: e.detail.avatarUrl })
    },

    // Save profile (nickname)
    async onSaveProfile() {
      const { tempNickname } = this.data
      if (!tempNickname.trim()) {
        wx.showToast({ title: '请输入昵称', icon: 'none' })
        return
      }

      if (this.data.isLoading) return
      this.setData({ isLoading: true })

      try {
        await updateProfile({ nickname: tempNickname.trim() })
        const profile = getProfile()
        if (profile) {
          setProfile({ ...profile, nickname: tempNickname.trim() })
        }
        const updatedProfile = getProfile()
        this.triggerLoginSuccess(updatedProfile)
      } catch (err) {
        this.setData({ isLoading: false })
        wx.showToast({ title: '保存失败，请重试', icon: 'none' })
      }
    },

    // Skip profile setup
    onSkipProfile() {
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
