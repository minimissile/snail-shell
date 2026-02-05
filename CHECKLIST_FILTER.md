# 筛选栏与交互还原验收清单 (Filter Bar & Logic Checklist)

## 1. 视觉还原 (Visual Reduction)
基于 Figma 节点 `9:192` (Filter Bar & Tags) 的还原情况：

- **Filter Bar (筛选按钮栏)**
  - **间距**: `gap: 46rpx` (23px)，精确匹配 Figma `layout_0GUW16`.
  - **字体**: `Poppins` (英/数) + `PingFang SC` (中)，字号 `28rpx` (14px)，颜色 `#4B5563` (默认) / `#EF4444` (激活).
  - **图标**: 使用 `ic_caret_down.svg`，尺寸 `24rpx` (12px)，对齐方式 `center`.
  - **交互**: 点击切换 `activeFilter` 状态，触发 `active` 样式 (红色高亮).

- **Filter Tags (筛选标签)**
  - **布局**: `scroll-view` 横向滚动，隐藏滚动条，`gap: 16rpx` (8px).
  - **标签样式**:
    - 默认: 背景 `#F3F4F6`，文字 `#374151`，字号 `24rpx` (12px).
    - 激活: 背景 `#FFF7ED`，文字 `#EA580C`.
    - 特殊形状: "自助入" 使用 `border-radius: 9999rpx` (Pill shape).
    - 图标: "深圳北站" 含关闭图标 `ic_close.svg`，"房屋等级" 含下拉箭头，"积分" 含积分图标.

## 2. 交互逻辑 (Interaction Logic)
- **点击交互**:
  - `onSortTap`: 切换排序，触发 API 刷新.
  - `onTagTap`: 多选/单选标签，更新 `filterTags` 状态，触发 API 刷新.
  - `hover-class`: 添加点击态反馈 (`opacity: 0.7`).
- **数据绑定**:
  - `activeFilter` 控制筛选栏高亮.
  - `filterTags` 数组驱动标签渲染，支持动态扩展.

## 3. 数据与性能 (Data & Performance)
- **API 模拟**: `fetchNearbyStores` 实现分页 (`pageNo`), 加载锁 (`isLoading`), 下拉刷新 (`reset`).
- **定位集成**: `initLocation` 调用 `wx.getLocation` (需真机权限).
- **资源优化**: 图标使用 SVG，标签列表启用 `enable-flex`.

## 4. 待办事项 (TODOs)
- [ ] 列表项左滑删除 (需引入 `movable-area` 或 `weui-slideview`).
- [ ] 虚拟列表优化 (当数据量 > 100 条时).
- [ ] 真机验证定位权限配置 (`app.json`).
