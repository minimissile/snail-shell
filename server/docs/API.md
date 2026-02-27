# 蜗壳小程序 API 接口文档

> Base URL: `https://api.snail-shell.com/v1`
> 认证方式: Bearer Token (JWT)

---

## 通用说明

### 请求头

```
Authorization: Bearer <token>
Content-Type: application/json
```

### 响应格式

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

### 错误码

| code | 说明       |
| ---- | ---------- |
| 0    | 成功       |
| 400  | 参数错误   |
| 401  | 未授权     |
| 403  | 禁止访问   |
| 404  | 资源不存在 |
| 500  | 服务器错误 |

### 分页参数

| 参数     | 类型   | 说明              |
| -------- | ------ | ----------------- |
| page     | number | 页码，从 1 开始   |
| pageSize | number | 每页数量，默认 10 |

### 分页响应

```json
{
  "list": [],
  "total": 100,
  "page": 1,
  "pageSize": 10,
  "totalPages": 10
}
```

---

## 一、认证模块 (Auth)

### 1.1 微信登录

```
POST /auth/wechat-login
```

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| code | string | 是 | 微信登录 code |

**响应**

```json
{
  "code": 0,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "user_123",
      "openId": "oXXXX",
      "nickname": "用户昵称",
      "avatar": "https://...",
      "phone": "138****8888",
      "memberLevel": "diamond",
      "isNewUser": false
    }
  }
}
```

### 1.2 获取手机号

```
POST /auth/phone
```

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| code | string | 是 | 手机号获取 code |

**响应**

```json
{
  "code": 0,
  "data": {
    "phone": "13888888888"
  }
}
```

### 1.3 刷新 Token

```
POST /auth/refresh-token
```

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| refreshToken | string | 是 | 刷新令牌 |

---

## 二、用户模块 (User)

### 2.1 获取用户信息

```
GET /user/profile
```

**响应**

