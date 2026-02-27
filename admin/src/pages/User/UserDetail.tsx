import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Space,
  Divider,
  Modal,
  Form,
  InputNumber,
  Input,
  Select,
  message,
  Statistic,
  Row,
  Col,
} from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { userApi } from '@/services/user'
import { MEMBER_LEVEL_MAP } from '@/utils/constants'
import dayjs from 'dayjs'

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [levelVisible, setLevelVisible] = useState(false)
  const [pointsVisible, setPointsVisible] = useState(false)
  const [balanceVisible, setBalanceVisible] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState('')
  const [pointsForm] = Form.useForm()
  const [balanceForm] = Form.useForm()

  const fetchUser = async () => {
    if (!id) return
    setLoading(true)
    try {
      const res = await userApi.getUser(id)
      setUser(res)
    } catch {
      /* handled */
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [id])

  const handleLevelChange = async () => {
    try {
      await userApi.updateMemberLevel(id!, selectedLevel)
      message.success('会员等级更新成功')
      setLevelVisible(false)
      fetchUser()
    } catch {
      /* handled */
    }
  }

  const handlePointsAdjust = async (values: { amount: number; reason: string }) => {
    try {
      await userApi.adjustPoints(id!, values)
      message.success('积分调整成功')
      setPointsVisible(false)
      pointsForm.resetFields()
      fetchUser()
    } catch {
      /* handled */
    }
  }

  const handleBalanceAdjust = async (values: { amount: number; reason: string }) => {
    try {
      await userApi.adjustBalance(id!, values)
      message.success('余额调整成功')
      setBalanceVisible(false)
      balanceForm.resetFields()
      fetchUser()
    } catch {
      /* handled */
    }
  }

  const levelItem = user ? MEMBER_LEVEL_MAP[user.memberLevel] : null

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/users')} style={{ marginBottom: 16 }}>
        返回列表
      </Button>

      <Card loading={loading} title="用户信息">
        {user && (
          <>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="头像">
                <img
                  src={
                    user.avatarUrl || 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png'
                  }
                  alt=""
                  style={{ width: 48, height: 48, borderRadius: '50%' }}
                />
              </Descriptions.Item>
              <Descriptions.Item label="昵称">{user.nickname || '-'}</Descriptions.Item>
              <Descriptions.Item label="手机号">{user.phone || '-'}</Descriptions.Item>
              <Descriptions.Item label="会员等级">
                <Space>
                  {levelItem ? <Tag color={levelItem.color}>{levelItem.text}</Tag> : user.memberLevel}
                  <Button
                    size="small"
                    type="link"
                    onClick={() => {
                      setSelectedLevel(user.memberLevel)
                      setLevelVisible(true)
                    }}
                  >
                    调整
                  </Button>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="注册时间">
                {user.createdAt ? dayjs(user.createdAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="最后登录">
                {user.lastLoginAt ? dayjs(user.lastLoginAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Row gutter={24}>
              <Col span={8}>
                <Card>
                  <Statistic title="积分" value={user.points || 0} />
                  <Button
                    size="small"
                    type="link"
                    style={{ padding: 0, marginTop: 8 }}
                    onClick={() => setPointsVisible(true)}
                  >
                    调整积分
                  </Button>
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic title="余额" value={user.balance || 0} precision={2} prefix="¥" />
                  <Button
                    size="small"
                    type="link"
                    style={{ padding: 0, marginTop: 8 }}
                    onClick={() => setBalanceVisible(true)}
                  >
                    调整余额
                  </Button>
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic title="订单数" value={user._count?.orders || 0} />
                </Card>
              </Col>
            </Row>

            {user.guests && user.guests.length > 0 && (
              <>
                <Divider />
                <Card title="入住人信息" type="inner">
                  {user.guests.map((guest: any) => (
                    <Descriptions key={guest.id} column={3} size="small" style={{ marginBottom: 8 }}>
                      <Descriptions.Item label="姓名">{guest.name}</Descriptions.Item>
                      <Descriptions.Item label="证件号">{guest.idNumber || '-'}</Descriptions.Item>
                      <Descriptions.Item label="手机号">{guest.phone || '-'}</Descriptions.Item>
                    </Descriptions>
                  ))}
                </Card>
              </>
            )}
          </>
        )}
      </Card>

      <Modal title="调整会员等级" open={levelVisible} onCancel={() => setLevelVisible(false)} onOk={handleLevelChange}>
        <Select value={selectedLevel} onChange={setSelectedLevel} style={{ width: '100%' }}>
          {Object.entries(MEMBER_LEVEL_MAP).map(([key, val]) => (
            <Select.Option key={key} value={key}>
              {val.text}
            </Select.Option>
          ))}
        </Select>
      </Modal>

      <Modal
        title="调整积分"
        open={pointsVisible}
        onCancel={() => {
          setPointsVisible(false)
          pointsForm.resetFields()
        }}
        onOk={() => pointsForm.submit()}
      >
        <Form form={pointsForm} layout="vertical" onFinish={handlePointsAdjust}>
          <Form.Item
            name="amount"
            label="调整数量"
            rules={[{ required: true, message: '请输入数量' }]}
            extra="正数为增加，负数为扣减"
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="reason" label="原因" rules={[{ required: true, message: '请输入原因' }]}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="调整余额"
        open={balanceVisible}
        onCancel={() => {
          setBalanceVisible(false)
          balanceForm.resetFields()
        }}
        onOk={() => balanceForm.submit()}
      >
        <Form form={balanceForm} layout="vertical" onFinish={handleBalanceAdjust}>
          <Form.Item
            name="amount"
            label="调整金额"
            rules={[{ required: true, message: '请输入金额' }]}
            extra="正数为增加，负数为扣减"
          >
            <InputNumber style={{ width: '100%' }} prefix="¥" />
          </Form.Item>
          <Form.Item name="reason" label="原因" rules={[{ required: true, message: '请输入原因' }]}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default UserDetail
