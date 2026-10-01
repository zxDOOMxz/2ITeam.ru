import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import Home from './pages/Home.jsx'
import Services from './pages/Services.jsx'
import Pricing from './pages/Pricing.jsx'
import About from './pages/About.jsx'
import Contacts from './pages/Contacts.jsx'
import ServiceDetail from './pages/ServiceDetail.jsx'
import Faq from './pages/Faq.jsx'
import Blog from './pages/Blog.jsx'
import BlogPost from './pages/BlogPost.jsx'
import Privacy from './pages/Privacy.jsx'
import Consent from './pages/Consent.jsx'
import Terms from './pages/Terms.jsx'
import Requisites from './pages/Requisites.jsx'

const Login = lazy(() => import('./pages/Login.jsx'))
const Register = lazy(() => import('./pages/Register.jsx'))
const Reset = lazy(() => import('./pages/Reset.jsx'))
const Cabinet = lazy(() => import('./pages/Cabinet.jsx'))
const NewTicket = lazy(() => import('./pages/NewTicket.jsx'))
const TicketDetail = lazy(() => import('./pages/TicketDetail.jsx'))
const Profile = lazy(() => import('./pages/Profile.jsx'))
const Act = lazy(() => import('./pages/Act.jsx'))
const Admin = lazy(() => import('./pages/Admin.jsx'))
const Users = lazy(() => import('./pages/Users.jsx'))

function Loading() {
  return (
    <div className="container section">
      <p className="muted">Загрузка…</p>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:id" element={<ServiceDetail />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/about" element={<About />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/consent" element={<Consent />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/requisites" element={<Requisites />} />

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
              path="/cabinet/tickets/:id/act"
              element={
                <ProtectedRoute>
                  <Act />
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
                <ProtectedRoute staffOnly>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute adminOnly>
                  <Users />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </AuthProvider>
  )
}
