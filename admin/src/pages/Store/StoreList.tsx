import React, { useEffect, useState } from 'react'
import { Table, Button, Space, Tag, Input, Select, Card, message, Popconfirm, Modal, Form } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { storeApi } from '@/services/store'
import { STORE_STATUS_MAP } from '@/utils/constants'

const StoreList: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [params, setParams] = useState({ page: 1, pageSize: 10, keyword: '', status: '' })
  const [createVisible, setCreateVisible] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [form] = Form.useForm()
  const navigate = useNavigate()

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await storeApi.getStores(params)
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
    setParams((prev) => ({ ...prev, page: 1 }))
    fetchData()
  }

  const handleDelete = async (id: string) => {
    try {
      await storeApi.deleteStore(id)
      message.success('删除成功')
      fetchData()
    } catch {
      /* handled */
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await storeApi.updateStoreStatus(id, status)
      message.success('状态更新成功')
      fetchData()
    } catch {
      /* handled */
    }
  }

  const handleCreate = async (values: any) => {
    setCreateLoading(true)
    try {
      await storeApi.createStore(values)
      message.success('创建成功')
      setCreateVisible(false)
      form.resetFields()
      fetchData()
    } catch {
      /* handled */
    } finally {
      setCreateLoading(false)
    }
  }

  const columns = [
    { title: '门店名称', dataIndex: 'name', width: 200 },
    { title: '城市', dataIndex: 'cityCode', width: 100 },
    { title: '区域', dataIndex: 'district', width: 120 },
    { title: '地址', dataIndex: 'address', ellipsis: true },
    { title: '联系电话', dataIndex: 'phone', width: 130 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 120,
      render: (status: string) => {
        const item = STORE_STATUS_MAP[status]
        return item ? <Tag color={item.color}>{item.text}</Tag> : status
      },
    },
    {
      title: '操作',
      width: 260,
      render: (_: any, record: any) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/stores/${record.id}`)}>
            详情
          </Button>
          {record.status === 'ACTIVE' ? (
            <Button size="small" onClick={() => handleStatusChange(record.id, 'INACTIVE')}>
              暂停
            </Button>
          ) : record.status === 'INACTIVE' ? (
            <Button size="small" type="primary" onClick={() => handleStatusChange(record.id, 'ACTIVE')}>
              启用
            </Button>
          ) : null}
          <Popconfirm title="确定删除该门店?" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            placeholder="搜索门店名称"
            prefix={<SearchOutlined />}
            value={params.keyword}
            onChange={(e) => setParams((prev) => ({ ...prev, keyword: e.target.value }))}
            onPressEnter={handleSearch}
            style={{ width: 200 }}
          />
          <Select
            placeholder="门店状态"
            allowClear
            value={params.status || undefined}
            onChange={(v) => setParams((prev) => ({ ...prev, status: v || '' }))}
            style={{ width: 130 }}
          >
            {Object.entries(STORE_STATUS_MAP).map(([key, val]) => (
              <Select.Option key={key} value={key}>
                {val.text}
              </Select.Option>
            ))}
          </Select>
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            搜索
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateVisible(true)}>
            新增门店
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
          onChange: (page, pageSize) => setParams((prev) => ({ ...prev, page, pageSize })),
        }}
      />

      <Modal
        title="新增门店"
        open={createVisible}
        onCancel={() => {
          setCreateVisible(false)
          form.resetFields()
        }}
        onOk={() => form.submit()}
        confirmLoading={createLoading}
        width={640}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="name" label="门店名称" rules={[{ required: true, message: '请输入门店名称' }]}>
            <Input />
          </Form.Item>
          <Space style={{ display: 'flex' }}>
            <Form.Item name="cityCode" label="城市编码" rules={[{ required: true, message: '请输入城市编码' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="district" label="区域" rules={[{ required: true, message: '请输入区域' }]}>
              <Input />
            </Form.Item>
          </Space>
          <Form.Item name="address" label="地址" rules={[{ required: true, message: '请输入地址' }]}>
            <Input />
          </Form.Item>
          <Space style={{ display: 'flex' }}>
            <Form.Item name="longitude" label="经度" rules={[{ required: true, message: '请输入经度' }]}>
              <Input type="number" />
            </Form.Item>
            <Form.Item name="latitude" label="纬度" rules={[{ required: true, message: '请输入纬度' }]}>
              <Input type="number" />
            </Form.Item>
          </Space>
          <Form.Item name="phone" label="联系电话">
            <Input />
          </Form.Item>
          <Form.Item name="businessHours" label="营业时间">
            <Input placeholder="如: 08:00-22:00" />
          </Form.Item>
          <Form.Item name="nearbyTransport" label="附近交通">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default StoreList
