import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Dropdown, Avatar, Space, message } from 'antd'
import type { MenuProps } from 'antd'
import {
  DashboardOutlined,
  ShopOutlined,
  OrderedListOutlined,
  UserOutlined,
  GiftOutlined,
  SettingOutlined,
  TeamOutlined,
  LogoutOutlined,
  KeyOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MessageOutlined,
} from '@ant-design/icons'
import { getAdminInfo, removeToken } from '@/utils/auth'

const { Header, Sider, Content } = Layout

const menuItems: MenuProps['items'] = [
  {
    key: '/',
    icon: <DashboardOutlined />,
    label: '数据看板',
  },
  {
    key: '/stores',
    icon: <ShopOutlined />,
    label: '门店管理',
  },
  {
    key: '/orders',
    icon: <OrderedListOutlined />,
    label: '订单管理',
  },
  {
    key: '/users',
    icon: <UserOutlined />,
    label: '用户管理',
  },
  {
    key: '/coupons',
    icon: <GiftOutlined />,
    label: '优惠券管理',
  },
  {
    key: 'system',
    icon: <SettingOutlined />,
    label: '系统配置',
    children: [
      { key: '/system/home-config', label: '首页配置' },
      { key: '/system/cities', label: '城市管理' },
      { key: '/system/agreements', label: '协议管理' },
    ],
  },
  {
    key: '/system/feedbacks',
    icon: <MessageOutlined />,
    label: '用户反馈',
  },
  {
    key: 'admin',
    icon: <TeamOutlined />,
    label: '权限管理',
    children: [
      { key: '/admin/users', label: '管理员列表' },
      { key: '/admin/roles', label: '角色管理' },
    ],
  },
]

const BasicLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const adminInfo = getAdminInfo()

  const [selectedKeys, setSelectedKeys] = useState<string[]>(['/'])
  const [openKeys, setOpenKeys] = useState<string[]>([])

  useEffect(() => {
    const path = location.pathname
    setSelectedKeys([path])

    if (path.startsWith('/system')) {
      setOpenKeys((prev) => (prev.includes('system') ? prev : [...prev, 'system']))
    }
    if (path.startsWith('/admin')) {
      setOpenKeys((prev) => (prev.includes('admin') ? prev : [...prev, 'admin']))
    }
  }, [location.pathname])

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key)
  }

  const handleLogout = () => {
    removeToken()
    message.success('已退出登录')
    navigate('/login')
  }

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="dark" width={220}>
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <img src="/logo.png" alt="蜗壳" style={{ width: 32, height: 32, borderRadius: 6 }} />
          {!collapsed && (
            <h1
              style={{
                color: '#fff',
                margin: 0,
                fontSize: 18,
                fontWeight: 700,
                whiteSpace: 'nowrap',
              }}
            >
              蜗壳管理后台
            </h1>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          openKeys={openKeys}
          onOpenChange={setOpenKeys}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          }}
        >
          <span onClick={() => setCollapsed(!collapsed)} style={{ fontSize: 18, cursor: 'pointer' }}>
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </span>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} size="small" />
              <span>{adminInfo?.realName || adminInfo?.username || '管理员'}</span>
            </Space>
          </Dropdown>
        </Header>
        <Content style={{ margin: 24, padding: 24, background: '#fff', borderRadius: 8, minHeight: 360 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default BasicLayout
