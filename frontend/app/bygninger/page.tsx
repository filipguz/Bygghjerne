"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch, apiErrorMessage } from "@/utils/api";
import { useBuilding } from "@/utils/building-context";
import LogoutButton from "@/components/LogoutButton";

interface Building {
  id: string;
  name: string;
  address: string | null;
  created_at: string;
}

export default function Bygninger() {
  const router = useRouter();
  const { setBuilding, clearBuilding } = useBuilding();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [updating, setUpdating] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    Promise.all([
      apiFetch("/buildings").then((r) => r.json()),
      apiFetch("/orgs/me").then((r) => r.json()),
    ])
      .then(([bData, org]) => {
        setBuildings(bData);
        setIsAdmin(org?.role === "admin");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function selectBuilding(building: Building) {
    setBuilding(building.id, building.name);
    router.push("/dashboard");
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await apiFetch("/buildings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, address: address || null }),
      });
      if (!res.ok) throw new Error(await apiErrorMessage(res));
      const building: Building = await res.json();
      setBuildings((prev) => [...prev, building].sort((a, b) => a.name.localeCompare(b.name)));
      setShowForm(false);
      setName("");
      setAddress("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Noe gikk galt.");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(b: Building) {
    setEditingBuilding(b);
    setEditName(b.name);
    setEditAddress(b.address ?? "");
    setConfirmDeleteId(null);
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingBuilding) return;
    setUpdating(true);
    try {
      const res = await apiFetch(`/buildings/${editingBuilding.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, address: editAddress || null }),
      });
      if (!res.ok) throw new Error(await apiErrorMessage(res));
      const updated: Building = await res.json();
      setBuildings((prev) =>
        prev.map((b) => (b.id === updated.id ? updated : b)).sort((a, b) => a.name.localeCompare(b.name))
      );
      setEditingBuilding(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Noe gikk galt.");
    } finally {
      setUpdating(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await apiFetch(`/buildings/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await apiErrorMessage(res));
      setBuildings((prev) => prev.filter((b) => b.id !== id));
      clearBuilding();
      setConfirmDeleteId(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Noe gikk galt.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleInvite() {
    setInviteLoading(true);
    try {
      const res = await apiFetch("/orgs/invite", { method: "POST" });
      if (!res.ok) throw new Error();
      const { token } = await res.json();
      setInviteLink(`${window.location.origin}/join?token=${token}`);
      setShowInviteModal(true);
      setCopied(false);
    } catch {
      setError("Kunne ikke opprette invitasjonslenke.");
    } finally {
      setInviteLoading(false);
    }
  }

  function copyLink() {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <svg className="h-6 w-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="font-bold text-brand-900 text-lg">Serv24</span>
          </Link>
          <LogoutButton />
        </div>
      </nav>

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dine bygg</h1>
            <p className="text-sm text-slate-500 mt-1">Velg et bygg for å åpne assistenten</p>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <button
                onClick={handleInvite}
                disabled={inviteLoading}
                className="border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-60"
              >
                {inviteLoading ? "Genererer…" : "Inviter kollega"}
              </button>
              <button
                onClick={() => { setShowForm(true); setConfirmDeleteId(null); setEditingBuilding(null); }}
                className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
              >
                + Nytt bygg
              </button>
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 mb-4">{error}</p>
        )}

        {showForm && (
          <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 flex flex-col gap-4">
            <h2 className="font-semibold text-slate-800">Legg til bygg</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Navn</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="f.eks. Rådhuset"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Adresse <span className="text-slate-400">(valgfri)</span>
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="f.eks. Rådhusplassen 1, Oslo"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-60"
              >
                {saving ? "Lagrer…" : "Lagre"}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setError(null); }}
                className="text-sm text-slate-600 hover:text-slate-900 transition-colors px-4 py-2"
              >
                Avbryt
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="text-sm text-slate-400">Laster…</p>
        ) : buildings.length === 0 ? (
          <p className="text-sm text-slate-400">Ingen bygg ennå. Legg til ditt første bygg.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {buildings.map((b) =>
              editingBuilding?.id === b.id ? (
                <form
                  key={b.id}
                  onSubmit={handleUpdate}
                  className="bg-white rounded-2xl border border-brand-300 p-6 flex flex-col gap-3"
                >
                  <p className="text-sm font-semibold text-slate-700">Rediger bygg</p>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder="Navn"
                  />
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder="Adresse (valgfri)"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={updating}
                      className="bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-60"
                    >
                      {updating ? "Lagrer…" : "Lagre"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingBuilding(null)}
                      className="text-sm text-slate-600 hover:text-slate-900 px-4 py-2"
                    >
                      Avbryt
                    </button>
                  </div>
                </form>
              ) : (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-brand-300 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => selectBuilding(b)}
                      className="flex items-start gap-3 flex-1 text-left min-w-0"
                    >
                      <div className="h-10 w-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                        <svg className="h-5 w-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 group-hover:text-brand-700 transition-colors">{b.name}</p>
                        {b.address && <p className="text-sm text-slate-500 mt-0.5 truncate">{b.address}</p>}
                      </div>
                    </button>

                    {isAdmin && (
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => startEdit(b)}
                          title="Rediger"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                              d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a4 4 0 01-1.414.93l-3 1 1-3a4 4 0 01.93-1.414z" />
                          </svg>
                        </button>
                        {confirmDeleteId === b.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(b.id)}
                              disabled={deletingId === b.id}
                              className="text-xs text-red-600 font-medium hover:text-red-800 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-60"
                            >
                              {deletingId === b.id ? "…" : "Ja, slett"}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-xs text-slate-500 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                              Avbryt
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(b.id)}
                            title="Slett"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </main>

      {showInviteModal && inviteLink && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h2 className="font-semibold text-slate-900 mb-1">Inviter kollega</h2>
            <p className="text-sm text-slate-500 mb-4">
              Del denne lenken. Den er gyldig i 7 dager og kan brukes av flere.
            </p>
            <div className="flex gap-2">
              <input
                readOnly
                value={inviteLink}
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-700 min-w-0"
              />
              <button
                onClick={copyLink}
                className="shrink-0 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
              >
                {copied ? "Kopiert!" : "Kopier"}
              </button>
            </div>
            <button
              onClick={() => setShowInviteModal(false)}
              className="mt-4 text-sm text-slate-500 hover:text-slate-800 transition-colors"
            >
              Lukk
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
