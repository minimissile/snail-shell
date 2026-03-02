/**
 * 蓝牙门锁工具类
 * 用于通过蓝牙控制智能门锁开关门
 */

export interface BluetoothConfig {
  deviceId: string
  serviceUuid: string
  writeUuid: string
  notifyUuid: string
}

export class BluetoothLockManager {
  private deviceId: string = ''
  private config: BluetoothConfig | null = null
  private isConnected: boolean = false

  /**
   * 初始化蓝牙适配器
   */
  async initBluetooth(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      wx.openBluetoothAdapter({
        success: () => {
          console.log('✅ 蓝牙初始化成功')
          resolve(true)
        },
        fail: (err) => {
          console.error('❌ 蓝牙初始化失败:', err)
          reject(new Error('请打开手机蓝牙'))
        }
      })
    })
  }

  /**
   * 搜索指定的门锁设备
   * @param deviceId 设备ID（广播名称）
   * @param timeout 搜索超时时间（毫秒）
   */
  async searchDevice(deviceId: string, timeout = 10000): Promise<boolean> {
    return new Promise((resolve, reject) => {
      console.log('🔍 开始搜索蓝牙设备:', deviceId)

      // 开始搜索
      wx.startBluetoothDevicesDiscovery({
        success: () => {
          console.log('✅ 启动蓝牙搜索成功')

          // 设置超时
          const timeoutId = setTimeout(() => {
            wx.stopBluetoothDevicesDiscovery()
            reject(new Error('未找到门锁设备，请靠近门锁重试'))
          }, timeout)

          // 监听找到设备
          wx.onBluetoothDeviceFound((res) => {
            const devices = res.devices
            console.log('📡 发现设备:', devices.map(d => d.name || d.localName))

            // 查找匹配的设备
            const targetDevice = devices.find(d => {
              return d.name?.includes(deviceId) ||
                     d.localName?.includes(deviceId) ||
                     d.advertisData?.includes(deviceId)
            })

            if (targetDevice) {
              clearTimeout(timeoutId)
              wx.stopBluetoothDevicesDiscovery()
              this.deviceId = targetDevice.deviceId
              console.log('✅ 找到门锁设备:', targetDevice.deviceId, targetDevice.name)
              resolve(true)
            }
          })
        },
        fail: (err) => {
          console.error('❌ 启动蓝牙搜索失败:', err)
          reject(new Error('启动蓝牙搜索失败，请检查蓝牙权限'))
        }
      })
    })
  }

  /**
   * 连接设备
   * @param config 蓝牙配置（服务UUID、写入UUID、通知UUID）
   */
  async connect(config: BluetoothConfig): Promise<boolean> {
    return new Promise((resolve, reject) => {
      console.log('🔗 正在连接设备...', this.deviceId)
      this.config = config

      wx.createBLEConnection({
        deviceId: this.deviceId,
        timeout: 10000,
        success: () => {
          console.log('✅ 蓝牙连接成功')
          this.isConnected = true

          // 延迟一下确保连接稳定
          setTimeout(() => resolve(true), 500)
        },
        fail: (err) => {
          console.error('❌ 蓝牙连接失败:', err)
          reject(new Error('连接门锁失败，请重试'))
        }
      })
    })
  }

  /**
   * 开锁
   * @param encryptKey 加密密钥
   * @param userId 用户ID
   * @param orderId 订单ID
   */
  async unlock(encryptKey: string, userId: string, orderId: string): Promise<boolean> {
    if (!this.isConnected || !this.config) {
      throw new Error('设备未连接')
    }

    try {
      console.log('🔓 开始开锁流程...')

      // 1. 获取服务
      const services = await this.getServices()
      console.log('📋 可用服务:', services.map(s => s.uuid))

      const service = services.find(s => s.uuid === this.config!.serviceUuid)
      if (!service) {
        throw new Error('未找到门锁服务')
      }

      // 2. 获取特征值
      const characteristics = await this.getCharacteristics(service.uuid)
      console.log('🔧 可用特征值:', characteristics.map(c => c.uuid))

      const writeChar = characteristics.find(c => c.uuid === this.config!.writeUuid)
      const notifyChar = characteristics.find(c => c.uuid === this.config!.notifyUuid)

      if (!writeChar || !notifyChar) {
        throw new Error('未找到开锁接口')
      }

      // 3. 开启通知
      await this.enableNotify(service.uuid, notifyChar.uuid)
      console.log('✅ 开启通知成功')

      // 4. 构建并发送开锁指令
      const command = this.buildUnlockCommand(encryptKey, userId, orderId)
      console.log('📤 发送开锁指令...')
      await this.writeValue(service.uuid, writeChar.uuid, command)

      // 5. 等待响应
      const result = await this.waitForResponse(5000)
      console.log('📥 开锁结果:', result)

      return result

    } catch (error) {
      console.error('❌ 开锁失败:', error)
      throw error
    }
  }

  /**
   * 获取服务列表
   */
  private getServices(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      wx.getBLEDeviceServices({
        deviceId: this.deviceId,
        success: (res) => {
          console.log('📋 获取服务列表成功:', res.services)
          resolve(res.services)
        },
        fail: (err) => {
          console.error('❌ 获取服务列表失败:', err)
          reject(new Error('获取门锁服务失败'))
        }
      })
    })
  }

  /**
   * 获取特征值列表
   */
  private getCharacteristics(serviceId: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      wx.getBLEDeviceCharacteristics({
        deviceId: this.deviceId,
        serviceId,
        success: (res) => {
          console.log('🔧 获取特征值成功:', res.characteristics)
          resolve(res.characteristics)
        },
        fail: (err) => {
          console.error('❌ 获取特征值失败:', err)
          reject(new Error('获取开锁接口失败'))
        }
      })
    })
  }

  /**
   * 开启通知
   */
  private enableNotify(serviceId: string, characteristicId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      wx.notifyBLECharacteristicValueChange({
        deviceId: this.deviceId,
        serviceId,
        characteristicId,
        state: true,
        success: () => {
          console.log('✅ 开启通知成功')
          resolve()
        },
        fail: (err) => {
          console.error('❌ 开启通知失败:', err)
          reject(new Error('开启监听失败'))
        }
      })
    })
  }

  /**
   * 写入数据
   */
  private writeValue(serviceId: string, characteristicId: string, value: ArrayBuffer): Promise<void> {
    return new Promise((resolve, reject) => {
      wx.writeBLECharacteristicValue({
        deviceId: this.deviceId,
        serviceId,
        characteristicId,
        value,
        success: () => {
          console.log('✅ 开锁指令发送成功')
          resolve()
        },
        fail: (err) => {
          console.error('❌ 开锁指令发送失败:', err)
          reject(new Error('发送开锁指令失败'))
        }
      })
    })
  }

  /**
   * 等待设备响应
   * @param timeout 超时时间（毫秒）
   */
  private waitForResponse(timeout: number): Promise<boolean> {
    return new Promise((resolve) => {
      let resolved = false

      const timeoutId = setTimeout(() => {
        if (!resolved) {
          resolved = true
          wx.offBLECharacteristicValueChange(handler)
          console.log('⏱️ 开锁响应超时')
          resolve(false)
        }
      }, timeout)

      const handler = (res: any) => {
        if (resolved) return

        if (res.deviceId === this.deviceId) {
          console.log('📥 收到设备响应:', res.value)

          // 解析响应数据（根据门锁协议实现）
          const result = this.parseResponse(res.value)

          if (result !== null) {
            resolved = true
            clearTimeout(timeoutId)
            wx.offBLECharacteristicValueChange(handler)
            resolve(result)
          }
        }
      }

      wx.onBLECharacteristicValueChange(handler)
    })
  }

  /**
   * 构建开锁指令
   * @param encryptKey 加密密钥
   * @param userId 用户ID
   * @param orderId 订单ID
   */
  private buildUnlockCommand(encryptKey: string, userId: string, orderId: string): ArrayBuffer {
    // 根据实际门锁协议构建指令
    // 示例格式：帧头 + 命令码 + 数据长度 + 加密数据 + 校验和

    const payload = {
      cmd: 0x01,              // 开锁命令
      userId,
      orderId,
      timestamp: Date.now()
    }

    const dataStr = JSON.stringify(payload)
    const encryptedData = this.simpleEncrypt(dataStr, encryptKey)
    const checksum = this.calculateChecksum(encryptedData)

    const buffer = new ArrayBuffer(encryptedData.length + 4)
    const view = new DataView(buffer)

    view.setUint8(0, 0xAA)    // 帧头1
    view.setUint8(1, 0x55)    // 帧头2
    view.setUint8(2, encryptedData.length)  // 数据长度

    for (let i = 0; i < encryptedData.length; i++) {
      view.setUint8(3 + i, encryptedData.charCodeAt(i))
    }

    view.setUint8(3 + encryptedData.length, checksum)  // 校验和

    return buffer
  }

  /**
   * 简单加密（示例，实际应使用更安全的加密方式）
   */
  private simpleEncrypt(data: string, key: string): string {
    // 这里只是示例，实际应使用AES等加密算法
    return data
  }

  /**
   * 计算校验和
   */
  private calculateChecksum(data: string): number {
    let sum = 0
    for (let i = 0; i < data.length; i++) {
      sum += data.charCodeAt(i)
    }
    return sum % 256
  }

  /**
   * 解析响应数据
   * @param buffer 响应数据
   */
  private parseResponse(buffer: ArrayBuffer): boolean | null {
    const view = new DataView(buffer)

    // 检查帧头
    if (view.getUint8(0) !== 0xAA || view.getUint8(1) !== 0x55) {
      console.log('⚠️ 帧头不匹配')
      return null
    }

    // 检查命令码
    const cmd = view.getUint8(2)
    if (cmd !== 0x01) {
      console.log('⚠️ 命令码不匹配')
      return null
    }

    // 获取结果码
    const resultCode = view.getUint8(3)
    console.log('📋 结果码:', resultCode)
    return resultCode === 0x00  // 0x00 表示成功
  }

  /**
   * 断开连接
   */
  disconnect() {
    if (this.isConnected && this.deviceId) {
      wx.closeBLEConnection({
        deviceId: this.deviceId,
        success: () => {
          this.isConnected = false
          console.log('✅ 蓝牙已断开')
        },
        fail: () => {
          console.log('⚠️ 断开蓝牙失败')
        }
      })
    }
  }

  /**
   * 关闭蓝牙适配器
   */
  closeBluetooth() {
    wx.stopBluetoothDevicesDiscovery()
    wx.closeBluetoothAdapter({
      success: () => {
        console.log('✅ 蓝牙适配器已关闭')
      }
    })
  }
}

// 导出单例
export const bluetoothLock = new BluetoothLockManager()
