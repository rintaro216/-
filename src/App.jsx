import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import AreaSelect from './pages/AreaSelect'
import DateSelect from './pages/DateSelect'
import StudioSelect from './pages/StudioSelect'
import UserTypeSelect from './pages/UserTypeSelect'
import ReservationForm from './pages/ReservationForm'
import ReservationComplete from './pages/ReservationComplete'
import ReservationCheck from './pages/user/ReservationCheck'
import AnnouncementList from './pages/AnnouncementList'
import AnnouncementDetail from './pages/AnnouncementDetail'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import ReservationManagement from './pages/admin/ReservationManagement'
import StudioManagementUnified from './pages/admin/StudioManagementUnified'
import StudioManagement from './pages/admin/StudioManagement'
import BusinessHoursManagement from './pages/admin/BusinessHoursManagement'
import AnnouncementManagement from './pages/admin/AnnouncementManagement'

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col">
      {!isAdminRoute && <Header />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />

          {/* 予約フロー */}
          <Route path="/reserve" element={<AreaSelect />} />
          <Route path="/reserve/area" element={<AreaSelect />} />
          <Route path="/reserve/date" element={<DateSelect />} />
          <Route path="/reserve/studio" element={<StudioSelect />} />
          <Route path="/reserve/user-type" element={<UserTypeSelect />} />
          <Route path="/reserve/form" element={<ReservationForm />} />
          <Route path="/reserve/complete" element={<ReservationComplete />} />

          {/* 予約確認・キャンセル */}
          <Route path="/reservation/check" element={<ReservationCheck />} />

          {/* お知らせ */}
          <Route path="/announcements" element={<AnnouncementList />} />
          <Route path="/announcements/:id" element={<AnnouncementDetail />} />

          {/* 管理画面 */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reservations"
            element={
              <ProtectedRoute>
                <ReservationManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/studios"
            element={
              <ProtectedRoute>
                <StudioManagementUnified />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/business-hours"
            element={
              <ProtectedRoute>
                <BusinessHoursManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/announcements"
            element={
              <ProtectedRoute>
                <AnnouncementManagement />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  )
}

export default App
