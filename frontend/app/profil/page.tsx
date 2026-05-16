'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/AppShell'
import { apiFetch, apiErrorMessage } from '@/utils/api'
import { createClient } from '@/utils/supabase/client'
import { LogOut, Trash2, User } from 'lucide-react'

interface Profile {
  id: string
  email: string
  created_at: string
  org_role: string | null
}

export default function ProfilPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const deleteInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    apiFetch('/users/me')
      .then((r) => r.json())
      .then(setProfile)
      .finally(() => setLoading(false))
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  async function handleDeleteAccount() {
    if (!profile || deleteConfirm !== profile.email) return
    setDeleting(true)
    setDeleteError(null)
    try {
      const res = await apiFetch('/users/me', { method: 'DELETE' })
      if (!res.ok) throw new Error(await apiErrorMessage(res))
      router.push('/login')
    } catch (e: unknown) {
      setDeleteError(e instanceof Error ? e.message : 'Noe gikk galt.')
      setDeleting(false)
    }
  }

  const initials = profile?.email?.charAt(0).toUpperCase() ?? '?'

  return (
    <AppShell>
      <div className="flex-1 overflow-auto">
        <div className="flex items-center px-4 md:px-6 py-4 bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 shrink-0">
          <h1 className="text-lg font-bold text-slate-900 dark:text-gray-100">Profil</h1>
        </div>

        <div className="px-4 md:px-6 py-8 max-w-md">
          {loading ? (
            <div className="flex flex-col gap-4">
              <div className="h-20 w-20 rounded-full bg-slate-100 dark:bg-gray-800 animate-pulse" />
              <div className="h-4 w-48 bg-slate-100 dark:bg-gray-800 rounded animate-pulse" />
              <div className="h-4 w-32 bg-slate-100 dark:bg-gray-800 rounded animate-pulse" />
            </div>
          ) : (
            <div className="flex flex-col gap-6">

              {/* Avatar + info */}
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center shrink-0">
                  <span className="text-2xl font-bold text-brand-600 dark:text-brand-400">{initials}</span>
                </div>
                <div>
                  <p className="text-base font-semibold text-slate-900 dark:text-gray-100">{profile?.email}</p>
                  <p className="text-sm text-slate-400 dark:text-gray-500">
                    {profile?.org_role === 'admin' ? 'Administrator' : 'Medlem'}
                  </p>
                </div>
              </div>

              {/* Details card */}
              <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl divide-y divide-slate-100 dark:divide-gray-800">
                <div className="flex items-center justify-between px-5 py-3.5">
                  <span className="text-xs text-slate-400 dark:text-gray-500">E-post</span>
                  <span className="text-sm font-medium text-slate-800 dark:text-gray-200">{profile?.email}</span>
                </div>
                <div className="flex items-center justify-between px-5 py-3.5">
                  <span className="text-xs text-slate-400 dark:text-gray-500">Rolle</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    profile?.org_role === 'admin'
                      ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-400'
                      : 'bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-400'
                  }`}>
                    {profile?.org_role === 'admin' ? 'Admin' : 'Medlem'}
                  </span>
                </div>
                <div className="flex items-center justify-between px-5 py-3.5">
                  <span className="text-xs text-slate-400 dark:text-gray-500">Konto opprettet</span>
                  <span className="text-sm text-slate-600 dark:text-gray-400">
                    {profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString('nb-NO', { day: '2-digit', month: 'long', year: 'numeric' })
                      : '—'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-medium text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <LogOut size={16} className="text-slate-400 dark:text-gray-500" />
                  Logg ut
                </button>

                <button
                  onClick={() => { setShowDeleteDialog(true); setDeleteConfirm(''); setDeleteError(null); setTimeout(() => deleteInputRef.current?.focus(), 50) }}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-red-200 dark:border-red-900/50 bg-white dark:bg-gray-900 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 size={16} />
                  Slett konto
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-slate-200 dark:border-gray-700 w-full max-w-md p-6 flex flex-col gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-gray-100">Slett konto</h3>
              <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
                Dette er permanent og kan ikke angres. All data knyttet til kontoen din slettes.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-600 dark:text-gray-400">
                Skriv inn <span className="font-semibold text-slate-800 dark:text-gray-200">{profile?.email}</span> for å bekrefte
              </label>
              <input
                ref={deleteInputRef}
                type="email"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && deleteConfirm === profile?.email && handleDeleteAccount()}
                placeholder={profile?.email}
                className="border border-slate-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-slate-800 dark:text-gray-100 placeholder-slate-300 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/40"
              />
            </div>

            {deleteError && (
              <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                {deleteError}
              </p>
            )}

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDeleteDialog(false)}
                disabled={deleting}
                className="px-4 py-2 text-sm text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-100 transition-colors disabled:opacity-50"
              >
                Avbryt
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== profile?.email || deleting}
                className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-40"
              >
                {deleting ? 'Sletter…' : 'Slett konto permanent'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
