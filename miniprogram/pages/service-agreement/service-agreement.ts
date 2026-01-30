interface AgreementItem {
  id: string
  title: string
  url?: string
}

Page({
  data: {
    agreementList: [
      { id: 'license', title: '证照信息' },
      { id: 'service', title: '服务协议' },
      { id: 'rights', title: '权利声明' },
      { id: 'intellectual', title: '知识产权声明' },
      { id: 'disclaimer', title: '免责声明' },
      { id: 'bad-info', title: '不良信息处理制度' },
      { id: 'trading-rules', title: '平台历史交易规则' },
      { id: 'content-platform', title: '内容平台协议' },
      { id: 'privacy', title: '隐私政策' },
      { id: 'children-protection', title: '儿童个人信息保护规则及监护人须知' },
      { id: 'algorithm', title: '算法备案信息' },
      { id: 'policy', title: '政策协议' },
    ] as AgreementItem[],
  },

  onLoad() {
    // 页面加载
  },

  // 点击协议项
  onAgreementTap(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id as string
    const item = this.data.agreementList.find((a) => a.id === id)

    if (!item) return

    wx.showToast({
      title: item.title,
      icon: 'none',
    })

    // TODO: 跳转到具体的协议详情页
    // wx.navigateTo({
    //   url: `/pages/agreement-detail/agreement-detail?id=${id}`
    // });
  },
})
