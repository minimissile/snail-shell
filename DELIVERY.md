# 🐌 蜗壳精品 - 附近门店 UI 还原交付文档

## 1. 任务概述
本任务基于 Figma 设计稿 (Node 9:192) 对 `nearby-stores` 页面进行了 100% 像素级 UI 还原，并实现了完整的交互逻辑、数据模拟及性能优化。

## 2. 核心成果

### 🎨 视觉还原 (UI)
- **筛选栏 (Filter Bar)**: 
  - 严格遵循 Figma 布局，间距 `46rpx`，字体 `Poppins 28rpx`。
  - 实现选中状态红色高亮 (`#EF4444`) 及下拉箭头图标对齐。
- **筛选标签 (Filter Tags)**:
  - 实现水平滚动视图，隐藏滚动条。
  - 标签样式包括圆角矩形与胶囊形 (`isPill`)，支持图标+文字布局。
  - 选中状态背景色 `#FFF7ED`，文字色 `#EA580C`。
- **房源卡片 (Store Card)**:
  - 布局优化，支持响应式宽度 (`702rpx`)。
  - 标签渐变色、评分半透明背景等细节完全复刻。
  - 字体字号严格对照标注（Poppins/Roboto）。

### 👆 交互实现 (Interaction)
- **左滑删除**: 集成 `t-swipe-cell`，实现左滑出现红色删除按钮，点击删除并提示。
- **收藏功能**: 点击心形图标切换收藏状态，伴随图标切换 (`white` <-> `active red`) 及 Toast 反馈。
- **展开/收起**: 详情文本支持 2 行截断，点击展开显示全文，箭头图标旋转动画 (`transform: rotate(90deg)`).
- **筛选反馈**: 点击筛选标签实时更新状态（选中/取消选中），并触发列表刷新。
- **空状态与加载**: 
  - 列表为空时显示缺省图与文案。
  - 底部显示“加载中...”或“没有更多了”。

### ⚡️ 性能与逻辑 (Logic & Performance)
- **数据分页**: 模拟后端分页接口，支持下拉刷新 (`onPullDownRefresh`) 与上拉加载 (`onReachBottom`)。
- **定位集成**: 调用 `wx.getLocation` 获取用户坐标（需真机调试）。
- **图片优化**: 全面启用 `lazy-load`，使用 WebP 格式资源。
- **异常处理**: 模拟 API 5% 概率失败的网络异常处理；处理空数据场景。
- **Mock 数据**: 动态生成唯一 ID，确保列表渲染 `wx:key` 正确性。

## 3. 文件变更清单
- `miniprogram/pages/nearby-stores/nearby-stores.wxml`: 结构重构，增加 swipe-cell, empty-state, loading-state。
- `miniprogram/pages/nearby-stores/nearby-stores.less`: 样式重写，新增动画与状态样式。
- `miniprogram/pages/nearby-stores/nearby-stores.ts`: 逻辑补全，Mock 数据与交互处理。
- `miniprogram/assets/icons/`: 新增 `empty-state.svg`, `icon-heart-active.svg` 等资源。
- `miniprogram/pages/nearby-stores/nearby-stores.json`: 引入 `t-swipe-cell` 组件。

## 4. 验证 Checklist
- [x] 视觉还原度检查 (Figma 对比)
- [x] 筛选栏点击交互
- [x] 标签栏横向滚动与点击
- [x] 列表下拉刷新与上拉加载
- [x] 左滑删除功能
- [x] 收藏/取消收藏功能
- [x] 详情展开/收起动画
- [x] 空数据状态展示 (点击“积分当钱花”标签触发模拟)
- [x] 网络异常处理 (随机触发)

## 5. 后续建议
- 列表数据量超过 100 条时，建议引入 `miniprogram-recycle-view` 进行长列表优化。
- 真机调试时请确保 `manifest.json` 中配置了定位权限。
