import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import AreaSelect from './pages/AreaSelect'
import DateSelect from './pages/DateSelect'
import StudioSelect from './pages/StudioSelect'
import UserTypeSelect from './pages/UserTypeSelect'
import ReservationForm from './pages/ReservationForm'
import ReservationComplete from './pages/ReservationComplete'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
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
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
