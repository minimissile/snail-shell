import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Space,
  Table,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  message,
  Popconfirm,
  Tabs,
} from 'antd'
import { ArrowLeftOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { storeApi } from '@/services/store'
import { STORE_STATUS_MAP, ROOM_TYPE_MAP } from '@/utils/constants'

const StoreDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [store, setStore] = useState<any>(null)
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [editVisible, setEditVisible] = useState(false)
  const [roomVisible, setRoomVisible] = useState(false)
  const [editForm] = Form.useForm()
  const [roomForm] = Form.useForm()

  const fetchStore = async () => {
    if (!id) return
    setLoading(true)
    try {
      const res = await storeApi.getStore(id)
      setStore(res)
    } catch {
      /* handled */
    } finally {
      setLoading(false)
    }
  }

  const fetchRooms = async () => {
    if (!id) return
    try {
      const res = await storeApi.getRooms(id)
      setRooms(res || [])
    } catch {
      /* handled */
    }
  }

  useEffect(() => {
    fetchStore()
    fetchRooms()
  }, [id])

  const handleEdit = () => {
    editForm.setFieldsValue(store)
    setEditVisible(true)
  }

  const handleEditSubmit = async (values: any) => {
    try {
      await storeApi.updateStore(id!, values)
      message.success('更新成功')
      setEditVisible(false)
      fetchStore()
    } catch {
      /* handled */
    }
  }

  const handleCreateRoom = async (values: any) => {
    try {
      await storeApi.createRoom(id!, {
        ...values,
        longitude: Number(values.longitude),
        latitude: Number(values.latitude),
      })
      message.success('房型创建成功')
      setRoomVisible(false)
      roomForm.resetFields()
      fetchRooms()
    } catch {
      /* handled */
    }
  }

  const handleDeleteRoom = async (roomId: string) => {
    try {
      await storeApi.deleteRoom(roomId)
      message.success('删除成功')
      fetchRooms()
    } catch {
      /* handled */
    }
  }

  const handleDeleteBed = async (bedId: string) => {
    try {
      await storeApi.deleteBed(bedId)
      message.success('床位删除成功')
      fetchRooms()
    } catch {
      /* handled */
    }
  }

  const statusItem = store ? STORE_STATUS_MAP[store.status] : null

  const roomColumns = [
    { title: '房型名称', dataIndex: 'name', width: 150 },
    {
      title: '类型',
      dataIndex: 'type',
      width: 100,
      render: (t: string) => ROOM_TYPE_MAP[t] || t,
    },
    { title: '床位数', dataIndex: 'bedCount', width: 80 },
    { title: '面积(m²)', dataIndex: 'area', width: 90 },
    { title: '楼层', dataIndex: 'floor', width: 80 },
    {
      title: '价格',
      dataIndex: 'price',
      width: 100,
      render: (v: number) => `¥${v}`,
    },
    {
      title: '操作',
      width: 120,
      render: (_: any, record: any) => (
        <Popconfirm title="确定删除该房型?" onConfirm={() => handleDeleteRoom(record.id)}>
          <Button size="small" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ]

  const expandedRowRender = (record: any) => {
    const beds = record.beds || []
    const bedColumns = [
      { title: '床位编号', dataIndex: 'bedNo', width: 120 },
      {
        title: '状态',
        dataIndex: 'status',
        width: 100,
        render: (s: string) => (
          <Tag color={s === 'AVAILABLE' ? 'green' : s === 'OCCUPIED' ? 'red' : 'orange'}>
            {s === 'AVAILABLE' ? '空闲' : s === 'OCCUPIED' ? '已占用' : '维护中'}
          </Tag>
        ),
      },
      {
        title: '操作',
        width: 100,
        render: (_: any, bed: any) => (
          <Popconfirm title="确定删除该床位?" onConfirm={() => handleDeleteBed(bed.id)}>
            <Button size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        ),
      },
    ]
    return <Table rowKey="id" columns={bedColumns} dataSource={beds} pagination={false} size="small" />
  }

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/stores')} style={{ marginBottom: 16 }}>
        返回列表
      </Button>

      <Card
        loading={loading}
        title="门店信息"
        extra={
          <Button type="primary" onClick={handleEdit}>
            编辑
          </Button>
        }
      >
        {store && (
          <Descriptions column={2}>
            <Descriptions.Item label="门店名称">{store.name}</Descriptions.Item>
            <Descriptions.Item label="状态">
              {statusItem ? <Tag color={statusItem.color}>{statusItem.text}</Tag> : store.status}
            </Descriptions.Item>
            <Descriptions.Item label="城市编码">{store.cityCode}</Descriptions.Item>
            <Descriptions.Item label="区域">{store.district}</Descriptions.Item>
            <Descriptions.Item label="地址" span={2}>
              {store.address}
            </Descriptions.Item>
            <Descriptions.Item label="联系电话">{store.phone}</Descriptions.Item>
            <Descriptions.Item label="营业时间">{store.businessHours}</Descriptions.Item>
            <Descriptions.Item label="附近交通" span={2}>
              {store.nearbyTransport}
            </Descriptions.Item>
            <Descriptions.Item label="描述" span={2}>
              {store.description}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Card>

      <Card
        title="房型管理"
        style={{ marginTop: 16 }}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setRoomVisible(true)}>
            新增房型
          </Button>
        }
      >
        <Table
          rowKey="id"
          columns={roomColumns}
          dataSource={rooms}
          expandable={{ expandedRowRender }}
          pagination={false}
        />
      </Card>

      <Modal
        title="编辑门店"
        open={editVisible}
        onCancel={() => setEditVisible(false)}
        onOk={() => editForm.submit()}
        width={640}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditSubmit}>
          <Form.Item name="name" label="门店名称">
            <Input />
          </Form.Item>
          <Form.Item name="address" label="地址">
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="联系电话">
            <Input />
          </Form.Item>
          <Form.Item name="businessHours" label="营业时间">
            <Input />
          </Form.Item>
          <Form.Item name="nearbyTransport" label="附近交通">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="新增房型"
        open={roomVisible}
        onCancel={() => {
          setRoomVisible(false)
          roomForm.resetFields()
        }}
        onOk={() => roomForm.submit()}
        width={640}
      >
        <Form form={roomForm} layout="vertical" onFinish={handleCreateRoom}>
          <Form.Item name="name" label="房型名称" rules={[{ required: true, message: '请输入房型名称' }]}>
            <Input />
          </Form.Item>
          <Space style={{ display: 'flex' }}>
            <Form.Item name="type" label="类型" rules={[{ required: true, message: '请选择类型' }]}>
              <Select style={{ width: 150 }}>
                {Object.entries(ROOM_TYPE_MAP).map(([key, label]) => (
                  <Select.Option key={key} value={key}>
                    {label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="bedCount" label="床位数" rules={[{ required: true, message: '请输入床位数' }]}>
              <InputNumber min={1} />
            </Form.Item>
            <Form.Item name="area" label="面积(m²)" rules={[{ required: true, message: '请输入面积' }]}>
              <InputNumber min={1} />
            </Form.Item>
          </Space>
          <Space style={{ display: 'flex' }}>
            <Form.Item name="price" label="基准价格" rules={[{ required: true, message: '请输入价格' }]}>
              <InputNumber min={0} prefix="¥" />
            </Form.Item>
            <Form.Item name="originalPrice" label="原价">
              <InputNumber min={0} prefix="¥" />
            </Form.Item>
            <Form.Item name="weekendPrice" label="周末价">
              <InputNumber min={0} prefix="¥" />
            </Form.Item>
          </Space>
          <Form.Item name="floor" label="楼层">
            <Input />
          </Form.Item>
          <Form.Item name="autoGenerateBeds" label="自动生成床位" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default StoreDetail
