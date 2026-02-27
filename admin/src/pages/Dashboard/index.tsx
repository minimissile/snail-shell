import React, { useEffect, useState } from 'react'
import { Card, Col, Row, Statistic, Table, Select } from 'antd'
import { ShoppingCartOutlined, DollarOutlined, UserOutlined, WarningOutlined } from '@ant-design/icons'
import { Line, Column } from '@ant-design/charts'
import { dashboardApi } from '@/services/dashboard'

const DashboardPage: React.FC = () => {
  const [overview, setOverview] = useState<any>({})
  const [revenue, setRevenue] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [storeRanking, setStoreRanking] = useState<any[]>([])
  const [occupancy, setOccupancy] = useState<any>({})
  const [revenueRange, setRevenueRange] = useState('7d')
  const [orderRange, setOrderRange] = useState('7d')

  useEffect(() => {
    dashboardApi.getOverview().then(setOverview)
    dashboardApi.getStoreRanking().then(setStoreRanking)
    dashboardApi.getOccupancy().then(setOccupancy)
    dashboardApi.getUserStats('30d').then(setUsers)
  }, [])

  useEffect(() => {
    dashboardApi.getRevenue(revenueRange).then(setRevenue)
  }, [revenueRange])

  useEffect(() => {
    dashboardApi.getOrderStats(orderRange).then(setOrders)
  }, [orderRange])

  const rangeSelector = (value: string, onChange: (v: string) => void) => (
    <Select value={value} onChange={onChange} size="small" style={{ width: 100 }}>
      <Select.Option value="7d">近7天</Select.Option>
      <Select.Option value="14d">近14天</Select.Option>
      <Select.Option value="30d">近30天</Select.Option>
    </Select>
  )

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="今日订单"
              value={overview.todayOrders || 0}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="今日营收"
              value={overview.todayRevenue || 0}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#52c41a' }}
              suffix="元"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={overview.totalUsers || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="待处理退款"
              value={overview.pendingRefunds || 0}
              prefix={<WarningOutlined />}
              valueStyle={{ color: overview.pendingRefunds > 0 ? '#ff4d4f' : '#999' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="营收趋势" extra={rangeSelector(revenueRange, setRevenueRange)}>
            <Line
              data={revenue}
              xField="date"
              yField="value"
              height={300}
              smooth
              point={{ size: 3 }}
              yAxis={{ label: { formatter: (v: string) => `¥${v}` } }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="订单统计" extra={rangeSelector(orderRange, setOrderRange)}>
            <Column data={orders} xField="date" yField="value" height={300} color="#1890ff" />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="用户增长 (近30天)">
            <Line data={users} xField="date" yField="value" height={300} smooth color="#722ed1" point={{ size: 3 }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title="门店排行 TOP10"
            extra={
              <span style={{ color: '#999' }}>
                入住率: {occupancy.occupancyRate || 0}% ({occupancy.bookedBeds || 0}/{occupancy.totalBeds || 0})
              </span>
            }
          >
            <Table
              dataSource={storeRanking}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                { title: '排名', dataIndex: 'rank', width: 60 },
                { title: '门店名称', dataIndex: 'name' },
                { title: '订单数', dataIndex: 'orderCount', width: 80 },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default DashboardPage
