import React, { useEffect, useState } from 'react'
import { Card, Tabs, Form, Input, Button, message } from 'antd'
import { systemApi } from '@/services/system'

const AGREEMENT_TYPES = [
  { key: 'USER', label: '用户协议' },
  { key: 'PRIVACY', label: '隐私政策' },
  { key: 'BOOKING', label: '预订须知' },
]

const Agreement: React.FC = () => {
  const [activeType, setActiveType] = useState('USER')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()

  const fetchAgreement = async (type: string) => {
    setLoading(true)
    try {
      const res = await systemApi.getAgreement(type)
      form.setFieldsValue({
        title: res?.title || '',
        content: res?.content || '',
        version: res?.version || '1.0',
      })
    } catch {
      form.resetFields()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAgreement(activeType)
  }, [activeType])

  const handleSave = async (values: any) => {
    setSaving(true)
    try {
      await systemApi.updateAgreement(activeType, values)
      message.success('保存成功')
    } catch {
      /* handled */
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card title="协议管理">
      <Tabs
        activeKey={activeType}
        onChange={(key) => setActiveType(key)}
        items={AGREEMENT_TYPES.map((item) => ({
          key: item.key,
          label: item.label,
        }))}
      />

      <Form form={form} layout="vertical" onFinish={handleSave}>
        <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="version" label="版本号">
          <Input style={{ width: 120 }} />
        </Form.Item>
        <Form.Item name="content" label="内容" rules={[{ required: true, message: '请输入内容' }]}>
          <Input.TextArea rows={16} placeholder="支持HTML格式" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={saving || loading}>
            保存
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}

export default Agreement
