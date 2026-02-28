import React, { useEffect, useState } from 'react'
import { Table, Button, Space, Tag, Input, Select, Card } from 'antd'
import { SearchOutlined, EyeOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { userApi } from '@/services/user'
import { MEMBER_LEVEL_MAP } from '@/utils/constants'
import dayjs from 'dayjs'

const UserList: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [params, setParams] = useState<any>({ page: 1, pageSize: 10 })
  const navigate = useNavigate()

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await userApi.getUsers(params)
      setData(res.list || [])
      setTotal(res.total || 0)
    } catch {
      /* handled */
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [params.page, params.pageSize])

  const handleSearch = () => {
    setParams((prev: any) => ({ ...prev, page: 1 }))
    fetchData()
  }

  const columns = [
    {
      title: '头像',
      dataIndex: 'avatarUrl',
      width: 70,
      render: (url: string) => (
        <img
          src={url || 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png'}
          alt=""
          style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
        />
      ),
    },
    { title: '昵称', dataIndex: 'nickname', width: 150 },
    { title: '手机号', dataIndex: 'phone', width: 130 },
    {
      title: '会员等级',
      dataIndex: 'memberLevel',
      width: 120,
      render: (level: string) => {
        const item = MEMBER_LEVEL_MAP[level]
        return item ? <Tag color={item.color}>{item.text}</Tag> : level
      },
    },
    {
      title: '积分',
      dataIndex: 'points',
      width: 80,
    },
    {
      title: '余额',
      dataIndex: 'balance',
      width: 100,
      render: (v: any) => `¥${Number(v || 0).toFixed(2)}`,
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      width: 170,
      render: (v: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '操作',
      width: 100,
      render: (_: any, record: any) => (
        <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/users/${record.id}`)}>
          详情
        </Button>
      ),
    },
  ]

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            placeholder="手机号"
            value={params.phone}
            onChange={(e) => setParams((p: any) => ({ ...p, phone: e.target.value }))}
            onPressEnter={handleSearch}
            style={{ width: 150 }}
          />
          <Input
            placeholder="昵称"
            value={params.nickname}
            onChange={(e) => setParams((p: any) => ({ ...p, nickname: e.target.value }))}
            onPressEnter={handleSearch}
            style={{ width: 150 }}
          />
          <Select
            placeholder="会员等级"
            allowClear
            value={params.memberLevel}
            onChange={(v) => setParams((p: any) => ({ ...p, memberLevel: v }))}
            style={{ width: 130 }}
          >
            {Object.entries(MEMBER_LEVEL_MAP).map(([key, val]) => (
              <Select.Option key={key} value={key}>
                {val.text}
              </Select.Option>
            ))}
          </Select>
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            搜索
          </Button>
        </Space>
      </Card>

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={data}
        pagination={{
          current: params.page,
          pageSize: params.pageSize,
          total,
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 条`,
          onChange: (page, pageSize) => setParams((p: any) => ({ ...p, page, pageSize })),
        }}
      />
    </div>
  )
}

export default UserList
