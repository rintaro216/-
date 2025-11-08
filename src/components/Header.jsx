import { Link } from 'react-router-dom';
import { FaBell, FaCalendarAlt } from 'react-icons/fa';

export default function Header() {
  return (
    <header className="bg-primary-green text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition">
            <span className="text-2xl">🎵</span>
            <h1 className="text-xl md:text-2xl font-bold">おんぷタイム</h1>
          </Link>

          <nav className="flex space-x-3 md:space-x-6">
            <Link
              to="/announcements"
              className="flex items-center space-x-1 hover:text-yellow-200 transition text-sm md:text-base"
            >
              <FaBell className="text-lg" />
              <span className="hidden sm:inline">お知らせ</span>
            </Link>
            <Link
              to="/reserve"
              className="flex items-center space-x-1 bg-primary-orange px-3 py-2 rounded-lg hover:bg-orange-600 transition text-sm md:text-base font-medium"
            >
              <FaCalendarAlt className="text-lg" />
              <span>予約する</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
