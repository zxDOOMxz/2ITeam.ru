import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { supabase } from '../lib/supabase.js'

const AuthContext = createContext(null)

const PROFILE_SELECT =
  'id, email, full_name, phone, address, inn, role, company_id, companies(id, name, inn, invite_code, legal_name, kpp, ogrn, legal_address, bank_name, bik, account, corr_account, contact_person, owner_id)'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null)
      return
    }
    const { data } = await supabase
      .from('profiles')
      .select(PROFILE_SELECT)
      .eq('id', userId)
      .maybeSingle()
    setProfile(data ?? null)
  }, [])

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      loadProfile(data.session?.user?.id).finally(() => {
        if (active) setLoading(false)
      })
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      // Отложенный вызов, чтобы не блокировать auth-клиент (рекомендация Supabase)
      setTimeout(() => loadProfile(next?.user?.id), 0)
    })

    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [loadProfile])

  const userId = session?.user?.id

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      company: profile?.companies ?? null,
      isAdmin: profile?.role === 'admin',
      isStaff: profile?.role === 'admin' || profile?.role === 'manager',
      loading,
      signIn: (email, password) =>
        supabase.auth.signInWithPassword({ email, password }),
      signUp: (email, password, fullName, phone) =>
        supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName, phone } },
        }),
      signOut: () => supabase.auth.signOut(),
      resetPassword: (email) =>
        supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset`,
        }),
      updatePassword: (password) => supabase.auth.updateUser({ password }),
      updateEmail: async (email) => {
        const { data, error } = await supabase.auth.updateUser({ email })
        if (!error) {
          await supabase.from('profiles').update({ email }).eq('id', userId)
          await loadProfile(userId)
        }
        return { data, error }
      },
      reloadProfile: () => loadProfile(userId),
      updateProfile: async (fields) => {
        const { error } = await supabase
          .from('profiles')
          .update(fields)
          .eq('id', userId)
        if (!error) await loadProfile(userId)
        return { error }
      },
      createCompany: async (name, inn) => {
        const { data, error } = await supabase.rpc('create_company', {
          p_name: name,
          p_inn: inn || null,
        })
        if (!error) await loadProfile(userId)
        return { data, error }
      },
      updateCompany: async (fields) => {
        const companyId = profile?.company_id
        if (!companyId) return { error: new Error('Компания не найдена') }
        const { error } = await supabase
          .from('companies')
          .update(fields)
          .eq('id', companyId)
        if (!error) await loadProfile(userId)
        return { error }
      },
      joinCompany: async (code) => {
        const { data, error } = await supabase.rpc('join_company', { code })
        if (!error) await loadProfile(userId)
        return { data, error }
      },
      leaveCompany: async () => {
        const { error } = await supabase.rpc('leave_company')
        if (!error) await loadProfile(userId)
        return { error }
      },
    }),
    [session, profile, loading, userId, loadProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth должен использоваться внутри AuthProvider')
  return ctx
}
