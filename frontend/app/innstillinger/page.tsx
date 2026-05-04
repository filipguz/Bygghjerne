"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { apiFetch, apiErrorMessage } from "@/utils/api";

interface Member {
  user_id: string;
  email: string;
  role: string;
  joined_at: string;
  is_me: boolean;
}

interface Org {
  id: string;
  name: string;
  role: string;
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
      role === "admin"
        ? "bg-brand-100 text-brand-700"
        : "bg-slate-100 text-slate-600"
    }`}>
      {role === "admin" ? "Admin" : "Medlem"}
    </span>
  );
}

export default function Innstillinger() {
  const [org, setOrg] = useState<Org | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  // Org name edit
  const [editingName, setEditingName] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  // Invite
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiFetch("/orgs/me").then((r) => r.json()),
      apiFetch("/orgs/members").then((r) => r.json()),
    ]).then(([orgData, membersData]) => {
      setOrg(orgData);
      setOrgName(orgData?.name ?? "");
      setMembers(membersData);
    }).finally(() => setLoading(false));
  }, []);

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    setNameError(null);
    setSavingName(true);
    try {
      const res = await apiFetch("/orgs/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: orgName }),
      });
      if (!res.ok) throw new Error(await apiErrorMessage(res));
      const updated = await res.json();
      setOrg((prev) => prev ? { ...prev, name: updated.name } : prev);
      setEditingName(false);
    } catch (e: unknown) {
      setNameError(e instanceof Error ? e.message : "Noe gikk galt.");
    } finally {
      setSavingName(false);
    }
  }

  async function handleInvite() {
    setInviteLoading(true);
    setInviteError(null);
    try {
      const res = await apiFetch("/orgs/invite", { method: "POST" });
      if (!res.ok) throw new Error(await apiErrorMessage(res));
      const { token } = await res.json();
      setInviteLink(`${window.location.origin}/join?token=${token}`);
      setCopied(false);
    } catch (e: unknown) {
      setInviteError(e instanceof Error ? e.message : "Kunne ikke opprette invitasjonslenke.");
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

  const isAdmin = org?.role === "admin";

  return (
    <AppShell>
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="flex items-center px-4 md:px-6 py-4 bg-white border-b border-slate-200 shrink-0">
          <h1 className="text-lg font-bold text-slate-900">Innstillinger</h1>
        </div>

        <div className="px-4 md:px-6 py-6 flex flex-col gap-6 max-w-2xl">

          {/* Org section */}
          <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-800">Organisasjon</h2>
            </div>
            <div className="px-5 py-4">
              {loading ? (
                <div className="h-8 bg-slate-100 rounded animate-pulse w-48" />
              ) : editingName ? (
                <form onSubmit={handleSaveName} className="flex flex-col gap-3">
                  <input
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent w-full max-w-xs"
                    autoFocus
                  />
                  {nameError && (
                    <p className="text-xs text-red-600">{nameError}</p>
                  )}
                  <div className="flex gap-2">
                    <button type="submit" disabled={savingName}
                      className="bg-brand-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-brand-700 transition-colors disabled:opacity-60">
                      {savingName ? "Lagrer…" : "Lagre"}
                    </button>
                    <button type="button" onClick={() => { setEditingName(false); setOrgName(org?.name ?? ""); setNameError(null); }}
                      className="text-xs text-slate-500 hover:text-slate-800 px-3 py-1.5 transition-colors">
                      Avbryt
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Navn</p>
                    <p className="text-sm font-semibold text-slate-800">{org?.name}</p>
                  </div>
                  {isAdmin && (
                    <button onClick={() => setEditingName(true)}
                      className="text-xs text-brand-600 hover:text-brand-800 font-medium transition-colors">
                      Rediger
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Team section */}
          <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-800">Team</h2>
              <span className="text-xs text-slate-400">{members.length} {members.length === 1 ? "person" : "personer"}</span>
            </div>

            {loading ? (
              <div className="p-5 flex flex-col gap-3">
                {[0, 1].map((i) => (
                  <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {members.map((m) => (
                  <div key={m.user_id} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold text-slate-500">
                          {m.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">
                          {m.email}
                          {m.is_me && <span className="ml-1.5 text-xs text-slate-400 font-normal">(deg)</span>}
                        </p>
                        <p className="text-xs text-slate-400">
                          Ble med {new Date(m.joined_at).toLocaleDateString("nb-NO", { day: "2-digit", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <RoleBadge role={m.role} />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Invite section */}
          {isAdmin && (
            <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-slate-800">Inviter kollega</h2>
                <p className="text-xs text-slate-400 mt-0.5">Generer en invitasjonslenke som er gyldig i 7 dager</p>
              </div>
              <div className="px-5 py-4 flex flex-col gap-3">
                {inviteError && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{inviteError}</p>
                )}

                {inviteLink ? (
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={inviteLink}
                      className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-xs bg-slate-50 text-slate-700 min-w-0"
                    />
                    <button
                      onClick={copyLink}
                      className="shrink-0 bg-brand-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-brand-700 transition-colors"
                    >
                      {copied ? "Kopiert!" : "Kopier"}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleInvite}
                    disabled={inviteLoading}
                    className="self-start bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-60"
                  >
                    {inviteLoading ? "Genererer…" : "Generer invitasjonslenke"}
                  </button>
                )}

                {inviteLink && (
                  <button
                    onClick={() => { setInviteLink(null); setCopied(false); }}
                    className="self-start text-xs text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Generer ny lenke
                  </button>
                )}
              </div>
            </section>
          )}

        </div>
      </div>
    </AppShell>
  );
}
