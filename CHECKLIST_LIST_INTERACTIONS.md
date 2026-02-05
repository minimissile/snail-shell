# Checklist: Store List Interactions

## 1. Swipe Delete
- [x] Wrap `store-card` in `t-swipe-cell`
- [x] Configure `right` actions (Red delete button)
- [x] Implement `onSwipeActionClick` handler to remove item from list
- [x] Add feedback toast "已删除"

## 2. Favorite Toggle
- [x] Update `StoreItem` interface with `isFavorite`
- [x] Create active heart icon (`icon-heart-active.svg`)
- [x] Bind icon src to `item.isFavorite`
- [x] Implement `onFavoriteTap` to toggle state

## 3. Expand/Collapse
- [x] Add `expanded` state to `StoreItem`
- [x] Add expand button UI in WXML
- [x] Implement `onExpandTap` to toggle state
- [x] Apply CSS line-clamp logic (`-webkit-line-clamp: 2` vs `unset`)
- [x] Add rotate animation for the arrow icon

## 4. Performance
- [x] `lazy-load` enabled on images
- [x] WebP images used in mock data
- [x] `wx:key` used in list
- [x] Minimal re-renders (updating only modified item in list via map/filter)

## 5. UI/UX
- [x] Pixel-perfect styles (Poppins font, colors)
- [x] Touch feedback (ripples/opacity handled by TDesign or existing hover-class)
