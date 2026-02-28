import React, { useEffect, useState } from 'react'
import { Table, Tag, Card, Select, Space, Modal, Form, Input, Button, Image, message } from 'antd'
import { systemApi } from '@/services/system'
import dayjs from 'dayjs'

const FEEDBACK_TYPE_MAP: Record<string, { text: string; color: string }> = {
  SUGGESTION: { text: '建议', color: 'blue' },
  COMPLAINT: { text: '投诉', color: 'orange' },
  BUG: { text: 'Bug', color: 'red' },
  OTHER: { text: '其他', color: 'default' },
}

const FEEDBACK_STATUS_MAP: Record<string, { text: string; color: string }> = {
  PENDING: { text: '待处理', color: 'default' },
  PROCESSING: { text: '处理中', color: 'processing' },
  RESOLVED: { text: '已解决', color: 'success' },
}

const FeedbackList: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [params, setParams] = useState<any>({ page: 1, pageSize: 10 })
  const [replyVisible, setReplyVisible] = useState(false)
  const [currentFeedback, setCurrentFeedback] = useState<any>(null)
  const [form] = Form.useForm()

  const fetchData = async () => {
    setLoading(true)
    try {
      const query = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null)
      )
      const res = await systemApi.getFeedbacks(query)
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

  const handleReply = async (values: any) => {
    try {
      await systemApi.replyFeedback(currentFeedback.id, values)
      message.success('回复成功')
      setReplyVisible(false)
      form.resetFields()
      fetchData()
    } catch {
      /* handled */
    }
  }

  const columns = [
    {
      title: '用户',
      width: 150,
      render: (_: any, record: any) => (
        <Space>
          <img
            src={record.user?.avatar || 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png'}
            alt=""
            style={{ width: 28, height: 28, borderRadius: '50%' }}
          />
          <span>{record.user?.nickname || record.user?.phone || '-'}</span>
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 80,
      render: (t: string) => {
        const item = FEEDBACK_TYPE_MAP[t]
        return item ? <Tag color={item.color}>{item.text}</Tag> : t
      },
    },
    {
      title: '内容',
      dataIndex: 'content',
      ellipsis: true,
    },
    {
      title: '联系方式',
      dataIndex: 'contact',
      width: 140,
      render: (v: string) => v || '-',
    },
    {
      title: '图片',
      dataIndex: 'images',
      width: 100,
      render: (images: string[] | string) => {
        const list: string[] = Array.isArray(images) ? images : (() => { try { return JSON.parse(images || '[]') } catch { return [] } })()
        if (!list || list.length === 0) return '-'
        return (
          <Image.PreviewGroup>
            <Space>
              {list.slice(0, 3).map((url, i) => (
                <Image key={i} src={url} width={32} height={32} style={{ objectFit: 'cover', borderRadius: 4 }} />
              ))}
              {list.length > 3 && <span>+{list.length - 3}</span>}
            </Space>
          </Image.PreviewGroup>
        )
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (s: string) => {
        const item = FEEDBACK_STATUS_MAP[s]
        return item ? <Tag color={item.color}>{item.text}</Tag> : s
      },
    },
    {
      title: '回复',
      dataIndex: 'reply',
      width: 180,
      ellipsis: true,
      render: (v: string) => v || '-',
    },
    {
      title: '提交时间',
      dataIndex: 'createdAt',
      width: 160,
      render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '操作',
      width: 80,
      render: (_: any, record: any) => (
        <Button
          size="small"
          type="primary"
          onClick={() => {
            setCurrentFeedback(record)
            form.setFieldsValue({
              reply: record.reply || '',
              status: record.status === 'RESOLVED' ? 'RESOLVED' : 'RESOLVED',
            })
            setReplyVisible(true)
          }}
        >
          {record.reply ? '修改' : '回复'}
        </Button>
      ),
    },
  ]

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Select
            placeholder="反馈类型"
            allowClear
            value={params.type}
            onChange={(v) => setParams((p: any) => ({ ...p, type: v }))}
            style={{ width: 120 }}
          >
            {Object.entries(FEEDBACK_TYPE_MAP).map(([key, val]) => (
              <Select.Option key={key} value={key}>{val.text}</Select.Option>
            ))}
          </Select>
          <Select
            placeholder="处理状态"
            allowClear
            value={params.status}
            onChange={(v) => setParams((p: any) => ({ ...p, status: v }))}
            style={{ width: 120 }}
          >
            {Object.entries(FEEDBACK_STATUS_MAP).map(([key, val]) => (
              <Select.Option key={key} value={key}>{val.text}</Select.Option>
            ))}
          </Select>
          <Button type="primary" onClick={handleSearch}>搜索</Button>
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

      <Modal
        title="回复反馈"
        open={replyVisible}
        onCancel={() => {
          setReplyVisible(false)
          form.resetFields()
        }}
        onOk={() => form.submit()}
      >
        {currentFeedback && (
          <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
            <div style={{ marginBottom: 4 }}>
              <Tag color={FEEDBACK_TYPE_MAP[currentFeedback.type]?.color}>
                {FEEDBACK_TYPE_MAP[currentFeedback.type]?.text}
              </Tag>
              <span style={{ color: '#999', fontSize: 12 }}>
                {dayjs(currentFeedback.createdAt).format('YYYY-MM-DD HH:mm')}
              </span>
            </div>
            <div>{currentFeedback.content}</div>
          </div>
        )}
        <Form form={form} layout="vertical" onFinish={handleReply}>
          <Form.Item name="reply" label="回复内容" rules={[{ required: true, message: '请输入回复' }]}>
            <Input.TextArea rows={4} placeholder="请输入回复内容" />
          </Form.Item>
          <Form.Item name="status" label="处理状态" initialValue="RESOLVED">
            <Select>
              {Object.entries(FEEDBACK_STATUS_MAP).map(([key, val]) => (
                <Select.Option key={key} value={key}>{val.text}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default FeedbackList
