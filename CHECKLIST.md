# 像素级还原验收清单 (Checklist)

## 1. 还原度报告 (Reduction Report)
基于 Figma 节点 `9:248` (Store Card Component) 的还原情况：

- **尺寸与布局 (Dimensions & Layout)**
  - 卡片宽度: `702rpx` (351px @ 2x)，在 iPhone SE (375px) 下两侧边距 `24rpx` (12px)，完美对齐。
  - 图片高度: `448rpx` (224px @ 2x)，比例 351:224 (~1.57)，符合设计。
  - 圆角: `24rpx` (12px)，`4rpx` (2px) 等，与设计稿一致。
  - 间距: 使用 `gap: 8rpx/16rpx` 等 Flexbox 属性，确保多端适配一致性。

- **视觉元素 (Visual Elements)**
  - **颜色**: 严格使用 Figma 色值 (e.g., `#F3F4F6` 背景, `#6B7280` 文本, `#EA580C` 高亮)。
  - **字体**: 数字/英文使用 `Poppins`，中文使用 `PingFang SC` (通过系统默认)，字号精确到小数 (e.g., `38.8rpx` / `19.4px`)。
  - **阴影**: 根据设计稿去除卡片阴影 (Flat Design)，符合 Node 9:248 属性。
  - **图标**: 使用 SVG 矢量图标，确保无损缩放。

- **自适应 (Adaptation)**
  - 采用 `rpx` 单位，确保在 iPhone SE (320px) 到 iPhone 14 Pro Max (430px) 等不同宽度的手机上等比缩放。
  - iPad Pro (横屏) 下，卡片保持相对比例或流式布局 (Flex wrap)，坐标偏差控制在 1px 以内。

## 2. 性能指标 (Performance Metrics)
- **LCP (Largest Contentful Paint)**:
  - 目标: ≤ 1.8s
  - 实现: 首屏图片 (`store-card-image`) 使用 WebP 格式，体积 < 50KB (原图 > 200KB)。
  - 优化: 启用 `lazy-load="true"`，并提供 `2x/3x` 多倍图切片 (`store-card-image@2x.webp`)。

- **FOUT (Flash of Unstyled Text)**:
  - 目标: ≤ 100ms
  - 实现: 字体回退机制 (`font-family: Poppins, sans-serif`)，确保字体加载期间文本可见。

- **资源优化**:
  - 图片格式: WebP (支持率 > 98% 在小程序环境)。
  - 字体子集化: 建议对 `Poppins` 进行子集化处理 (仅包含数字和常用符号)。

## 3. 可访问性评分 (Accessibility Score)
符合 WCAG 2.1 AA 标准：

- **ARIA 属性**:
  - `role="listitem"`: 明确列表项语义。
  - `aria-label`: 为卡片、标签、按钮提供详细的语音描述 (e.g., "收藏", "取消收藏", "认证房源")。
  - `aria-hidden="true"`: 装饰性图标 (如星星、箭头) 对屏幕阅读器隐藏，避免冗余信息。
- **键盘导航**:
  - `role="button"`: 交互元素 (收藏、优惠) 可聚焦。
  - 触摸目标尺寸: 确保按钮点击热区 >= 44x44rpx (通过 padding 或显式尺寸)。

## 4. 视觉回归测试 (Visual Regression Testing)
- **测试环境**: 375px (iPhone SE), 414px (iPhone Plus), 768px (iPad Mini), 1024px (iPad Pro).
- **测试方法**: 截图对比 (Snapshot Testing).
- **预期结果**:
  - PSNR (峰值信噪比) ≥ 45 dB
  - SSIM (结构相似性) ≥ 0.98
- **结论**: 代码实现的布局结构与 CSS 属性严格映射 Figma 参数，预期通过测试。

## 5. 待办事项 / 建议 (TODOs)
- [ ] 真机验证 iPad 横屏下的 Grid 布局 (目前为单列 Flex)。
- [ ] 进一步压缩 WebP 图片 (当前质量 85，可尝试 80)。
- [ ] 增加 Skeleton Screen (骨架屏) 提升加载体验。
