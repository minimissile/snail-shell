import React, { useEffect, useState } from 'react'
import {
  Table,
  Button,
  Space,
  Tag,
  Card,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  DatePicker,
  Switch,
  message,
  Popconfirm,
  Drawer,
  Descriptions,
} from 'antd'
import { PlusOutlined, SearchOutlined, DeleteOutlined, SendOutlined } from '@ant-design/icons'
import { couponApi } from '@/services/coupon'
import { COUPON_TYPE_MAP, MEMBER_LEVEL_MAP } from '@/utils/constants'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

const CouponList: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [params, setParams] = useState<any>({ page: 1, pageSize: 10 })
  const [createVisible, setCreateVisible] = useState(false)
  const [distributeVisible, setDistributeVisible] = useState(false)
  const [currentId, setCurrentId] = useState('')
  const [form] = Form.useForm()
  const [distributeForm] = Form.useForm()
  const [validType, setValidType] = useState('FIXED')

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await couponApi.getTemplates(params)
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

  const handleCreate = async (values: any) => {
    const submitData = { ...values }
    if (values.dateRange) {
      submitData.validFrom = values.dateRange[0].format('YYYY-MM-DD')
      submitData.validTo = values.dateRange[1].format('YYYY-MM-DD')
      delete submitData.dateRange
    }
    try {
      await couponApi.createTemplate(submitData)
      message.success('创建成功')
      setCreateVisible(false)
      form.resetFields()
      fetchData()
    } catch {
      /* handled */
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await couponApi.deleteTemplate(id)
      message.success('删除成功')
      fetchData()
    } catch {
      /* handled */
    }
  }

  const handleStatusChange = async (id: string, checked: boolean) => {
    try {
      await couponApi.updateTemplateStatus(id, checked ? 'ACTIVE' : 'INACTIVE')
      message.success('状态更新成功')
      fetchData()
    } catch {
      /* handled */
    }
  }

  const handleDistribute = async (values: any) => {
    try {
      const submitData: any = {}
      if (values.allUsers) {
        submitData.allUsers = true
      } else if (values.memberLevel) {
        submitData.memberLevel = values.memberLevel
      } else if (values.phones) {
        submitData.phones = values.phones
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean)
      } else if (values.userIds) {
        submitData.userIds = values.userIds
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean)
      }
      await couponApi.distribute(currentId, submitData)
      message.success('发放成功')
      setDistributeVisible(false)
      distributeForm.resetFields()
    } catch {
      /* handled */
    }
  }

  const columns = [
    { title: '名称', dataIndex: 'name', width: 180 },
    {
      title: '类型',
      dataIndex: 'type',
      width: 100,
      render: (t: string) => COUPON_TYPE_MAP[t] || t,
    },
    {
      title: '优惠',
      width: 120,
      render: (_: any, record: any) => {
        if (record.type === 'DISCOUNT') return `满${record.minAmount}减${record.amount}`
        if (record.type === 'RATE') return `${(record.discountRate * 10).toFixed(1)}折`
        if (record.type === 'CASH') return `¥${record.amount}`
        return '-'
      },
    },
    {
      title: '有效期',
      width: 200,
      render: (_: any, record: any) => {
        if (record.validType === 'FIXED') {
          return `${dayjs(record.validFrom).format('MM/DD')}-${dayjs(record.validTo).format('MM/DD')}`
        }
        return `领取后${record.validDays}天`
      },
    },
    {
      title: '已发/总量',
      width: 100,
      render: (_: any, record: any) => {
        const total = record.totalCount === -1 ? '不限' : record.totalCount
        return `${record.distributedCount || 0}/${total}`
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (status: string, record: any) => (
        <Switch
          size="small"
          checked={status === 'ACTIVE'}
          onChange={(checked) => handleStatusChange(record.id, checked)}
        />
      ),
    },
    {
      title: '操作',
      width: 180,
      render: (_: any, record: any) => (
        <Space>
          <Button
            size="small"
            icon={<SendOutlined />}
            onClick={() => {
              setCurrentId(record.id)
              setDistributeVisible(true)
            }}
          >
            发放
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
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Select
            placeholder="优惠券类型"
            allowClear
            value={params.type}
            onChange={(v) => setParams((p: any) => ({ ...p, type: v }))}
            style={{ width: 130 }}
          >
            {Object.entries(COUPON_TYPE_MAP).map(([key, label]) => (
              <Select.Option key={key} value={key}>
                {label}
              </Select.Option>
            ))}
          </Select>
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            搜索
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateVisible(true)}>
            新增模板
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

      <Modal
        title="新增优惠券模板"
        open={createVisible}
        onCancel={() => {
          setCreateVisible(false)
          form.resetFields()
        }}
        onOk={() => form.submit()}
        width={640}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Space style={{ display: 'flex' }}>
            <Form.Item name="type" label="类型" rules={[{ required: true, message: '请选择类型' }]}>
              <Select style={{ width: 150 }}>
                {Object.entries(COUPON_TYPE_MAP).map(([key, label]) => (
                  <Select.Option key={key} value={key}>
                    {label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="amount" label="优惠金额">
              <InputNumber min={0} prefix="¥" />
            </Form.Item>
            <Form.Item name="discountRate" label="折扣率">
              <InputNumber min={0.1} max={0.99} step={0.05} />
            </Form.Item>
          </Space>
          <Form.Item name="minAmount" label="最低消费">
            <InputNumber min={0} prefix="¥" style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="validType" label="有效期类型" rules={[{ required: true }]}>
            <Select onChange={(v) => setValidType(v)} style={{ width: 200 }}>
              <Select.Option value="FIXED">固定时间</Select.Option>
              <Select.Option value="DAYS">领取后N天</Select.Option>
            </Select>
          </Form.Item>
          {validType === 'FIXED' ? (
            <Form.Item name="dateRange" label="有效日期范围">
              <RangePicker />
            </Form.Item>
          ) : (
            <Form.Item name="validDays" label="有效天数">
              <InputNumber min={1} style={{ width: 200 }} />
            </Form.Item>
          )}
          <Space style={{ display: 'flex' }}>
            <Form.Item name="totalCount" label="总数量" extra="-1表示不限">
              <InputNumber min={-1} style={{ width: 150 }} />
            </Form.Item>
            <Form.Item name="perUserLimit" label="每人限领">
              <InputNumber min={1} style={{ width: 150 }} />
            </Form.Item>
          </Space>
        </Form>
      </Modal>

      <Modal
        title="发放优惠券"
        open={distributeVisible}
        onCancel={() => {
          setDistributeVisible(false)
          distributeForm.resetFields()
        }}
        onOk={() => distributeForm.submit()}
      >
        <Form form={distributeForm} layout="vertical" onFinish={handleDistribute}>
          <Form.Item name="allUsers" label="发放给全部用户" valuePropName="checked">
            <Switch checkedChildren="是" unCheckedChildren="否" />
          </Form.Item>
          <Form.Item name="memberLevel" label="按会员等级发放" extra="选择等级后会发放给该等级所有用户">
            <Select allowClear placeholder="选择会员等级">
              {Object.entries(MEMBER_LEVEL_MAP).map(([key, val]) => (
                <Select.Option key={key} value={key}>
                  {val.text}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="phones" label="按手机号发放" extra="多个手机号用逗号分隔">
            <Input.TextArea rows={3} placeholder="输入手机号，逗号分隔，如：13800138000,13900139000" />
          </Form.Item>
          <Form.Item name="userIds" label="按用户ID发放" extra="多个ID用逗号分隔">
            <Input.TextArea rows={3} placeholder="输入用户ID，逗号分隔" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default CouponList
