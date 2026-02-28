import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { isAuthenticated } from '@/utils/auth'
import BasicLayout from '@/layouts/BasicLayout'
import LoginPage from '@/pages/Login/index'
import DashboardPage from '@/pages/Dashboard/index'
import StoreList from '@/pages/Store/StoreList'
import StoreDetail from '@/pages/Store/StoreDetail'
import OrderList from '@/pages/Order/OrderList'
import OrderDetail from '@/pages/Order/OrderDetail'
import UserList from '@/pages/User/UserList'
import UserDetail from '@/pages/User/UserDetail'
import CouponList from '@/pages/Coupon/CouponList'
import HomeConfig from '@/pages/System/HomeConfig'
import CityList from '@/pages/System/CityList'
import Agreement from '@/pages/System/Agreement'
import FeedbackList from '@/pages/System/FeedbackList'
import AdminList from '@/pages/Admin/AdminList'
import RoleList from '@/pages/Admin/RoleList'

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <BasicLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="stores" element={<StoreList />} />
        <Route path="stores/:id" element={<StoreDetail />} />
        <Route path="orders" element={<OrderList />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="users" element={<UserList />} />
        <Route path="users/:id" element={<UserDetail />} />
        <Route path="coupons" element={<CouponList />} />
        <Route path="system/home-config" element={<HomeConfig />} />
        <Route path="system/cities" element={<CityList />} />
        <Route path="system/agreements" element={<Agreement />} />
        <Route path="system/feedbacks" element={<FeedbackList />} />
        <Route path="admin/users" element={<AdminList />} />
        <Route path="admin/roles" element={<RoleList />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
