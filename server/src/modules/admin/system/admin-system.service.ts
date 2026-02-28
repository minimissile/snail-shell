import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../../prisma/prisma.service'
import { UpdateHomeConfigDto, CreateCityDto, UpdateCityDto, UpdateAgreementDto, ReplyFeedbackDto } from './dto'
import { paginate } from '../../../common/dto'

@Injectable()
export class AdminSystemService {
  constructor(private prisma: PrismaService) {}

  // ==================== 首页配置 ====================

  async getHomeConfig() {
    const config = await this.prisma.homeConfig.findFirst()
    return config || { banners: [], hotTags: [], promotions: [] }
  }

  async updateHomeConfig(dto: UpdateHomeConfigDto) {
    const existing = await this.prisma.homeConfig.findFirst()

    const data: any = {}
    if (dto.banners !== undefined) data.banners = dto.banners
    if (dto.hotTags !== undefined) data.hotTags = dto.hotTags
    if (dto.promotions !== undefined) data.promotions = dto.promotions

    if (existing) {
      return this.prisma.homeConfig.update({
        where: { id: existing.id },
        data,
      })
    }

    return this.prisma.homeConfig.create({
      data: {
        banners: dto.banners || [],
        hotTags: dto.hotTags || [],
        promotions: dto.promotions || [],
      },
    })
  }

  // ==================== 城市管理 ====================

  async findCities() {
    return this.prisma.city.findMany({
      orderBy: [{ sortOrder: 'asc' }, { letter: 'asc' }],
    })
  }

  async createCity(dto: CreateCityDto) {
    return this.prisma.city.create({
      data: {
        code: dto.code,
        name: dto.name,
        letter: dto.letter,
        isHot: dto.isHot ?? false,
        sortOrder: dto.sortOrder ?? 0,
      },
    })
  }

  async updateCity(id: string, dto: UpdateCityDto) {
    const city = await this.prisma.city.findUnique({ where: { id } })
    if (!city) throw new NotFoundException('城市不存在')

    const data: any = {}
    if (dto.name !== undefined) data.name = dto.name
    if (dto.letter !== undefined) data.letter = dto.letter
    if (dto.isHot !== undefined) data.isHot = dto.isHot
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder

    return this.prisma.city.update({ where: { id }, data })
  }

  async deleteCity(id: string) {
    const city = await this.prisma.city.findUnique({ where: { id } })
    if (!city) throw new NotFoundException('城市不存在')
    await this.prisma.city.delete({ where: { id } })
    return { message: '删除成功' }
  }

  // ==================== 协议管理 ====================

  async findAgreements() {
    return this.prisma.agreement.findMany()
  }

  async findAgreementByType(type: string) {
    const agreement = await this.prisma.agreement.findUnique({
      where: { type: type as any },
    })
    if (!agreement) throw new NotFoundException('协议不存在')
    return agreement
  }

  async updateAgreement(type: string, dto: UpdateAgreementDto) {
    return this.prisma.agreement.upsert({
      where: { type: type as any },
      update: {
        title: dto.title,
        content: dto.content,
        version: dto.version || '1.0.0',
      },
      create: {
        type: type as any,
        title: dto.title,
        content: dto.content,
        version: dto.version || '1.0.0',
      },
    })
  }

  // ==================== 反馈管理 ====================

  async findFeedbacks(page = 1, pageSize = 10, status?: string, type?: string) {
    const where: any = {}
    if (status) where.status = status
    if (type) where.type = type

    const [list, total] = await Promise.all([
      this.prisma.feedback.findMany({
        where,
        include: {
          user: { select: { id: true, nickname: true, phone: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.feedback.count({ where }),
    ])

    return paginate(list, total, page, pageSize)
  }

  async replyFeedback(id: string, dto: ReplyFeedbackDto) {
    const feedback = await this.prisma.feedback.findUnique({ where: { id } })
    if (!feedback) throw new NotFoundException('反馈不存在')

    return this.prisma.feedback.update({
      where: { id },
      data: {
        reply: dto.reply,
        status: (dto.status || 'RESOLVED') as any,
        repliedAt: new Date(),
      },
    })
  }
}
