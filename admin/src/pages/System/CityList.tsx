import React, { useEffect, useState } from 'react'
import { Table, Button, Space, Tag, Card, Modal, Form, Input, Switch, InputNumber, message, Popconfirm } from 'antd'
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { systemApi } from '@/services/system'

const CityList: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any[]>([])
  const [visible, setVisible] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form] = Form.useForm()

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await systemApi.getCities()
      setData(res || [])
    } catch {
      /* handled */
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (values: any) => {
    try {
      if (editingId) {
        await systemApi.updateCity(editingId, values)
        message.success('更新成功')
      } else {
        await systemApi.createCity(values)
        message.success('创建成功')
      }
      setVisible(false)
      setEditingId(null)
      form.resetFields()
      fetchData()
    } catch {
      /* handled */
    }
  }

  const handleEdit = (record: any) => {
    setEditingId(record.id)
    form.setFieldsValue(record)
    setVisible(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await systemApi.deleteCity(id)
      message.success('删除成功')
      fetchData()
    } catch {
      /* handled */
    }
  }

  const columns = [
    { title: '城市编码', dataIndex: 'code', width: 120 },
    { title: '城市名称', dataIndex: 'name', width: 150 },
    { title: '首字母', dataIndex: 'letter', width: 80 },
    {
      title: '是否热门',
      dataIndex: 'isHot',
      width: 100,
      render: (v: boolean) => (v ? <Tag color="red">热门</Tag> : <Tag>普通</Tag>),
    },
    { title: '排序', dataIndex: 'sortOrder', width: 80 },
    {
      title: '操作',
      width: 160,
      render: (_: any, record: any) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record.id)}>
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
      <Card
        title="城市管理"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingId(null)
              form.resetFields()
              setVisible(true)
            }}
          >
            新增城市
          </Button>
        }
      >
        <Table rowKey="id" loading={loading} columns={columns} dataSource={data} pagination={false} />
      </Card>

      <Modal
        title={editingId ? '编辑城市' : '新增城市'}
        open={visible}
        onCancel={() => {
          setVisible(false)
          setEditingId(null)
          form.resetFields()
        }}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {!editingId && (
            <Form.Item name="code" label="城市编码" rules={[{ required: true, message: '请输入城市编码' }]}>
              <Input placeholder="如: 310000" />
            </Form.Item>
          )}
          <Form.Item name="name" label="城市名称" rules={[{ required: true, message: '请输入城市名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="letter" label="首字母" rules={[{ required: true, message: '请输入首字母' }]}>
            <Input maxLength={1} style={{ width: 80 }} />
          </Form.Item>
          <Form.Item name="isHot" label="是否热门" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="sortOrder" label="排序">
            <InputNumber min={0} style={{ width: 120 }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default CityList
