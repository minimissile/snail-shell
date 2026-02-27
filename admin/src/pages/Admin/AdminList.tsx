import React, { useEffect, useState } from 'react'
import { Table, Button, Space, Tag, Card, Modal, Form, Input, Select, message, Popconfirm } from 'antd'
import { PlusOutlined, DeleteOutlined, EditOutlined, KeyOutlined } from '@ant-design/icons'
import { adminUserApi } from '@/services/adminUser'

const AdminList: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [params, setParams] = useState<any>({ page: 1, pageSize: 10 })
  const [createVisible, setCreateVisible] = useState(false)
  const [roleVisible, setRoleVisible] = useState(false)
  const [currentAdmin, setCurrentAdmin] = useState<any>(null)
  const [roles, setRoles] = useState<any[]>([])
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([])
  const [form] = Form.useForm()

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await adminUserApi.getAdmins(params)
      setData(res.list || [])
      setTotal(res.total || 0)
    } catch {
      /* handled */
    } finally {
      setLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const res = await adminUserApi.getRoles()
      setRoles(res || [])
    } catch {
      /* handled */
    }
  }

  useEffect(() => {
    fetchData()
    fetchRoles()
  }, [params.page, params.pageSize])

  const handleSearch = () => {
    setParams((prev: any) => ({ ...prev, page: 1 }))
    fetchData()
  }

  const handleCreate = async (values: any) => {
    try {
      await adminUserApi.createAdmin(values)
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
      await adminUserApi.deleteAdmin(id)
      message.success('删除成功')
      fetchData()
    } catch {
      /* handled */
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await adminUserApi.updateAdminStatus(id, status)
      message.success('状态更新成功')
      fetchData()
    } catch {
      /* handled */
    }
  }

  const handleResetPassword = async (id: string) => {
    try {
      await adminUserApi.resetPassword(id)
      message.success('密码已重置为 123456')
    } catch {
      /* handled */
    }
  }

  const openRoleModal = (record: any) => {
    setCurrentAdmin(record)
    setSelectedRoleIds((record.roles || []).map((r: any) => r.roleId || r.id))
    setRoleVisible(true)
  }

  const handleAssignRoles = async () => {
    if (!currentAdmin) return
    try {
      await adminUserApi.assignRoles(currentAdmin.id, selectedRoleIds)
      message.success('角色分配成功')
      setRoleVisible(false)
      fetchData()
    } catch {
      /* handled */
    }
  }

  const columns = [
    { title: '用户名', dataIndex: 'username', width: 120 },
    { title: '真实姓名', dataIndex: 'realName', width: 120 },
    { title: '手机号', dataIndex: 'phone', width: 130 },
    { title: '邮箱', dataIndex: 'email', width: 180 },
    {
      title: '角色',
      dataIndex: 'roles',
      width: 200,
      render: (roles: any[]) => (
        <Space wrap>
          {(roles || []).map((r: any) => (
            <Tag key={r.roleId || r.id} color="blue">
              {r.role?.name || r.name || r.roleId}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (status: string) => (
        <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>{status === 'ACTIVE' ? '启用' : '禁用'}</Tag>
      ),
    },
    {
      title: '操作',
      width: 300,
      render: (_: any, record: any) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openRoleModal(record)}>
            分配角色
          </Button>
          {record.status === 'ACTIVE' ? (
            <Button size="small" onClick={() => handleStatusChange(record.id, 'DISABLED')}>
              禁用
            </Button>
          ) : (
            <Button size="small" type="primary" onClick={() => handleStatusChange(record.id, 'ACTIVE')}>
              启用
            </Button>
          )}
          <Popconfirm title="确定重置密码为 123456?" onConfirm={() => handleResetPassword(record.id)}>
            <Button size="small" icon={<KeyOutlined />}>
              重置密码
            </Button>
          </Popconfirm>
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
          <Input
            placeholder="搜索用户名/姓名"
            value={params.keyword}
            onChange={(e) => setParams((p: any) => ({ ...p, keyword: e.target.value }))}
            onPressEnter={handleSearch}
            style={{ width: 200 }}
          />
          <Button type="primary" onClick={handleSearch}>
            搜索
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateVisible(true)}>
            新增管理员
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
        title="新增管理员"
        open={createVisible}
        onCancel={() => {
          setCreateVisible(false)
          form.resetFields()
        }}
        onOk={() => form.submit()}
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6位' },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item name="realName" label="真实姓名" rules={[{ required: true, message: '请输入真实姓名' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="手机号">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input />
          </Form.Item>
          <Form.Item name="roleIds" label="角色">
            <Select mode="multiple" placeholder="选择角色">
              {roles.map((role: any) => (
                <Select.Option key={role.id} value={role.id}>
                  {role.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="分配角色" open={roleVisible} onCancel={() => setRoleVisible(false)} onOk={handleAssignRoles}>
        <p>
          管理员: {currentAdmin?.realName} ({currentAdmin?.username})
        </p>
        <Select
          mode="multiple"
          value={selectedRoleIds}
          onChange={setSelectedRoleIds}
          style={{ width: '100%' }}
          placeholder="选择角色"
        >
          {roles.map((role: any) => (
            <Select.Option key={role.id} value={role.id}>
              {role.name}
            </Select.Option>
          ))}
        </Select>
      </Modal>
    </div>
  )
}

export default AdminList
