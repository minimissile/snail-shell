import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Descriptions, Tag, Button, Space, Modal, Input, message, Divider } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { orderApi } from '@/services/order'
import { ORDER_STATUS_MAP } from '@/utils/constants'
import dayjs from 'dayjs'

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [refundVisible, setRefundVisible] = useState(false)
  const [refundAction, setRefundAction] = useState<'approve' | 'reject'>('approve')
  const [refundReason, setRefundReason] = useState('')
  const [refundLoading, setRefundLoading] = useState(false)

  const fetchOrder = async () => {
    if (!id) return
    setLoading(true)
    try {
      const res = await orderApi.getOrder(id)
      setOrder(res)
    } catch {
      /* handled */
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrder()
  }, [id])

  const handleRefund = async () => {
    setRefundLoading(true)
    try {
      await orderApi.handleRefund(id!, {
        action: refundAction,
        reason: refundAction === 'reject' ? refundReason : undefined,
      })
      message.success(refundAction === 'approve' ? '退款已通过' : '退款已拒绝')
      setRefundVisible(false)
      setRefundReason('')
      fetchOrder()
    } catch {
      /* handled */
    } finally {
      setRefundLoading(false)
    }
  }

  const statusItem = order ? ORDER_STATUS_MAP[order.status] : null

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/orders')} style={{ marginBottom: 16 }}>
        返回列表
      </Button>

      <Card loading={loading} title="订单详情">
        {order && (
          <>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="订单号">{order.orderNo}</Descriptions.Item>
              <Descriptions.Item label="状态">
                {statusItem ? <Tag color={statusItem.color}>{statusItem.text}</Tag> : order.status}
              </Descriptions.Item>
              <Descriptions.Item label="门店">{order.store?.name}</Descriptions.Item>
              <Descriptions.Item label="房型">{order.room?.name}</Descriptions.Item>
              <Descriptions.Item label="床位">{order.bed?.bedNo}</Descriptions.Item>
              <Descriptions.Item label="入住人">{order.guest?.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="入住日期">
                {order.checkInDate ? dayjs(order.checkInDate).format('YYYY-MM-DD') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="退房日期">
                {order.checkOutDate ? dayjs(order.checkOutDate).format('YYYY-MM-DD') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="入住天数">{order.days || '-'}</Descriptions.Item>
              <Descriptions.Item label="原价">¥{(order.totalPrice || 0).toFixed(2)}</Descriptions.Item>
              <Descriptions.Item label="实付金额">
                <span style={{ color: '#f5222d', fontWeight: 600 }}>¥{(order.finalPrice || 0).toFixed(2)}</span>
              </Descriptions.Item>
              <Descriptions.Item label="优惠金额">¥{(order.discountAmount || 0).toFixed(2)}</Descriptions.Item>
              <Descriptions.Item label="下单时间">
                {order.createdAt ? dayjs(order.createdAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="支付时间">
                {order.paidAt ? dayjs(order.paidAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
              </Descriptions.Item>
            </Descriptions>

            {order.status === 'REFUNDING' && (
              <>
                <Divider />
                <Card title="退款处理" type="inner">
                  <Descriptions column={1}>
                    <Descriptions.Item label="退款原因">{order.refundReason || '-'}</Descriptions.Item>
                    <Descriptions.Item label="退款金额">
                      ¥{(order.refundAmount || order.finalPrice || 0).toFixed(2)}
                    </Descriptions.Item>
                  </Descriptions>
                  <Space style={{ marginTop: 16 }}>
                    <Button
                      type="primary"
                      onClick={() => {
                        setRefundAction('approve')
                        setRefundVisible(true)
                      }}
                    >
                      同意退款
                    </Button>
                    <Button
                      danger
                      onClick={() => {
                        setRefundAction('reject')
                        setRefundVisible(true)
                      }}
                    >
                      拒绝退款
                    </Button>
                  </Space>
                </Card>
              </>
            )}

            {order.remark && (
              <>
                <Divider />
                <Descriptions column={1}>
                  <Descriptions.Item label="备注">{order.remark}</Descriptions.Item>
                </Descriptions>
              </>
            )}
          </>
        )}
      </Card>

      <Modal
        title={refundAction === 'approve' ? '确认同意退款' : '确认拒绝退款'}
        open={refundVisible}
        onCancel={() => {
          setRefundVisible(false)
          setRefundReason('')
        }}
        onOk={handleRefund}
        confirmLoading={refundLoading}
      >
        {refundAction === 'approve' ? (
          <p>确认同意该笔订单的退款申请？退款将原路返回。</p>
        ) : (
          <div>
            <p>请输入拒绝退款的原因：</p>
            <Input.TextArea
              rows={3}
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="请输入拒绝原因"
            />
          </div>
        )}
      </Modal>
    </div>
  )
}

export default OrderDetail
