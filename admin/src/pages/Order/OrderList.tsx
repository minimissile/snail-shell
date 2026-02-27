import React, { useEffect, useState } from 'react'
import { Table, Button, Space, Tag, Input, Select, Card, DatePicker, message } from 'antd'
import { SearchOutlined, ExportOutlined, EyeOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { orderApi } from '@/services/order'
import { ORDER_STATUS_MAP } from '@/utils/constants'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

const OrderList: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [params, setParams] = useState<any>({ page: 1, pageSize: 10 })
  const [exportLoading, setExportLoading] = useState(false)
  const navigate = useNavigate()

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await orderApi.getOrders(params)
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

  const handleExport = async () => {
    setExportLoading(true)
    try {
      const res = await orderApi.exportOrders(params)
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `订单导出_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`
      link.click()
      window.URL.revokeObjectURL(url)
      message.success('导出成功')
    } catch {
      /* handled */
    } finally {
      setExportLoading(false)
    }
  }

  const handleDateChange = (_: any, dates: [string, string]) => {
    setParams((prev: any) => ({
      ...prev,
      startDate: dates[0] || undefined,
      endDate: dates[1] || undefined,
    }))
  }

  const columns = [
    { title: '订单号', dataIndex: 'orderNo', width: 200 },
    { title: '门店', dataIndex: ['store', 'name'], width: 150, ellipsis: true },
    {
      title: '入住日期',
      dataIndex: 'checkInDate',
      width: 110,
      render: (v: string) => (v ? dayjs(v).format('YYYY-MM-DD') : '-'),
    },
    {
      title: '退房日期',
      dataIndex: 'checkOutDate',
      width: 110,
      render: (v: string) => (v ? dayjs(v).format('YYYY-MM-DD') : '-'),
    },
    {
      title: '金额',
      dataIndex: 'finalPrice',
      width: 100,
      render: (v: number) => `¥${(v || 0).toFixed(2)}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: string) => {
        const item = ORDER_STATUS_MAP[status]
        return item ? <Tag color={item.color}>{item.text}</Tag> : status
      },
    },
    {
      title: '下单时间',
      dataIndex: 'createdAt',
      width: 170,
      render: (v: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '操作',
      width: 100,
      render: (_: any, record: any) => (
        <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/orders/${record.id}`)}>
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
            placeholder="订单号"
            value={params.orderNo}
            onChange={(e) => setParams((p: any) => ({ ...p, orderNo: e.target.value }))}
            onPressEnter={handleSearch}
            style={{ width: 200 }}
          />
          <Input
            placeholder="手机号"
            value={params.phone}
            onChange={(e) => setParams((p: any) => ({ ...p, phone: e.target.value }))}
            onPressEnter={handleSearch}
            style={{ width: 150 }}
          />
          <Select
            placeholder="订单状态"
            allowClear
            value={params.status}
            onChange={(v) => setParams((p: any) => ({ ...p, status: v }))}
            style={{ width: 130 }}
          >
            {Object.entries(ORDER_STATUS_MAP).map(([key, val]) => (
              <Select.Option key={key} value={key}>
                {val.text}
              </Select.Option>
            ))}
          </Select>
          <RangePicker onChange={handleDateChange} />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            搜索
          </Button>
          <Button icon={<ExportOutlined />} loading={exportLoading} onClick={handleExport}>
            导出
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

export default OrderList
