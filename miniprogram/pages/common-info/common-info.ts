type Traveler = {
  id: string
  name: string
  phone: string
  idCard: string
}

type FormData = {
  name: string
  phone: string
  idCard: string
}

Component({
  data: {
    travelers: [] as Traveler[],
    showEditPopup: false,
    isEditMode: false,
    editingId: '',
    formData: {
      name: '',
      phone: '',
      idCard: '',
    } as FormData,
  },
  lifetimes: {
    attached(this: any) {
      // 加载常用旅客数据
      this.loadTravelers()
    },
  },
  methods: {
    /**
     * 加载常用旅客列表
     */
    loadTravelers(this: any) {
      try {
        const travelers = wx.getStorageSync('common-travelers') as Traveler[]
        if (travelers && Array.isArray(travelers)) {
          this.setData({ travelers })
        } else {
          // 初始化默认数据
          const defaultTravelers: Traveler[] = [
            {
              id: '1',
              name: 'Dimoo',
              phone: '86-185****0306',
              idCard: '4302************118',
            },
          ]
          this.setData({ travelers: defaultTravelers })
          wx.setStorageSync('common-travelers', defaultTravelers)
        }
      } catch (error) {
        console.error('加载常用旅客失败', error)
      }
    },

    /**
     * 保存常用旅客列表
     */
    saveTravelers(this: any) {
      try {
        wx.setStorageSync('common-travelers', this.data.travelers)
      } catch (error) {
        console.error('保存常用旅客失败', error)
      }
    },

    /**
     * 点击常用旅客卡片，打开编辑弹窗
     */
    onOpenCard(this: any, e: WechatMiniprogram.TouchEvent) {
      const id = e.currentTarget.dataset.id
      const traveler = this.data.travelers.find((t: Traveler) => t.id === id)

      if (!traveler) return

      // 设置为编辑模式
      this.setData({
        isEditMode: true,
        editingId: id,
        formData: {
          name: traveler.name,
          phone: traveler.phone,
          idCard: traveler.idCard,
        },
        showEditPopup: true,
      })
    },

    /**
     * 添加常用旅客
     */
    onAddTraveler(this: any) {
      // 打开添加弹窗
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
      this.setData({
        'formData.name': e.detail.value,
      })
    },

    /**
     * 手机号输入变化
     */
    onPhoneChange(this: any, e: any) {
      this.setData({
        'formData.phone': e.detail.value,
      })
    },

    /**
     * 身份证号输入变化
     */
    onIdCardChange(this: any, e: any) {
      this.setData({
        'formData.idCard': e.detail.value,
      })
    },

    /**
     * 确认编辑/添加
     */
    onConfirmEdit(this: any) {
      const { formData, isEditMode, editingId } = this.data

      // 表单验证
      if (!formData.name.trim()) {
        wx.showToast({ title: '请输入姓名', icon: 'none' })
        return
      }
      if (!formData.phone.trim()) {
        wx.showToast({ title: '请输入手机号', icon: 'none' })
        return
      }
      if (!formData.idCard.trim()) {
        wx.showToast({ title: '请输入身份证号', icon: 'none' })
        return
      }

      // 简单的手机号验证
      if (!/^\d{11}$/.test(formData.phone.replace(/[^\d]/g, ''))) {
        wx.showToast({ title: '手机号格式不正确', icon: 'none' })
        return
      }

      // 简单的身份证验证
      if (!/^[\dXx]{18}$/.test(formData.idCard.replace(/[^\dXx]/g, ''))) {
        wx.showToast({ title: '身份证号格式不正确', icon: 'none' })
        return
      }

      let travelers = [...this.data.travelers]

      if (isEditMode) {
        // 编辑模式：更新现有旅客
        const index = travelers.findIndex((t: Traveler) => t.id === editingId)
        if (index !== -1) {
          travelers[index] = {
            ...travelers[index],
            name: formData.name.trim(),
            phone: formData.phone.trim(),
            idCard: formData.idCard.trim(),
          }
        }
      } else {
        // 添加模式：创建新旅客
        const newTraveler: Traveler = {
          id: Date.now().toString(),
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          idCard: formData.idCard.trim(),
        }
        travelers.push(newTraveler)
      }

      // 保存数据
      this.setData({ travelers })
      this.saveTravelers()

      // 关闭弹窗
      this.setData({ showEditPopup: false })

      wx.showToast({
        title: isEditMode ? '修改成功' : '添加成功',
        icon: 'success',
      })
    },

    /**
     * 删除旅客
     */
    onDeleteTraveler(this: any) {
      const { editingId } = this.data

      wx.showModal({
        title: '确认删除',
        content: '确定要删除该常用旅客吗？',
        success: (res) => {
          if (res.confirm) {
            const travelers = this.data.travelers.filter((t: Traveler) => t.id !== editingId)
            this.setData({
              travelers,
              showEditPopup: false,
            })
            this.saveTravelers()
            wx.showToast({ title: '删除成功', icon: 'success' })
          }
        },
      })
    },

    onBack() {
      wx.navigateBack({
        delta: 1,
        fail: () => {
          wx.switchTab({ url: '/pages/me-gold/me-gold' })
        },
      })
    },
    onMenu() {
      wx.showToast({ title: '菜单', icon: 'none' })
    },
    onClose() {
      wx.navigateBack({
        delta: 1,
        fail: () => {
          wx.switchTab({ url: '/pages/me-gold/me-gold' })
        },
      })
    },
  },
})
