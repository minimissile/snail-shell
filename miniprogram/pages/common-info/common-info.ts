import { userApi } from '../../api/index'
import type { GuestInfo, CreateGuestParams } from '../../api/index'

type FormData = {
  name: string
  phone: string
  idCard: string
}

// 显示用的入住人信息（脱敏后）
interface DisplayTraveler {
  id: string
  name: string
  phone: string
  idCard: string
  isDefault: boolean
}

Component({
  data: {
    travelers: [] as DisplayTraveler[],
    showEditPopup: false,
    isEditMode: false,
    editingId: '',
    formData: {
      name: '',
      phone: '',
      idCard: '',
    } as FormData,
    loading: false,
  },
  lifetimes: {
    attached(this: any) {
      this.loadTravelers()
    },
  },
  methods: {
    /**
     * 加载常用旅客列表
     */
    async loadTravelers(this: any) {
      this.setData({ loading: true })

      try {
        const guests = await userApi.getGuests()
        // 转换为显示格式（脱敏处理）
        const travelers = guests.map((g: GuestInfo) => ({
          id: g.id,
          name: g.name,
          phone: this.maskPhone(g.phone),
          idCard: this.maskIdCard(g.idNumber),
          isDefault: g.isDefault,
        }))
        this.setData({ travelers })
      } catch (error) {
        console.error('加载常用旅客失败', error)
        this.setData({ travelers: [] })
      } finally {
        this.setData({ loading: false })
      }
    },

    /**
     * 手机号脱敏
     */
    maskPhone(phone: string): string {
      if (!phone) return ''
      if (phone.length >= 11) {
        return phone.substring(0, 3) + '****' + phone.substring(7)
      }
      return phone
    },

    /**
     * 身份证号脱敏
     */
    maskIdCard(idCard: string): string {
      if (!idCard) return ''
      if (idCard.length >= 18) {
        return idCard.substring(0, 4) + '************' + idCard.substring(14)
      }
      return idCard
    },

    /**
     * 点击常用旅客卡片，打开编辑弹窗
     */
    onOpenCard(this: any, e: WechatMiniprogram.TouchEvent) {
      const id = e.currentTarget.dataset.id
      const traveler = this.data.travelers.find((t: DisplayTraveler) => t.id === id)

      if (!traveler) return

      this.setData({
        isEditMode: true,
        editingId: id,
        formData: {
          name: traveler.name,
          phone: '',
          idCard: '',
        },
        showEditPopup: true,
      })
    },

    /**
     * 添加常用旅客
     */
    onAddTraveler(this: any) {
      this.setData({
        isEditMode: false,
        editingId: '',
        formData: {
          name: '',
          phone: '',
          idCard: '',
        },
        showEditPopup: true,
      })
    },

    /**
     * 弹窗显示状态变化
     */
    onPopupVisibleChange(this: any, e: any) {
      this.setData({
        showEditPopup: e.detail.visible,
      })
    },

    /**
     * 取消编辑
     */
    onCancelEdit(this: any) {
      this.setData({ showEditPopup: false })
    },

    /**
     * 姓名输入变化
     */
    onNameChange(this: any, e: any) {
      this.setData({ 'formData.name': e.detail.value })
    },

    /**
     * 手机号输入变化
     */
    onPhoneChange(this: any, e: any) {
      this.setData({ 'formData.phone': e.detail.value })
    },

    /**
     * 身份证号输入变化
     */
    onIdCardChange(this: any, e: any) {
      this.setData({ 'formData.idCard': e.detail.value })
    },

    /**
     * 确认编辑/添加
     */
    async onConfirmEdit(this: any) {
      const { formData, isEditMode, editingId } = this.data

      // 表单验证
      if (!formData.name.trim()) {
        wx.showToast({ title: '请输入姓名', icon: 'none' })
        return
      }

      if (!isEditMode || formData.phone.trim()) {
        if (!formData.phone.trim()) {
          wx.showToast({ title: '请输入手机号', icon: 'none' })
          return
        }
        if (!/^\d{11}$/.test(formData.phone.replace(/[^\d]/g, ''))) {
          wx.showToast({ title: '手机号格式不正确', icon: 'none' })
          return
        }
      }

      if (!isEditMode || formData.idCard.trim()) {
        if (!formData.idCard.trim()) {
          wx.showToast({ title: '请输入身份证号', icon: 'none' })
          return
        }
        if (!/^[\dXx]{18}$/.test(formData.idCard.replace(/[^\dXx]/g, ''))) {
          wx.showToast({ title: '身份证号格式不正确', icon: 'none' })
          return
        }
      }

      wx.showLoading({ title: '保存中...', mask: true })

      try {
        if (isEditMode) {
          const updateData: Partial<CreateGuestParams> = { name: formData.name.trim() }
          if (formData.phone.trim()) updateData.phone = formData.phone.trim()
          if (formData.idCard.trim()) {
            updateData.idNumber = formData.idCard.trim()
            updateData.idType = 'ID_CARD'
          }
          await userApi.updateGuest(editingId, updateData)
        } else {
          await userApi.createGuest({
            name: formData.name.trim(),
            phone: formData.phone.trim(),
            idType: 'ID_CARD',
            idNumber: formData.idCard.trim(),
          })
        }

        wx.hideLoading()
        wx.showToast({ title: isEditMode ? '修改成功' : '添加成功', icon: 'success' })
        this.setData({ showEditPopup: false })
        this.loadTravelers()
      } catch (error) {
        wx.hideLoading()
        console.error('保存失败:', error)
        wx.showToast({ title: '保存失败', icon: 'none' })
      }
    },

    /**
     * 删除旅客
     */
    onDeleteTraveler(this: any) {
      const { editingId } = this.data

      wx.showModal({
        title: '确认删除',
        content: '确定要删除该常用旅客吗？',
        success: async (res) => {
          if (res.confirm) {
            wx.showLoading({ title: '删除中...', mask: true })
            try {
              await userApi.deleteGuest(editingId)
              wx.hideLoading()
              wx.showToast({ title: '删除成功', icon: 'success' })
              this.setData({ showEditPopup: false })
              this.loadTravelers()
            } catch (error) {
              wx.hideLoading()
              console.error('删除失败:', error)
              wx.showToast({ title: '删除失败', icon: 'none' })
            }
          }
        },
      })
    },

    onBack() {
      wx.navigateBack({
        delta: 1,
        fail: () => wx.switchTab({ url: '/pages/mine/mine' }),
      })
    },
    onMenu() {
      wx.showToast({ title: '菜单', icon: 'none' })
    },
    onClose() {
      wx.navigateBack({
        delta: 1,
        fail: () => wx.switchTab({ url: '/pages/mine/mine' }),
      })
    },
  },
})
