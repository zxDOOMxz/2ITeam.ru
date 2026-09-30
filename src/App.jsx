import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import Home from './pages/Home.jsx'
import Services from './pages/Services.jsx'
import Pricing from './pages/Pricing.jsx'
import About from './pages/About.jsx'
import Contacts from './pages/Contacts.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Reset from './pages/Reset.jsx'
import Cabinet from './pages/Cabinet.jsx'
import NewTicket from './pages/NewTicket.jsx'
import TicketDetail from './pages/TicketDetail.jsx'
import Profile from './pages/Profile.jsx'
import Admin from './pages/Admin.jsx'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/contacts" element={<Contacts />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset" element={<Reset />} />

          <Route
            path="/cabinet"
            element={
              <ProtectedRoute>
                <Cabinet />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cabinet/new"
            element={
              <ProtectedRoute>
                <NewTicket />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cabinet/tickets/:id"
            element={
              <ProtectedRoute>
                <TicketDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cabinet/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <Admin />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
