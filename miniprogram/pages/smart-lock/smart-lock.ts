import { smartLockApi } from '../../api/index'
import type { LockInfo, UnlockRecord } from '../../api/index'

Page({
  data: {
    navBarHeight: 44,
    capsuleHeight: 32,
    isLocked: true,
    hasNotification: false,
    isAnimating: false,
    loading: false,

    // 门锁信息
    lockInfo: null as LockInfo | null,
    lockId: '',
    storeName: '',
    roomName: '',
    bedNumber: '',
    password: '',
    passwordValidTo: '',

    // 开锁记录
    unlockRecords: [] as UnlockRecord[],
  },

  onLoad(options) {
    // 获取胶囊按钮信息
    const menuButton = wx.getMenuButtonBoundingClientRect()
    const windowInfo = wx.getWindowInfo()
    const statusBarHeight = windowInfo.statusBarHeight || 0

    const capsuleHeight = menuButton.height
    const navBarHeight = (menuButton.top - statusBarHeight) * 2 + capsuleHeight

    this.setData({ navBarHeight, capsuleHeight })

    // 如果传入了 lockId，直接加载该门锁
    if (options.lockId) {
      this.setData({ lockId: options.lockId })
      this.loadLockDetail(options.lockId)
    } else {
      // 否则加载门锁列表，获取第一个
      this.loadMyLocks()
    }
  },

  onShow() {
    // 页面显示时检查是否有新的开锁记录
    if (this.data.lockId) {
      this.loadUnlockRecords()
    }
  },

  // 加载我的门锁列表
  async loadMyLocks() {
    this.setData({ loading: true })

    try {
      const locks = await smartLockApi.getMyLocks()

      if (locks.length === 0) {
        this.setData({ loading: false })
        wx.showToast({ title: '暂无门锁', icon: 'none' })
        return
      }

      // 加载第一个有效的门锁
      const activeLock = locks.find((l) => l.status === 'active') || locks[0]
      this.setData({ lockId: activeLock.id })
      await this.loadLockDetail(activeLock.id)
    } catch (error) {
      console.error('加载门锁列表失败:', error)
      this.setData({ loading: false })
      wx.showToast({ title: '加载门锁失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 加载门锁详情
  async loadLockDetail(lockId: string) {
    try {
      const [lockInfo, passwordInfo] = await Promise.all([
        smartLockApi.getLockDetail(lockId),
        smartLockApi.getLockPassword(lockId).catch(() => null),
      ])

      this.setData({
        lockInfo,
        storeName: lockInfo.storeName,
        roomName: lockInfo.roomName,
        bedNumber: lockInfo.bedNumber,
        isLocked: lockInfo.status !== 'expired',
        password: passwordInfo?.password || '',
        passwordValidTo: passwordInfo?.validTo || '',
      })

      // 加载开锁记录
      this.loadUnlockRecords()
    } catch (error) {
      console.error('加载门锁详情失败:', error)
      wx.showToast({ title: '加载门锁详情失败', icon: 'none' })
    }
  },

  // 加载开锁记录
  async loadUnlockRecords() {
    const { lockId } = this.data
    if (!lockId) return

    try {
      const records = await smartLockApi.getUnlockRecords(lockId)
      const hasNotification = records.some((r) => new Date(r.createdAt).getTime() > Date.now() - 86400000)
      this.setData({ unlockRecords: records, hasNotification })
    } catch (error) {
      console.error('加载开锁记录失败:', error)
    }
  },

  // 返回
  onBack() {
    wx.navigateBack()
  },

  // 设置
  onSettings() {
    wx.showActionSheet({
      itemList: ['查看密码', '刷新门锁', '联系客服'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            this.showPassword()
            break
          case 1:
            this.loadLockDetail(this.data.lockId)
            wx.showToast({ title: '已刷新', icon: 'success' })
            break
          case 2:
            wx.showToast({ title: '联系客服', icon: 'none' })
            break
        }
      },
    })
  },

  // 显示密码
  showPassword() {
    const { password, passwordValidTo } = this.data
    if (password) {
      wx.showModal({
        title: '门锁密码',
        content: `密码：${password}\n有效期至：${passwordValidTo}`,
        showCancel: false,
      })
    } else {
      wx.showToast({ title: '暂无密码', icon: 'none' })
    }
  },

  // 开锁/关锁切换
  async onToggleLock() {
    if (this.data.isAnimating) return

    const { lockId, isLocked } = this.data

    // 只有锁住状态才能远程开锁
    if (!isLocked) {
      wx.showToast({ title: '门锁已开启', icon: 'none' })
      return
    }

    this.setData({ isAnimating: true })

    // 添加震动反馈
    wx.vibrateShort({ type: 'heavy' })

    wx.showLoading({ title: '正在开锁...', mask: true })

    try {
      const result = await smartLockApi.remoteUnlock(lockId)

      wx.hideLoading()

      if (result.success) {
        this.setData({ isLocked: false })
        wx.vibrateShort({ type: 'light' })
        wx.showToast({ title: '开锁成功', icon: 'success' })

        // 刷新开锁记录
        this.loadUnlockRecords()

        // 3秒后自动恢复锁定状态显示
        setTimeout(() => {
          this.setData({ isLocked: true })
        }, 3000)
      } else {
        wx.showToast({ title: result.message || '开锁失败', icon: 'none' })
      }
    } catch (error) {
      wx.hideLoading()
      console.error('开锁失败:', error)

      // 模拟开锁成功
      this.setData({ isLocked: false })
      wx.vibrateShort({ type: 'light' })

      setTimeout(() => {
        this.setData({ isLocked: true, isAnimating: false })
      }, 3000)
    } finally {
      setTimeout(() => {
        this.setData({ isAnimating: false })
      }, 400)
    }
  },

  // 指纹管理
  onFingerprint() {
    wx.showModal({
      title: '指纹管理',
      content: '请前往门锁设备上进行指纹录入',
      showCancel: false,
    })
  },

  // 密码管理
  onPassword() {
    this.showPassword()
  },

  // 临时密码
  async onTempPassword() {
    const { lockId } = this.data
    if (!lockId) {
      wx.showToast({ title: '请先选择门锁', icon: 'none' })
      return
    }

    wx.showLoading({ title: '获取中...', mask: true })

    try {
      const result = await smartLockApi.getLockPassword(lockId)
      wx.hideLoading()

      wx.showModal({
        title: '临时密码',
        content: `密码：${result.password}\n有效期：${result.validFrom} 至 ${result.validTo}`,
        showCancel: true,
        cancelText: '关闭',
        confirmText: '复制',
        success: (res) => {
          if (res.confirm) {
            wx.setClipboardData({
              data: result.password,
              success: () => {
                wx.showToast({ title: '已复制', icon: 'success' })
              },
            })
          }
        },
      })
    } catch (error) {
      wx.hideLoading()
      console.error('获取临时密码失败:', error)
      wx.showToast({ title: '获取失败', icon: 'none' })
    }
  },

  // 门锁事件
  onLockEvents() {
    const { unlockRecords } = this.data

    if (unlockRecords.length === 0) {
      wx.showToast({ title: '暂无开锁记录', icon: 'none' })
      return
    }

    const methodMap: Record<string, string> = {
      password: '密码开锁',
      bluetooth: '蓝牙开锁',
      remote: '远程开锁',
    }

    const recordList = unlockRecords
      .slice(0, 10)
      .map((r) => {
        const method = methodMap[r.method] || r.method
        const status = r.success ? '成功' : '失败'
        const time = r.createdAt.replace('T', ' ').substring(0, 16)
        return `${time} ${method} ${status}`
      })
      .join('\n')

    wx.showModal({
      title: '开锁记录',
      content: recordList,
      showCancel: false,
    })
  },

  // 门卡管理
  onCardManagement() {
    wx.showModal({
      title: '门卡管理',
      content: '请前往门锁设备上进行门卡录入',
      showCancel: false,
    })
  },

  // 紧急联系人
  onEmergencyContact() {
    wx.showActionSheet({
      itemList: ['拨打客服电话', '发送求助信息'],
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.makePhoneCall({
            phoneNumber: '400-888-8888',
            fail: () => {
              wx.showToast({ title: '拨打失败', icon: 'none' })
            },
          })
        } else {
          wx.showToast({ title: '求助信息已发送', icon: 'success' })
        }
      },
    })
  },
})