```json
{
  "code": 0,
  "data": {
    "id": "user_123",
    "nickname": "蜗壳用户",
    "avatar": "https://...",
    "phone": "13888888888",
    "memberLevel": "diamond",
    "memberExpireAt": "2025-12-31",
    "points": 1200,
    "couponCount": 5,
    "favoriteCount": 12,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### 2.2 更新用户信息

```
PUT /user/profile
```

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| nickname | string | 否 | 昵称 |
| avatar | string | 否 | 头像 URL |

### 2.3 获取会员权益

```
GET /user/membership
```

**响应**

```json
{
  "code": 0,
  "data": {
    "level": "diamond",
    "levelName": "钻石会员",
    "expireAt": "2025-12-31",
    "benefits": [
      { "name": "房费折扣", "value": "9.5折" },
      { "name": "积分加倍", "value": "1.5倍" },
      { "name": "专属客服", "value": "是" }
    ],
    "nextLevel": {
      "name": "黑金会员",
      "requiredPoints": 5000,
      "currentPoints": 3200
    }
  }
}
```

### 2.4 获取积分明细

```
GET /user/points/records
```

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |
| type | string | 否 | 类型: earn/spend |

**响应**

```json
{
  "code": 0,
  "data": {
    "balance": 1200,
    "list": [
      {
        "id": "pr_001",
        "type": "earn",
        "amount": 100,
        "description": "订单完成奖励",
        "orderId": "order_123",
        "createdAt": "2024-06-01T10:00:00Z"
      }
    ],
    "total": 50,
    "page": 1,
    "pageSize": 10
  }
}
```

---

## 三、门店模块 (Store)

### 3.1 搜索门店列表

```
GET /stores
```

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | string | 否 | 搜索关键词 |
| cityCode | string | 否 | 城市编码 |
| district | string | 否 | 区域 |
| lng | number | 否 | 经度 |
| lat | number | 否 | 纬度 |
| checkInDate | string | 是 | 入住日期 YYYY-MM-DD |
| checkOutDate | string | 是 | 离店日期 YYYY-MM-DD |
| guestCount | number | 否 | 入住人数 |
| bedCount | number | 否 | 床位数 |
| minPrice | number | 否 | 最低价格 |
| maxPrice | number | 否 | 最高价格 |
| sortBy | string | 否 | 排序: popularity/distance/price |
| sortOrder | string | 否 | asc/desc |
| tags | string[] | 否 | 标签筛选: 实拍看房/自助入住/积分抵扣 |
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |

**响应**

```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "id": "store_001",
        "name": "蜗壳青旅·深圳北站店",
        "image": "https://...",
        "images": ["https://...", "https://..."],
        "imageCount": 25,
        "rating": 4.9,
        "ratingText": "超棒",
        "reviewCount": 328,
        "highlightComment": "位置好，干净整洁",
        "tags": ["平台验真", "限时特惠"],
        "features": ["独立卫浴", "智能门锁", "24H热水"],
        "details": "8人女生房 | 可住1人 | 14㎡",
        "location": {
          "address": "深圳市龙华区民治街道...",
          "district": "龙华区",
          "lng": 114.05,
          "lat": 22.62
        },
        "distance": 1.2,
        "price": 68,
        "originalPrice": 98,
        "savedAmount": 30,
        "memberDiscount": "钻石会员",
        "isFavorite": false
      }
    ],
    "total": 156,
    "page": 1,
    "pageSize": 10
  }
}
```

### 3.2 获取门店详情

```
GET /stores/:storeId
```

**响应**

```json
{
  "code": 0,
  "data": {
    "id": "store_001",
    "name": "蜗壳青旅·深圳北站店",
    "images": ["https://...", "https://..."],
    "videoUrl": "https://...",
    "rating": 4.9,
    "reviewCount": 328,
    "favoriteCount": 1256,
    "isFavorite": false,
    "location": {
      "address": "深圳市龙华区民治街道北站社区...",
      "district": "龙华区",
      "lng": 114.05,
      "lat": 22.62,
      "nearbyTransport": "距深圳北站步行5分钟"
    },
    "businessHours": "全天营业",
    "features": [
      { "icon": "wifi", "name": "免费WiFi" },
      { "icon": "parking", "name": "停车位" },
      { "icon": "breakfast", "name": "早餐服务" }
    ],
    "facilities": [
      { "category": "公共区域", "items": ["休息区", "自助厨房", "洗衣房"] },
      { "category": "房间设施", "items": ["空调", "独立卫浴", "热水器"] }
    ],
    "highlights": [
      { "title": "位置优越", "description": "地铁口步行3分钟" },
      { "title": "安全保障", "description": "24小时监控+智能门锁" }
    ],
    "landlord": {
      "id": "landlord_001",
      "name": "蜗壳官方",
      "avatar": "https://...",
      "responseRate": "98%",
      "responseTime": "5分钟内",
      "description": "专业青旅运营团队"
    },
    "rules": {
      "checkInTime": "14:00后",
      "checkOutTime": "12:00前",
      "cancelPolicy": "入住前24小时免费取消",
      "notices": ["禁止携带宠物", "禁止大声喧哗", "禁止做饭"]
    },
    "costRules": [
      { "title": "押金", "content": "入住时收取200元押金，退房后无损坏退还" },
      { "title": "水电费", "content": "包含在房费中" }
    ]
  }
}
```

### 3.3 获取门店房型列表

```
GET /stores/:storeId/rooms
```

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| checkInDate | string | 是 | 入住日期 |
| checkOutDate | string | 是 | 离店日期 |
| bookingMode | string | 否 | 预订方式: day/hour/month |

**响应**

```json
{
  "code": 0,
  "data": [
    {
      "id": "room_001",
      "name": "8人女生房",
      "type": "female_dorm",
      "image": "https://...",
      "images": ["https://...", "https://..."],
      "bedCount": 8,
      "availableBeds": 5,
      "area": 25,
      "floor": "3楼",
      "price": 68,
      "originalPrice": 98,
      "priceUnit": "晚",
      "hourPrice": 30,
      "monthPrice": 1500,
      "features": ["独立卫浴", "空调", "WiFi"],
      "packages": [
        { "type": "breakfast", "icon": "🍳", "name": "含早" },
        { "type": "cancel", "icon": "✓", "name": "免费取消" }
      ],
      "hasSmartLock": true
    }
  ]
}
```

### 3.4 获取床位状态

```
GET /stores/:storeId/rooms/:roomId/beds
```

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| checkInDate | string | 是 | 入住日期 |
| checkOutDate | string | 是 | 离店日期 |
| bookingMode | string | 否 | 预订方式 |
| startTime | string | 否 | 开始时间(小时订) |
| endTime | string | 否 | 结束时间(小时订) |

**响应**

```json
{
  "code": 0,
  "data": {
    "roomId": "room_001",
    "roomName": "8人女生房",
    "bedGroups": [
      {
        "id": "group_1",
        "beds": [
          { "id": "A1", "position": "top-left", "status": "available", "price": 68 },
          { "id": "A2", "position": "top-right", "status": "available", "price": 68 },
          { "id": "A3", "position": "bottom-left", "status": "unavailable", "price": 68 },
          { "id": "A4", "position": "bottom-right", "status": "available", "price": 68 }
        ]
      },
      {
        "id": "group_2",
        "beds": [
          { "id": "B1", "position": "top-left", "status": "available", "price": 68 },
          { "id": "B2", "position": "top-right", "status": "unavailable", "price": 68 },
          { "id": "B3", "position": "bottom-left", "status": "available", "price": 68 },
          { "id": "B4", "position": "bottom-right", "status": "available", "price": 68 }
        ]
      }
    ],
    "priceInfo": {
      "basePrice": 68,
      "weekendPrice": 88,
      "holidayPrice": 128
    }
  }
}
```

### 3.5 获取门店点评

```
GET /stores/:storeId/reviews
```

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |
| tag | string | 否 | 筛选标签: 好评/差评/有图 |

**响应**

```json
{
  "code": 0,
  "data": {
    "summary": {
      "averageRating": 4.9,
      "totalCount": 328,
      "ratingDistribution": {
        "5": 280,
        "4": 35,
        "3": 10,
        "2": 2,
        "1": 1
      },
      "tags": [
        { "name": "位置好", "count": 156 },
        { "name": "干净整洁", "count": 142 },
        { "name": "服务热情", "count": 98 }
      ]
    },
    "list": [
      {
        "id": "review_001",
        "user": {
          "nickname": "旅行者小明",
          "avatar": "https://..."
        },
        "rating": 5,
        "content": "位置很好，离地铁站很近，房间干净整洁...",
        "images": ["https://...", "https://..."],
        "roomType": "8人女生房",
        "stayDate": "2024-05",
        "createdAt": "2024-05-20T10:00:00Z",
        "reply": {
          "content": "感谢您的好评，期待再次光临！",
          "createdAt": "2024-05-21T09:00:00Z"
        }
      }
    ],
    "total": 328,
    "page": 1,
    "pageSize": 10
  }
}
```

---

## 四、订单模块 (Order)

### 4.1 计算订单价格

```
POST /orders/calculate
```

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| storeId | string | 是 | 门店ID |
| roomId | string | 是 | 房型ID |
| bedIds | string[] | 是 | 床位ID列表 |
| checkInDate | string | 是 | 入住日期 |
| checkOutDate | string | 是 | 离店日期 |
| bookingMode | string | 是 | 预订方式: day/hour/month |
| startTime | string | 否 | 开始时间(小时订) |
| endTime | string | 否 | 结束时间(小时订) |
| monthCount | number | 否 | 月数(月订) |
| couponId | string | 否 | 优惠券ID |
| usePoints | number | 否 | 使用积分数量 |
| useBalance | boolean | 否 | 是否使用余额 |

**响应**

```json
{
  "code": 0,
  "data": {
    "roomPrice": 408,
    "nights": 6,
    "pricePerNight": 68,
    "discounts": [
      { "name": "促销优惠", "amount": 60 },
      { "name": "会员折扣", "amount": 20 },
      { "name": "优惠券", "amount": 30 }
    ],
    "totalDiscount": 110,
    "pointsDeduction": 10,
    "balanceDeduction": 0,
    "finalPrice": 288,
    "savedAmount": 120,
    "earnPoints": 28
  }
}
```

### 4.2 创建订单

```
POST /orders
```

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| storeId | string | 是 | 门店ID |
| roomId | string | 是 | 房型ID |
| bedIds | string[] | 是 | 床位ID列表 |
| checkInDate | string | 是 | 入住日期 |
| checkOutDate | string | 是 | 离店日期 |
| bookingMode | string | 是 | 预订方式 |
| startTime | string | 否 | 开始时间 |
| endTime | string | 否 | 结束时间 |
| monthCount | number | 否 | 月数 |
| guestName | string | 是 | 入住人姓名 |
| guestIdCard | string | 是 | 身份证号 |
| guestPhone | string | 是 | 联系电话 |
| couponId | string | 否 | 优惠券ID |
| usePoints | number | 否 | 使用积分 |
| useBalance | boolean | 否 | 使用余额 |
| remark | string | 否 | 备注 |

**响应**

```json
{
  "code": 0,
  "data": {
    "orderId": "order_20240601001",
    "orderNo": "WK202406010001",
    "status": "pending_payment",
    "totalPrice": 288,
    "expireAt": "2024-06-01T10:30:00Z",
    "paymentParams": {
      "timeStamp": "1622520001",
      "nonceStr": "xxx",
      "package": "prepay_id=xxx",
      "signType": "RSA",
      "paySign": "xxx"
    }
  }
}
```

### 4.3 获取订单列表

```
GET /orders
```

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | string | 否 | 状态: all/pending_payment/pending_use/in_use/completed/cancelled/refunding/refunded |
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |

**响应**

```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "id": "order_001",
        "orderNo": "WK202406010001",
        "status": "pending_payment",
        "statusText": "待支付",
        "statusColor": "#F97316",
        "store": {
          "id": "store_001",
          "name": "蜗壳青旅·深圳北站店",
          "image": "https://..."
        },
        "room": {
          "id": "room_001",
          "name": "8人女生房",
          "image": "https://..."
        },
        "bedCount": 2,
        "checkInDate": "2024-06-01",
        "checkOutDate": "2024-06-03",
        "nights": 2,
        "totalPrice": 288,
        "countdown": "14:59",
        "createdAt": "2024-06-01T10:00:00Z"
      }
    ],
    "total": 25,
    "page": 1,
    "pageSize": 10
  }
}
```

### 4.4 获取订单详情

```
GET /orders/:orderId
```

**响应**

```json
{
  "code": 0,
  "data": {
    "id": "order_001",
    "orderNo": "WK202406010001",
    "status": "pending_use",
    "statusText": "待使用",
    "store": {
      "id": "store_001",
      "name": "蜗壳青旅·深圳北站店",
      "image": "https://...",
      "address": "深圳市龙华区...",
      "phone": "0755-12345678"
    },
    "room": {
      "id": "room_001",
      "name": "8人女生房",
      "image": "https://...",
      "bedIds": ["A1", "A2"]
    },
    "booking": {
      "mode": "day",
      "checkInDate": "2024-06-01",
      "checkOutDate": "2024-06-03",
      "nights": 2,
      "checkInTime": "14:00后",
      "checkOutTime": "12:00前"
    },
    "guest": {
      "name": "张三",
      "phone": "13888888888",
      "idCard": "440***********1234"
    },
    "price": {
      "roomPrice": 408,
      "discounts": [
        { "name": "促销优惠", "amount": 60 },
        { "name": "会员折扣", "amount": 20 },
        { "name": "优惠券", "amount": 30 }
      ],
      "totalDiscount": 110,
      "pointsDeduction": 10,
      "finalPrice": 288
    },
    "payment": {
      "method": "wechat",
      "transactionId": "wx20240601xxx",
      "paidAt": "2024-06-01T10:05:00Z"
    },
    "cancelPolicy": "入住前24小时免费取消",
    "smartLock": {
      "enabled": true,
      "password": "123456",
      "validFrom": "2024-06-01T14:00:00Z",
      "validTo": "2024-06-03T12:00:00Z"
    },
    "createdAt": "2024-06-01T10:00:00Z",
    "paidAt": "2024-06-01T10:05:00Z"
  }
}
```

### 4.5 支付订单

```
POST /orders/:orderId/pay
```

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| paymentMethod | string | 是 | 支付方式: wechat/balance |

**响应**

```json
{
  "code": 0,
  "data": {
    "paymentParams": {
      "timeStamp": "1622520001",
      "nonceStr": "xxx",
      "package": "prepay_id=xxx",
      "signType": "RSA",
      "paySign": "xxx"
    }
  }
}
```

### 4.6 取消订单

```
POST /orders/:orderId/cancel
```

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| reason | string | 否 | 取消原因 |

### 4.7 申请退款

```
POST /orders/:orderId/refund
```

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| reason | string | 是 | 退款原因 |
| images | string[] | 否 | 凭证图片 |

**响应**

```json
{
  "code": 0,
  "data": {
    "refundId": "refund_001",
    "refundAmount": 288,
    "refundStatus": "pending",
    "estimatedTime": "1-3个工作日"
  }
}
```

### 4.8 支付回调 (服务端)

```
POST /orders/payment-notify
```

> 微信支付回调，服务端处理

---

## 五、优惠券模块 (Coupon)

### 5.1 获取优惠券列表

```
GET /coupons
```

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | string | 否 | 状态: available/used/expired |
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |

**响应**

```json
{
  "code": 0,
  "data": {
    "counts": {
      "available": 5,
      "used": 12,
      "expired": 3
    },
    "list": [
      {
        "id": "coupon_001",
        "type": "discount",
        "name": "新人专享券",
        "description": "满100减20",
        "amount": 20,
        "minAmount": 100,
        "discountRate": null,
        "validFrom": "2024-06-01",
        "validTo": "2024-06-30",
        "status": "available",
        "applicableStores": "all",
        "applicableRooms": "all"
      },
      {
        "id": "coupon_002",
        "type": "rate",
        "name": "会员9折券",
        "description": "全场9折",
        "amount": null,
        "minAmount": 0,
        "discountRate": 0.9,
        "validFrom": "2024-06-01",
        "validTo": "2024-12-31",
        "status": "available"
      }
    ],
    "total": 5,
    "page": 1,
    "pageSize": 10
  }
}
```

### 5.2 领取优惠券

```
POST /coupons/:couponTemplateId/claim
```

**响应**

```json
{
  "code": 0,
  "data": {
    "couponId": "coupon_003",
    "name": "连住专享券",
    "amount": 200,
    "validTo": "2024-06-30"
  }
}
```

### 5.3 获取可用优惠券 (下单时)

```
GET /coupons/available
```

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| storeId | string | 是 | 门店ID |
| roomId | string | 是 | 房型ID |
| amount | number | 是 | 订单金额 |

**响应**

```json
{
  "code": 0,
  "data": {
    "available": [
      {
        "id": "coupon_001",
        "name": "满100减20",
        "amount": 20,
        "discountAmount": 20
      }
    ],
    "unavailable": [
      {
        "id": "coupon_002",
        "name": "满500减100",
        "reason": "未满足最低消费金额"
      }
    ]
  }
}
```

### 5.4 团购券核销

```
POST /coupons/verify
```

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| storeId | string | 是 | 门店ID |
| qrCode | string | 是 | 二维码内容/图片识别结果 |
| source | string | 是 | 来源: meituan/douyin/dianping |

**响应**

```json
{
  "code": 0,
  "data": {
    "verified": true,
    "couponInfo": {
      "name": "单人床位1晚",
      "originalPrice": 98,
      "validTo": "2024-06-30",
      "quantity": 1
    },
    "storeDiscount": 10,
    "finalPrice": 0,
    "message": "核销成功，可直接入住"
  }
}
```

---

## 六、收藏/足迹模块 (Favorite)

### 6.1 获取收藏列表

```
GET /favorites
```

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |

**响应**

```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "id": "fav_001",
        "store": {
          "id": "store_001",
          "name": "蜗壳青旅·深圳北站店",
          "image": "https://...",
          "rating": 4.9,
          "reviewCount": 328,
          "location": "龙华区",
          "price": 68,
          "tag": "平台验真"
        },
        "createdAt": "2024-06-01T10:00:00Z"
      }
    ],
    "total": 12,
    "page": 1,
    "pageSize": 10
  }
}
```

### 6.2 添加收藏

```
POST /favorites
```

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| storeId | string | 是 | 门店ID |

### 6.3 取消收藏

```
DELETE /favorites/:storeId
```

### 6.4 获取浏览足迹

```
GET /footprints
```

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| date | string | 否 | 日期 YYYY-MM-DD |
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |

**响应**

```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "date": "2024-06-01",
        "label": "今天",
        "items": [
          {
            "id": "fp_001",
            "store": {
              "id": "store_001",
              "name": "蜗壳青旅·深圳北站店",
              "image": "https://...",
              "rating": 4.9,
              "reviewCount": 328,
              "location": "龙华区",
              "price": 68
            },
            "viewedAt": "2024-06-01T15:30:00Z"
          }
        ]
      }
    ],
    "total": 50,
    "page": 1,
    "pageSize": 10
  }
}
```

### 6.5 记录浏览

```
POST /footprints
```

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| storeId | string | 是 | 门店ID |

---

## 七、智能门锁模块 (SmartLock)

### 7.1 获取门锁信息

```
GET /smart-lock/:orderId
```

**响应**

```json
{
  "code": 0,
  "data": {
    "lockId": "lock_001",
    "lockStatus": "locked",
    "battery": 90,
    "wifiStrength": "strong",
    "validFrom": "2024-06-01T14:00:00Z",
    "validTo": "2024-06-03T12:00:00Z",
    "passwords": [
      {
        "id": "pwd_001",
        "type": "permanent",
        "name": "主密码",
        "createdAt": "2024-06-01T14:00:00Z"
      }
    ],
    "fingerprints": [],
    "cards": []
  }
}
```

### 7.2 远程开锁

```
POST /smart-lock/:orderId/unlock
```

**响应**

```json
{
  "code": 0,
  "data": {
    "success": true,
    "message": "开锁成功",
    "unlockTime": "2024-06-01T15:00:00Z"
  }
}
```

### 7.3 远程关锁

```
POST /smart-lock/:orderId/lock
```

### 7.4 获取临时密码

```
POST /smart-lock/:orderId/temp-password
```

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| validHours | number | 是 | 有效时长(小时) |
| name | string | 否 | 备注名称 |

**响应**

```json
{
  "code": 0,
  "data": {
    "password": "123456",
    "validFrom": "2024-06-01T15:00:00Z",
    "validTo": "2024-06-01T21:00:00Z"
  }
}
```

### 7.5 密码管理

```
GET /smart-lock/:orderId/passwords
POST /smart-lock/:orderId/passwords
DELETE /smart-lock/:orderId/passwords/:passwordId
```

### 7.6 指纹管理

```
GET /smart-lock/:orderId/fingerprints
POST /smart-lock/:orderId/fingerprints
DELETE /smart-lock/:orderId/fingerprints/:fingerprintId
```

### 7.7 门卡管理

```
GET /smart-lock/:orderId/cards
POST /smart-lock/:orderId/cards
DELETE /smart-lock/:orderId/cards/:cardId
```

### 7.8 门锁事件记录

```
GET /smart-lock/:orderId/events
```

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |

**响应**

```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "id": "event_001",
        "type": "unlock",
        "method": "password",
        "operator": "用户",
        "result": "success",
        "createdAt": "2024-06-01T15:00:00Z"
      },
      {
        "id": "event_002",
        "type": "lock",
        "method": "auto",
        "operator": "系统",
        "result": "success",
        "createdAt": "2024-06-01T15:00:30Z"
      }
    ],
    "total": 20,
    "page": 1,
    "pageSize": 10
  }
}
```

---

## 八、余额模块 (Balance)

### 8.1 获取账户余额

```
GET /balance
```

**响应**

```json
{
  "code": 0,
  "data": {
    "cashback": 150.0,
    "balance": 200.0,
    "consumption": 50.0,
    "points": 1200
  }
}
```

### 8.2 获取返现明细

```
GET /balance/cashback/records
```

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |

**响应**

```json
{
  "code": 0,
  "data": {
    "balance": 150.0,
    "list": [
      {
        "id": "cb_001",
        "type": "earn",
        "amount": 15.0,
        "description": "订单返现",
        "orderId": "order_001",
        "createdAt": "2024-06-01T10:00:00Z"
      }
    ],
    "total": 10,
    "page": 1,
    "pageSize": 10
  }
}
```

### 8.3 获取余额明细

```
GET /balance/records
```

### 8.4 获取消费金明细

```
GET /balance/consumption/records
```

### 8.5 余额充值

```
POST /balance/recharge
```

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| amount | number | 是 | 充值金额 |

**响应**

```json
{
  "code": 0,
  "data": {
    "orderId": "recharge_001",
    "amount": 100,
    "giftAmount": 10,
    "paymentParams": { ... }
  }
}
```

### 8.6 返现提现

```
POST /balance/cashback/withdraw
```

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| amount | number | 是 | 提现金额 |

---

## 九、消息模块 (Message)

### 9.1 获取消息列表

```
GET /messages
```

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 否 | 类型: system/order/promotion |
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |

**响应**

```json
{
  "code": 0,
  "data": {
    "unreadCount": 3,
    "list": [
      {
        "id": "msg_001",
        "type": "order",
        "title": "订单支付成功",
        "content": "您的订单 WK202406010001 已支付成功",
        "orderId": "order_001",
        "isRead": false,
        "createdAt": "2024-06-01T10:05:00Z"
      },
      {
        "id": "msg_002",
        "type": "system",
        "title": "系统公告",
        "content": "端午节活动来袭，全场8折起...",
        "isRead": true,
        "createdAt": "2024-06-01T09:00:00Z"
      }
    ],
    "total": 25,
    "page": 1,
    "pageSize": 10
  }
}
```

### 9.2 获取未读消息数

```
GET /messages/unread-count
```

**响应**

```json
{
  "code": 0,
  "data": {
    "total": 5,
    "system": 2,
    "order": 3,
    "promotion": 0
  }
}
```

### 9.3 标记消息已读

```
PUT /messages/:messageId/read
```

### 9.4 标记全部已读

```
PUT /messages/read-all
```

---

## 十、通用模块 (Common)

### 10.1 获取城市列表

```
GET /common/cities
```

**响应**

```json
{
  "code": 0,
  "data": {
    "hot": [
      { "code": "SZ", "name": "深圳" },
      { "code": "GZ", "name": "广州" },
      { "code": "SH", "name": "上海" }
    ],
    "all": [
      {
        "letter": "A",
        "cities": [{ "code": "AH", "name": "安徽" }]
      },
      {
        "letter": "B",
        "cities": [{ "code": "BJ", "name": "北京" }]
      }
    ]
  }
}
```

### 10.2 文件上传

```
POST /common/upload
```

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | File | 是 | 文件 |
| type | string | 是 | 类型: avatar/feedback/review |

**响应**

```json
{
  "code": 0,
  "data": {
    "url": "https://cdn.snail-shell.com/uploads/xxx.jpg",
    "key": "uploads/xxx.jpg"
  }
}
```

### 10.3 提交反馈

```
POST /common/feedback
```

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 是 | 类型: suggestion/complaint/bug |
| content | string | 是 | 内容 |
| images | string[] | 否 | 图片URL列表 |
| contact | string | 否 | 联系方式 |

### 10.4 获取服务协议

```
GET /common/agreement/:type
```

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 是 | 类型: user/privacy/booking |

**响应**

```json
{
  "code": 0,
  "data": {
    "title": "用户服务协议",
    "content": "...",
    "version": "1.0.0",
    "updatedAt": "2024-01-01"
  }
}
```

### 10.5 获取首页配置

```
GET /common/home-config
```

**响应**

```json
{
  "code": 0,
  "data": {
    "banners": [
      {
        "id": "banner_001",
        "image": "https://...",
        "link": "/pages/activity/activity?id=xxx",
        "title": "端午特惠"
      }
    ],
    "hotTags": ["福田区", "南山区", "深圳北站"],
    "promotions": [
      {
        "id": "promo_001",
        "type": "quality",
        "title": "品质好房",
        "subtitle": "平台验真 入住无忧",
        "image": "https://...",
        "link": "/pages/nearby-stores/nearby-stores?tag=quality"
      }
    ]
  }
}
```

---

## 接口汇总

| 模块          | 接口数量 |
| ------------- | -------- |
| 认证模块      | 3        |
| 用户模块      | 4        |
| 门店模块      | 5        |
| 订单模块      | 8        |
| 优惠券模块    | 4        |
| 收藏/足迹模块 | 5        |
| 智能门锁模块  | 8        |
| 余额模块      | 6        |
| 消息模块      | 4        |
| 通用模块      | 5        |
| **总计**      | **52**   |

---

## 下一步

确认接口文档后，我将：

1. 设计数据库 Schema (Prisma)
2. 初始化 NestJS 项目
3. 逐模块实现 API
