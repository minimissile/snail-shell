import React, { useEffect, useState } from 'react'
import { Card, Form, Input, Button, message, Space, Divider, List, Modal } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { systemApi } from '@/services/system'

interface Banner {
  imageUrl: string
  linkUrl?: string
  title?: string
}

const HomeConfig: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [banners, setBanners] = useState<Banner[]>([])
  const [hotTags, setHotTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [bannerForm] = Form.useForm()
  const [bannerVisible, setBannerVisible] = useState(false)

  const fetchConfig = async () => {
    setLoading(true)
    try {
      const res = await systemApi.getHomeConfig()
      setBanners(res.banners || [])
      setHotTags(res.hotTags || [])
    } catch {
      /* handled */
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConfig()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await systemApi.updateHomeConfig({ banners, hotTags })
      message.success('保存成功')
    } catch {
      /* handled */
    } finally {
      setSaving(false)
    }
  }

  const handleAddBanner = (values: Banner) => {
    setBanners((prev) => [...prev, values])
    setBannerVisible(false)
    bannerForm.resetFields()
  }

  const handleRemoveBanner = (index: number) => {
    setBanners((prev) => prev.filter((_, i) => i !== index))
  }

  const handleAddTag = () => {
    if (!tagInput.trim()) return
    if (hotTags.includes(tagInput.trim())) {
      message.warning('标签已存在')
      return
    }
    setHotTags((prev) => [...prev, tagInput.trim()])
    setTagInput('')
  }

  const handleRemoveTag = (index: number) => {
    setHotTags((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div>
      <Card
        title="首页配置"
        loading={loading}
        extra={
          <Button type="primary" loading={saving} onClick={handleSave}>
            保存配置
          </Button>
        }
      >
        <Divider orientation="left">Banner管理</Divider>
        <List
          dataSource={banners}
          locale={{ emptyText: '暂无Banner' }}
          renderItem={(item, index) => (
            <List.Item
              actions={[
                <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleRemoveBanner(index)}>
                  删除
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={item.title || `Banner ${index + 1}`}
                description={
                  <Space direction="vertical" size={0}>
                    <span>图片: {item.imageUrl}</span>
                    {item.linkUrl && <span>链接: {item.linkUrl}</span>}
                  </Space>
                }
              />
            </List.Item>
          )}
        />
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={() => setBannerVisible(true)}
          style={{ width: '100%', marginTop: 8 }}
        >
          添加Banner
        </Button>

        <Divider orientation="left" style={{ marginTop: 32 }}>
          热门标签
        </Divider>
        <Space wrap style={{ marginBottom: 8 }}>
          {hotTags.map((tag, index) => (
            <Card key={index} size="small" style={{ display: 'inline-block' }}>
              <Space>
                {tag}
                <Button
                  size="small"
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemoveTag(index)}
                />
              </Space>
            </Card>
          ))}
        </Space>
        <Space>
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onPressEnter={handleAddTag}
            placeholder="输入标签名"
            style={{ width: 200 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddTag}>
            添加
          </Button>
        </Space>
      </Card>

      <Modal
        title="添加Banner"
        open={bannerVisible}
        onCancel={() => {
          setBannerVisible(false)
          bannerForm.resetFields()
        }}
        onOk={() => bannerForm.submit()}
      >
        <Form form={bannerForm} layout="vertical" onFinish={handleAddBanner}>
          <Form.Item name="imageUrl" label="图片URL" rules={[{ required: true, message: '请输入图片URL' }]}>
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="linkUrl" label="跳转链接">
            <Input placeholder="选填" />
          </Form.Item>
          <Form.Item name="title" label="标题">
            <Input placeholder="选填" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default HomeConfig
