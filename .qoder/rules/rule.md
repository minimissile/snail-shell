---
trigger: always_on
---

# 项目规范

## 技术栈
- **小程序框架**: 微信小程序
- **CSS预处理器**: Less
- **UI框架**: TDesign
- **API调用方式**: 前后端分离

## 代码规范

### 1. 文件命名
- 页面文件使用小写字母，多个单词用短横线连接，如：`user-profile`
- 组件文件使用小写字母，多个单词用短横线连接，如：`custom-button`
- 样式文件使用 `.less` 后缀

### 2. 样式规范
- 使用 Less 编写样式，充分利用变量、嵌套、混合等特性
- 遵循 BEM 命名规范：`.block__element--modifier`
- 使用 TDesign 提供的设计规范和组件样式
- 避免使用 `!important`
- 统一使用 `rpx` 作为尺寸单位

### 3. 组件使用
- 优先使用 TDesign 提供的组件
- 组件引入示例：
import { Button, Dialog, Toast } from 'tdesign-miniprogram';

### 4. API 调用规范
- 统一封装 API 请求方法
- 使用 Promise 或 async/await 处理异步请求
- 统一处理错误和异常
- API 请求示例：
// api/request.js
const request = (url, method = 'GET', data = {}) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${baseURL}${url}`,
      method,
      data,
      success: (res) => resolve(res.data),
      fail: (err) => reject(err)
    });
  });
};

### 5. 代码风格
- 使用 ES6+ 语法
- 使用 2 空格缩进
- 使用单引号
- 函数和变量使用驼峰命名
- 常量使用大写字母和下划线

### 6. 最佳实践
- 合理使用生命周期函数
- 及时清理定时器和事件监听
- 注意小程序的性能优化
- 做好错误处理和用户提示
- 使用 TDesign 的 Toast、Dialog 等组件进行用户交互反馈
