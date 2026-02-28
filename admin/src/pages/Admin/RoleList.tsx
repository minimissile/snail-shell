import React, { useEffect, useState } from 'react'
import { Table, Button, Space, Card, Modal, Form, Input, Checkbox, message, Tag, Collapse } from 'antd'
import { PlusOutlined, EditOutlined } from '@ant-design/icons'
import { adminUserApi } from '@/services/adminUser'

const RoleList: React.FC = () => {
  const [roles, setRoles] = useState<any[]>([])
  const [permissions, setPermissions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [createVisible, setCreateVisible] = useState(false)
  const [permVisible, setPermVisible] = useState(false)
  const [currentRole, setCurrentRole] = useState<any>(null)
  const [selectedPermIds, setSelectedPermIds] = useState<string[]>([])
  const [form] = Form.useForm()

  const fetchRoles = async () => {
    setLoading(true)
    try {
      const res = await adminUserApi.getRoles()
      setRoles(res || [])
    } catch {
      /* handled */
    } finally {
      setLoading(false)
    }
  }

  const fetchPermissions = async () => {
    try {
      const res = await adminUserApi.getPermissions()
      setPermissions(res?.list || res || [])
    } catch {
      /* handled */
    }
  }

  useEffect(() => {
    fetchRoles()
    fetchPermissions()
  }, [])

  const handleCreate = async (values: any) => {
    try {
      await adminUserApi.createRole(values)
      message.success('创建成功')
      setCreateVisible(false)
      form.resetFields()
      fetchRoles()
    } catch {
      /* handled */
    }
  }

  const openPermModal = (role: any) => {
    setCurrentRole(role)
    const existingPermIds = (role.permissions || []).map((p: any) => p.permissionId || p.id)
    setSelectedPermIds(existingPermIds)
    setPermVisible(true)
  }

  const handleUpdatePermissions = async () => {
    if (!currentRole) return
    try {
      await adminUserApi.updateRolePermissions(currentRole.id, selectedPermIds)
      message.success('权限更新成功')
      setPermVisible(false)
      fetchRoles()
    } catch {
      /* handled */
    }
  }

  // Group permissions by module
  const groupedPermissions = permissions.reduce((acc: Record<string, any[]>, perm: any) => {
    const module = perm.module || 'other'
    if (!acc[module]) acc[module] = []
    acc[module].push(perm)
    return acc
  }, {})

  const MODULE_NAMES: Record<string, string> = {
    dashboard: '数据看板',
    store: '门店管理',
    order: '订单管理',
    user: '用户管理',
    coupon: '优惠券管理',
    system: '系统配置',
    admin: '权限管理',
    other: '其他',
  }

  const columns = [
    { title: '角色名称', dataIndex: 'name', width: 150 },
    { title: '角色编码', dataIndex: 'code', width: 150 },
    { title: '描述', dataIndex: 'description', ellipsis: true },
    {
      title: '权限数',
      dataIndex: 'permissions',
      width: 100,
      render: (perms: any[]) => <Tag color="blue">{(perms || []).length} 个</Tag>,
    },
    {
      title: '操作',
      width: 150,
      render: (_: any, record: any) => (
        <Button size="small" icon={<EditOutlined />} onClick={() => openPermModal(record)}>
          配置权限
        </Button>
      ),
    },
  ]

  return (
    <div>
      <Card
        title="角色管理"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              form.resetFields()
              setCreateVisible(true)
            }}
          >
            新增角色
          </Button>
        }
      >
        <Table rowKey="id" loading={loading} columns={columns} dataSource={roles} pagination={false} />
      </Card>

      <Modal
        title="新增角色"
        open={createVisible}
        onCancel={() => {
          setCreateVisible(false)
          form.resetFields()
        }}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="name" label="角色名称" rules={[{ required: true, message: '请输入角色名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label="角色编码" rules={[{ required: true, message: '请输入角色编码' }]}>
            <Input placeholder="如: STORE_MANAGER" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`配置权限 - ${currentRole?.name}`}
        open={permVisible}
        onCancel={() => setPermVisible(false)}
        onOk={handleUpdatePermissions}
        width={700}
      >
        <Checkbox.Group
          value={selectedPermIds}
          onChange={(values) => setSelectedPermIds(values as string[])}
          style={{ width: '100%' }}
        >
          <Collapse
            defaultActiveKey={Object.keys(groupedPermissions)}
            items={Object.entries(groupedPermissions).map(([module, perms]) => ({
              key: module,
              label: (
                <Space>
                  <span>{MODULE_NAMES[module] || module}</span>
                  <Tag>{(perms as any[]).length} 个权限</Tag>
                </Space>
              ),
              children: (
                <Space wrap>
                  {(perms as any[]).map((perm: any) => (
                    <Checkbox key={perm.id} value={perm.id}>
                      {perm.name} ({perm.code})
                    </Checkbox>
                  ))}
                </Space>
              ),
            }))}
          />
        </Checkbox.Group>
      </Modal>
    </div>
  )
}

export default RoleList
