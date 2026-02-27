import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class CommonService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取城市列表
   */
  async getCities() {
    const cities = await this.prisma.city.findMany({
      orderBy: [{ isHot: 'desc' }, { sortOrder: 'asc' }, { letter: 'asc' }],
    })

    const hot = cities
      .filter((c) => c.isHot)
      .map((c) => ({
        code: c.code,
        name: c.name,
      }))

    // 按字母分组
    const grouped: Record<string, any[]> = {}
    for (const city of cities) {
      if (!grouped[city.letter]) {
        grouped[city.letter] = []
      }
      grouped[city.letter].push({
        code: city.code,
        name: city.name,
      })
    }

    const all = Object.entries(grouped)
      .map(([letter, cityList]) => ({
        letter,
        cities: cityList,
      }))
      .sort((a, b) => a.letter.localeCompare(b.letter))

    return { hot, all }
  }

  /**
   * 提交反馈
   */
  async submitFeedback(userId: string, type: string, content: string, images?: string[], contact?: string) {
    await this.prisma.feedback.create({
      data: {
        userId,
        type: type.toUpperCase() as any,
        content,
        images: images || [],
        contact,
      },
    })

    return { success: true, message: '反馈提交成功，我们会尽快处理' }
  }

  /**
   * 获取服务协议
   */
  async getAgreement(type: string) {
    const agreement = await this.prisma.agreement.findUnique({
      where: { type: type.toUpperCase() as any },
    })

    if (!agreement) {
      return {
        title: '服务协议',
        content: '暂无内容',
        version: '1.0.0',
        updatedAt: new Date().toISOString().split('T')[0],
      }
    }

    return {
      title: agreement.title,
      content: agreement.content,
      version: agreement.version,
      updatedAt: agreement.updatedAt.toISOString().split('T')[0],
    }
  }

  /**
   * 获取首页配置
   */
  async getHomeConfig() {
    const config = await this.prisma.homeConfig.findFirst()

    if (!config) {
      return {
        banners: [],
        hotTags: ['福田区', '南山区', '深圳北站'],
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
      }
    }

    return {
      banners: config.banners,
      hotTags: config.hotTags,
      promotions: config.promotions,
    }
  }

  /**
   * 文件上传 (返回上传 URL)
   */
  async getUploadUrl(type: string, filename: string) {
    // TODO: 实际项目中对接腾讯云 COS 或阿里云 OSS
    const key = `${type}/${Date.now()}_${filename}`

    return {
      url: `https://cdn.snail-shell.com/${key}`,
      key,
      // 如果是直传，还需要返回签名等信息
    }
  }
}
