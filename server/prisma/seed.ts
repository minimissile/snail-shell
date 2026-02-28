import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 开始播种数据...')

  // 清理现有数据
  await prisma.smartLockEvent.deleteMany()
  await prisma.smartLockCard.deleteMany()
  await prisma.smartLockFingerprint.deleteMany()
  await prisma.smartLockPassword.deleteMany()
  await prisma.smartLockAccess.deleteMany()
  await prisma.bedBooking.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.orderDiscount.deleteMany()
  await prisma.order.deleteMany()
  await prisma.userCoupon.deleteMany()
  await prisma.couponTemplate.deleteMany()
  await prisma.review.deleteMany()
  await prisma.footprint.deleteMany()
  await prisma.favorite.deleteMany()
  await prisma.message.deleteMany()
  await prisma.balanceRecord.deleteMany()
  await prisma.pointRecord.deleteMany()
  await prisma.feedback.deleteMany()
  await prisma.bed.deleteMany()
  await prisma.roomPackage.deleteMany()
  await prisma.room.deleteMany()
  await prisma.storeFeature.deleteMany()
  await prisma.storeFacility.deleteMany()
  await prisma.storeHighlight.deleteMany()
  await prisma.storeRule.deleteMany()
  await prisma.storeCostRule.deleteMany()
  await prisma.landlord.deleteMany()
  await prisma.store.deleteMany()
  await prisma.user.deleteMany()
  await prisma.city.deleteMany()
  await prisma.agreement.deleteMany()
  await prisma.homeConfig.deleteMany()

  // 创建城市数据
  console.log('📍 创建城市数据...')
  await prisma.city.createMany({
    data: [
      { code: '深圳', name: '深圳', letter: 'S', isHot: true, sortOrder: 1 },
      { code: '广州', name: '广州', letter: 'G', isHot: true, sortOrder: 2 },
      { code: '上海', name: '上海', letter: 'S', isHot: true, sortOrder: 3 },
      { code: '北京', name: '北京', letter: 'B', isHot: true, sortOrder: 4 },
      { code: '杭州', name: '杭州', letter: 'H', isHot: true, sortOrder: 5 },
      { code: '成都', name: '成都', letter: 'C', isHot: false, sortOrder: 6 },
      { code: '南京', name: '南京', letter: 'N', isHot: false, sortOrder: 7 },
      { code: '武汉', name: '武汉', letter: 'W', isHot: false, sortOrder: 8 },
      { code: '厦门', name: '厦门', letter: 'X', isHot: false, sortOrder: 9 },
      { code: '青岛', name: '青岛', letter: 'Q', isHot: false, sortOrder: 10 },
    ],
  })

  // 创建协议数据
  console.log('📄 创建协议数据...')
  await prisma.agreement.createMany({
    data: [
      {
        type: 'USER',
        title: '用户服务协议',
        content: '欢迎使用蜗壳青旅预订服务...',
        version: '1.0.0',
      },
      {
        type: 'PRIVACY',
        title: '隐私政策',
        content: '我们非常重视您的隐私保护...',
        version: '1.0.0',
      },
      {
        type: 'BOOKING',
        title: '预订须知',
        content: '预订前请仔细阅读以下须知...',
        version: '1.0.0',
      },
    ],
  })

  // 创建首页配置
  console.log('🏠 创建首页配置...')
  await prisma.homeConfig.create({
    data: {
      banners: [
        {
          id: 'banner_1',
          image: 'https://cdn.snail-shell.com/banners/summer.jpg',
          link: '/pages/nearby-stores/nearby-stores?tag=summer',
          title: '夏日特惠',
        },
      ],
      hotTags: ['福田区', '南山区', '深圳北站', '罗湖区'],
      promotions: [
        {
          id: 'promo_quality',
          type: 'quality',
          title: '品质好房',
          subtitle: '平台验真 入住无忧',
          image: '/assets/figma/home-promo-house.png',
          link: '/pages/nearby-stores/nearby-stores?tag=quality',
        },
        {
          id: 'promo_redpacket',
          type: 'redpacket',
          title: '百元红包',
          subtitle: '社群专属福利',
          image: '/assets/figma/home-promo-redpacket.png',
          link: '',
        },
        {
          id: 'promo_groupbuy',
          type: 'groupbuy',
          title: '团购验券',
          subtitle: '订青旅折上折',
          image: '/assets/figma/home-promo-groupbuy.png',
          link: '/pages/coupon-verify/coupon-verify',
        },
      ],
    },
  })

  // 创建测试用户
  console.log('👤 创建测试用户...')
  const user = await prisma.user.create({
    data: {
      openId: 'test_openid_001',
      nickname: '蜗壳测试用户',
      avatar: 'https://cdn.snail-shell.com/avatars/default.png',
      phone: '13888888888',
      memberLevel: 'DIAMOND',
      points: 1200,
      balance: 200,
      cashback: 150,
      consumption: 50,
    },
  })

  // 创建门店数据
  console.log('🏨 创建门店数据...')
  const store1 = await prisma.store.create({
    data: {
      name: '蜗壳青旅·深圳北站店',
      description: '位于深圳北站商圈，交通便利，环境舒适',
      images: [
        'https://cdn.snail-shell.com/stores/store1/1.jpg',
        'https://cdn.snail-shell.com/stores/store1/2.jpg',
        'https://cdn.snail-shell.com/stores/store1/3.jpg',
      ],
      videoUrl: 'https://cdn.snail-shell.com/stores/store1/tour.mp4',
      address: '深圳市龙华区民治街道北站社区民康路88号',
      district: '龙华区',
      cityCode: '深圳',
      longitude: 114.0289,
      latitude: 22.6129,
      nearbyTransport: '距深圳北站步行5分钟',
      businessHours: '全天营业',
      phone: '0755-12345678',
      rating: 4.9,
      reviewCount: 328,
      favoriteCount: 1256,
    },
  })

  const store2 = await prisma.store.create({
    data: {
      name: '蜗壳青旅·福田CBD店',
      description: '位于福田CBD核心区，商务出行首选',
      images: ['https://cdn.snail-shell.com/stores/store2/1.jpg', 'https://cdn.snail-shell.com/stores/store2/2.jpg'],
      address: '深圳市福田区福华三路88号',
      district: '福田区',
      cityCode: '深圳',
      longitude: 114.0579,
      latitude: 22.5349,
      nearbyTransport: '距购物公园站步行3分钟',
      businessHours: '全天营业',
      phone: '0755-87654321',
      rating: 4.8,
      reviewCount: 215,
      favoriteCount: 892,
    },
  })

  // 创建门店特色
  console.log('✨ 创建门店特色...')
  await prisma.storeFeature.createMany({
    data: [
      { storeId: store1.id, icon: 'wifi', name: '免费WiFi' },
      { storeId: store1.id, icon: 'parking', name: '停车位' },
      { storeId: store1.id, icon: 'breakfast', name: '早餐服务' },
      { storeId: store1.id, icon: 'lock', name: '智能门锁' },
      { storeId: store2.id, icon: 'wifi', name: '免费WiFi' },
      { storeId: store2.id, icon: 'coffee', name: '咖啡吧' },
      { storeId: store2.id, icon: 'lock', name: '智能门锁' },
    ],
  })

  // 创建门店设施
  await prisma.storeFacility.createMany({
    data: [
      { storeId: store1.id, category: '公共区域', items: ['休息区', '自助厨房', '洗衣房', '阅读角'] },
      { storeId: store1.id, category: '房间设施', items: ['空调', '独立卫浴', '热水器', '衣柜'] },
      { storeId: store2.id, category: '公共区域', items: ['休息区', '咖啡吧', '会议室'] },
      { storeId: store2.id, category: '房间设施', items: ['空调', '独立卫浴', '热水器'] },
    ],
  })

  // 创建门店亮点
  await prisma.storeHighlight.createMany({
    data: [
      { storeId: store1.id, title: '位置优越', description: '地铁口步行3分钟，高铁直达' },
      { storeId: store1.id, title: '安全保障', description: '24小时监控+智能门锁' },
      { storeId: store2.id, title: 'CBD核心', description: '商务出行便利' },
    ],
  })

  // 创建门店规则
  await prisma.storeRule.createMany({
    data: [
      {
        storeId: store1.id,
        checkInTime: '14:00后',
        checkOutTime: '12:00前',
        cancelPolicy: '入住前24小时免费取消',
        notices: ['禁止携带宠物', '禁止大声喧哗', '禁止做饭', '禁止吸烟'],
      },
      {
        storeId: store2.id,
        checkInTime: '14:00后',
        checkOutTime: '12:00前',
        cancelPolicy: '入住前24小时免费取消',
        notices: ['禁止携带宠物', '禁止吸烟'],
      },
    ],
  })

  // 创建费用规则
  await prisma.storeCostRule.createMany({
    data: [
      { storeId: store1.id, title: '押金', content: '入住时收取200元押金，退房后无损坏退还', sortOrder: 1 },
      { storeId: store1.id, title: '水电费', content: '包含在房费中', sortOrder: 2 },
      { storeId: store2.id, title: '押金', content: '入住时收取300元押金', sortOrder: 1 },
    ],
  })

  // 创建房东
  await prisma.landlord.createMany({
    data: [
      {
        storeId: store1.id,
        name: '蜗壳官方',
        avatar: 'https://cdn.snail-shell.com/landlords/official.png',
        description: '专业青旅运营团队，为您提供舒适的住宿体验',
        responseRate: '98%',
        responseTime: '5分钟内',
      },
      {
        storeId: store2.id,
        name: '蜗壳官方',
        avatar: 'https://cdn.snail-shell.com/landlords/official.png',
        description: '专业青旅运营团队',
        responseRate: '95%',
        responseTime: '10分钟内',
      },
    ],
  })

  // 创建房型
  console.log('🛏️ 创建房型数据...')
  const room1 = await prisma.room.create({
    data: {
      storeId: store1.id,
      name: '8人女生房',
      type: 'FEMALE_DORM',
      images: ['https://cdn.snail-shell.com/rooms/female8/1.jpg'],
      bedCount: 8,
      area: 25,
      floor: '3楼',
      price: 68,
      originalPrice: 98,
      hourPrice: 30,
      monthPrice: 1500,
      weekendPrice: 88,
      features: ['独立卫浴', '空调', 'WiFi', '衣柜'],
      hasSmartLock: true,
    },
  })

  const room2 = await prisma.room.create({
    data: {
      storeId: store1.id,
      name: '6人混合房',
      type: 'MIXED_DORM',
      images: ['https://cdn.snail-shell.com/rooms/mixed6/1.jpg'],
      bedCount: 6,
      area: 20,
      floor: '2楼',
      price: 58,
      originalPrice: 78,
      features: ['独立卫浴', '空调', 'WiFi'],
      hasSmartLock: true,
    },
  })

  // 创建房型套餐
  await prisma.roomPackage.createMany({
    data: [
      { roomId: room1.id, type: 'breakfast', icon: '🍳', name: '含早' },
      { roomId: room1.id, type: 'cancel', icon: '✓', name: '免费取消' },
      { roomId: room2.id, type: 'cancel', icon: '✓', name: '免费取消' },
    ],
  })

  // 创建床位
  console.log('🛏️ 创建床位数据...')
  const bedPositions = ['TOP_LEFT', 'TOP_RIGHT', 'BOTTOM_LEFT', 'BOTTOM_RIGHT']
  for (let group = 0; group < 2; group++) {
    for (let i = 0; i < 4; i++) {
      const letter = String.fromCharCode(65 + group) // A, B
      await prisma.bed.create({
        data: {
          roomId: room1.id,
          bedNumber: `${letter}${i + 1}`,
          position: bedPositions[i] as any,
          groupIndex: group,
        },
      })
    }
  }

  // 创建优惠券模板
  console.log('🎟️ 创建优惠券模板...')
  const couponTemplate = await prisma.couponTemplate.create({
    data: {
      name: '新人专享券',
      description: '满100减20',
      type: 'DISCOUNT',
      amount: 20,
      minAmount: 100,
      validType: 'DAYS',
      validDays: 30,
      totalCount: -1,
      perUserLimit: 1,
    },
  })

  // 给用户发放优惠券
  await prisma.userCoupon.create({
    data: {
      userId: user.id,
      templateId: couponTemplate.id,
      validFrom: new Date(),
      validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  })

  // 创建点评
  console.log('⭐ 创建点评数据...')
  await prisma.review.createMany({
    data: [
      {
        userId: user.id,
        storeId: store1.id,
        rating: 5,
        content: '位置很好，离地铁站很近，房间干净整洁，工作人员服务态度很好！',
        images: ['https://cdn.snail-shell.com/reviews/r1.jpg'],
        roomType: '8人女生房',
        stayDate: '2024-05',
        replyContent: '感谢您的好评，期待再次光临！',
        replyAt: new Date(),
      },
      {
        userId: user.id,
        storeId: store1.id,
        rating: 4,
        content: '整体不错，性价比很高',
        roomType: '6人混合房',
        stayDate: '2024-04',
      },
    ],
  })

  console.log('✅ 数据播种完成！')
}

main()
  .catch((e) => {
    console.error('❌ 播种失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
