import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 开始播种管理后台数据...')

  // 清理现有管理后台数据
  await prisma.adminOperationLog.deleteMany()
  await prisma.adminRolePermission.deleteMany()
  await prisma.adminUserRole.deleteMany()
  await prisma.adminPermission.deleteMany()
  await prisma.adminRole.deleteMany()
  await prisma.adminUser.deleteMany()

  // 创建权限
  console.log('🔑 创建权限数据...')
  const permissionsData = [
    // Dashboard
    { name: '查看数据看板', code: 'dashboard:read', module: 'dashboard', action: 'read', sortOrder: 1 },
    // Store
    { name: '查看门店', code: 'store:read', module: 'store', action: 'read', sortOrder: 10 },
    { name: '创建门店', code: 'store:create', module: 'store', action: 'create', sortOrder: 11 },
    { name: '编辑门店', code: 'store:update', module: 'store', action: 'update', sortOrder: 12 },
    { name: '删除门店', code: 'store:delete', module: 'store', action: 'delete', sortOrder: 13 },
    // Room
    { name: '查看房型', code: 'room:read', module: 'room', action: 'read', sortOrder: 20 },
    { name: '创建房型', code: 'room:create', module: 'room', action: 'create', sortOrder: 21 },
    { name: '编辑房型', code: 'room:update', module: 'room', action: 'update', sortOrder: 22 },
    { name: '删除房型', code: 'room:delete', module: 'room', action: 'delete', sortOrder: 23 },
    // Order
    { name: '查看订单', code: 'order:read', module: 'order', action: 'read', sortOrder: 30 },
    { name: '处理退款', code: 'order:refund', module: 'order', action: 'refund', sortOrder: 31 },
    { name: '导出订单', code: 'order:export', module: 'order', action: 'export', sortOrder: 32 },
    // User
    { name: '查看用户', code: 'user:read', module: 'user', action: 'read', sortOrder: 40 },
    { name: '管理用户', code: 'user:manage', module: 'user', action: 'manage', sortOrder: 41 },
    // Coupon
    { name: '查看优惠券', code: 'coupon:read', module: 'coupon', action: 'read', sortOrder: 50 },
    { name: '创建优惠券', code: 'coupon:create', module: 'coupon', action: 'create', sortOrder: 51 },
    { name: '编辑优惠券', code: 'coupon:update', module: 'coupon', action: 'update', sortOrder: 52 },
    { name: '删除优惠券', code: 'coupon:delete', module: 'coupon', action: 'delete', sortOrder: 53 },
    { name: '发放优惠券', code: 'coupon:distribute', module: 'coupon', action: 'distribute', sortOrder: 54 },
    // System
    { name: '查看系统配置', code: 'system:read', module: 'system', action: 'read', sortOrder: 60 },
    { name: '编辑系统配置', code: 'system:update', module: 'system', action: 'update', sortOrder: 61 },
    { name: '创建系统配置', code: 'system:create', module: 'system', action: 'create', sortOrder: 62 },
    { name: '删除系统配置', code: 'system:delete', module: 'system', action: 'delete', sortOrder: 63 },
    // Admin
    { name: '查看管理员', code: 'admin:read', module: 'admin', action: 'read', sortOrder: 70 },
    { name: '创建管理员', code: 'admin:create', module: 'admin', action: 'create', sortOrder: 71 },
    { name: '编辑管理员', code: 'admin:update', module: 'admin', action: 'update', sortOrder: 72 },
    { name: '删除管理员', code: 'admin:delete', module: 'admin', action: 'delete', sortOrder: 73 },
    { name: '分配角色', code: 'admin:assign-role', module: 'admin', action: 'assign-role', sortOrder: 74 },
    { name: '重置密码', code: 'admin:reset-password', module: 'admin', action: 'reset-password', sortOrder: 75 },
    // Role
    { name: '查看角色', code: 'role:read', module: 'role', action: 'read', sortOrder: 80 },
    { name: '创建角色', code: 'role:create', module: 'role', action: 'create', sortOrder: 81 },
    { name: '编辑角色', code: 'role:update', module: 'role', action: 'update', sortOrder: 82 },
    { name: '删除角色', code: 'role:delete', module: 'role', action: 'delete', sortOrder: 83 },
  ]

  await prisma.adminPermission.createMany({ data: permissionsData })
  const allPermissions = await prisma.adminPermission.findMany()

  // 创建角色
  console.log('👥 创建角色...')
  const superAdminRole = await prisma.adminRole.create({
    data: {
      name: '超级管理员',
      code: 'SUPER_ADMIN',
      description: '拥有系统所有权限',
      sortOrder: 1,
    },
  })

  const storeManagerRole = await prisma.adminRole.create({
    data: {
      name: '门店经理',
      code: 'STORE_MANAGER',
      description: '管理门店、房型、订单等',
      sortOrder: 2,
    },
  })

  // 为超级管理员分配所有权限
  await prisma.adminRolePermission.createMany({
    data: allPermissions.map((p) => ({
      roleId: superAdminRole.id,
      permissionId: p.id,
    })),
  })

  // 为门店经理分配部分权限
  const storeManagerPermCodes = [
    'dashboard:read',
    'store:read',
    'store:update',
    'room:read',
    'room:create',
    'room:update',
    'order:read',
    'order:refund',
    'order:export',
    'user:read',
    'coupon:read',
  ]
  const storeManagerPerms = allPermissions.filter((p) => storeManagerPermCodes.includes(p.code))
  await prisma.adminRolePermission.createMany({
    data: storeManagerPerms.map((p) => ({
      roleId: storeManagerRole.id,
      permissionId: p.id,
    })),
  })

  // 创建超级管理员账号
  console.log('👤 创建管理员账号...')
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const adminUser = await prisma.adminUser.create({
    data: {
      username: 'admin',
      password: hashedPassword,
      realName: '超级管理员',
      phone: '13800000000',
      email: 'admin@snail-shell.com',
    },
  })

  // 分配超级管理员角色
  await prisma.adminUserRole.create({
    data: {
      userId: adminUser.id,
      roleId: superAdminRole.id,
    },
  })

  console.log('✅ 管理后台数据播种完成！')
  console.log('📋 管理员账号: admin / admin123')
}

main()
  .catch((e) => {
    console.error('❌ 播种失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
