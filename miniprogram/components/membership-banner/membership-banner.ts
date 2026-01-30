Component({
  properties: {
    greeting: {
      type: String,
      value: '',
    },
    memberType: {
      type: String,
      value: 'general', // 'gold' | 'general'
    },
  },
  methods: {
    onBenefit(e: any) {
      // 安全的事件对象检查
      if (!e || !e.currentTarget) {
        console.warn('membership-banner: Invalid event object', e)
        return
      }

      // 安全的 dataset 获取和 key 值提取
      const dataset = e.currentTarget.dataset || {}
      let key = dataset.key

      // 健壮的类型转换和验证
      if (key === undefined || key === null) {
        key = ''
      } else if (typeof key !== 'string') {
        key = String(key)
      }

      // 清理和验证 key
      key = (key || '').trim()

      // 只有存在有效非空 key 时才触发事件
      if (key) {
        this.triggerEvent('benefit', { key })
      } else {
        console.warn('membership-banner: Invalid or missing benefit key', {
          originalKey: dataset.key,
          processedKey: key,
          dataset: dataset,
        })
      }
    },
  },
})
