"use client";

import { useEffect, useMemo, useState } from "react";
import { httpClient } from "@/lib/httpClient";
import { Copy, Loader2, Gift, TicketPercent, Users, Share2, Euro, Clock, CheckCircle } from "lucide-react";

type InviteeItem = {
  id: string;
  email: string;
  status: "pending" | "rewarded" | string;
  createdAt?: string;
  firstOrder?: { id: string; paymentStatus?: string | null; status?: string | null } | null;
};

export default function ReferralClient() {
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState<string>("");
  const [shareUrl, setShareUrl] = useState<string>("");
  const [invitees, setInvitees] = useState<InviteeItem[]>([]);
  const [counters, setCounters] = useState<{ pending: number; rewarded: number }>({ pending: 0, rewarded: 0 });
  const [error, setError] = useState<string | null>(null);
  const [rewards, setRewards] = useState<Array<{
    id: string;
    code: string;
    type: string;
    value: number;
    minCartValue?: number | null;
    validFrom?: string | null;
    validUntil?: string | null;
    isActive: boolean;
    currentUses: number;
    maxUses: number | null;
    active: boolean;
  }>>([]);

  const [copyMsg, setCopyMsg] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [me, inv, rw] = await Promise.all([
          httpClient.get("/referral/me").then(r => r.data).catch(() => ({ success: false })),
          httpClient.get("/referral/invitees").then(r => r.data).catch(() => ({ success: false, invitees: [], counters: { pending: 0, rewarded: 0 } })),
          httpClient.get("/referral/rewards").then(r => r.data).catch(() => ({ success: false, rewards: [] })),
        ]);
        if (cancelled) return;
        if (me?.success && me.code) {
          setCode(me.code);
          setShareUrl(me.shareUrl || "");
        }
        if (inv?.success) {
          setInvitees(inv.invitees || []);
          setCounters(inv.counters || { pending: 0, rewarded: 0 });
        }
        if (rw?.success) {
          setRewards(rw.rewards || []);
        }
      } catch {
        if (!cancelled) setError("Impossible de charger le parrainage");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const maskedShareUrl = useMemo(
    () => shareUrl || (code ? `${process.env.NEXT_PUBLIC_APP_URL || ''}/?ref=${encodeURIComponent(code)}` : ""),
    [shareUrl, code]
  );

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyMsg("Copié ✔");
      setTimeout(() => setCopyMsg(""), 1500);
    } catch {}
  };

  const share = async () => {
    if (!maskedShareUrl) return;
    const text = `Profitez de 15% sur votre première commande avec mon code : ${code}`;
    try {
      if (navigator.share) await navigator.share({ title: "Chanvre Vert", text, url: maskedShareUrl });
      else await copy(`${text}\n${maskedShareUrl}`);
    } catch {}
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-[#D1D5DB]">
        <Loader2 className="animate-spin" size={18} />
        <span>Chargement…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 bg-red-900/40 border border-red-700 rounded-md text-red-100 text-sm">{error}</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-1">
        <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-emerald-600" /> Programme de parrainage
        </h1>
        <p className="text-[#9CA3AF]">Parrainez vos amis et gagnez des récompenses</p>
      </div>

      {/* Code card */}
      {code ? (
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm opacity-90">Votre code de parrainage</div>
              <div className="mt-1 flex items-center gap-3">
                <span className="text-3xl font-bold tracking-wide font-mono">{code}</span>
                <button onClick={() => copy(code)} className="p-2 bg-white/20 hover:bg-white/30 rounded-lg" title="Copier le code">
                  <Copy className="w-5 h-5" />
                </button>
                {maskedShareUrl && (
                  <button onClick={share} className="p-2 bg-white/20 hover:bg-white/30 rounded-lg" title="Partager">
                    <Share2 className="w-5 h-5" />
                  </button>
                )}
              </div>
              {copyMsg && <div className="text-xs mt-2 text-white/90">{copyMsg}</div>}
            </div>
            <Gift className="w-10 h-10 text-white/40" />
          </div>
        </div>
      ) : (
        <div className="bg-[#00343F] rounded-xl p-5 text-center border border-white/10">
          <div className="text-white text-lg font-medium">Aucun code disponible</div>
          <div className="text-[#BEC3CA] text-sm">Actualisez la page pour générer votre code.</div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#00343F] p-4 rounded-lg border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#BEC3CA] text-sm">Parrainages</p>
              <p className="text-2xl font-bold text-white">{invitees.length}</p>
            </div>
            <Users className="w-7 h-7 text-white/30" />
          </div>
        </div>
        <div className="bg-[#00343F] p-4 rounded-lg border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#BEC3CA] text-sm">Réussis</p>
              <p className="text-2xl font-bold text-green-500">{counters.rewarded}</p>
            </div>
            <CheckCircle className="w-7 h-7 text-green-500/30" />
          </div>
        </div>
        <div className="bg-[#00343F] p-4 rounded-lg border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#BEC3CA] text-sm">En attente</p>
              <p className="text-2xl font-bold text-amber-400">{counters.pending}</p>
            </div>
            <Clock className="w-7 h-7 text-amber-400/30" />
          </div>
        </div>
        <div className="bg-[#00343F] p-4 rounded-lg border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#BEC3CA] text-sm">Gains</p>
              <p className="text-2xl font-bold text-white">0€</p>
            </div>
            <Euro className="w-7 h-7 text-white/30" />
          </div>
        </div>
      </div>

      {/* Comment ça marche */}
      <div className="bg-[#00343F] p-5 rounded-lg border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Comment ça marche ?</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <div className="w-10 h-10 bg-emerald-500/20 text-white rounded-full flex items-center justify-center font-semibold mb-3">1</div>
            <h4 className="font-medium mb-1 text-white">Partagez votre code</h4>
            <p className="text-sm text-[#BEC3CA]">Envoyez votre code de parrainage à vos amis</p>
          </div>
          <div>
            <div className="w-10 h-10 bg-emerald-500/20 text-white rounded-full flex items-center justify-center font-semibold mb-3">2</div>
            <h4 className="font-medium mb-1 text-white">Ils passent commande</h4>
            <p className="text-sm text-[#BEC3CA]">Vos amis profitent de 15% de réduction dès 60€</p>
          </div>
          <div>
            <div className="w-10 h-10 bg-emerald-500/20 text-white rounded-full flex items-center justify-center font-semibold mb-3">3</div>
            <h4 className="font-medium mb-1 text-white">Vous êtes récompensé</h4>
            <p className="text-sm text-[#BEC3CA]">Vous recevez un code -30% utilisable dès 100€</p>
          </div>
        </div>
      </div>

      {/* Mes récompenses (codes parrain) */}
      <div className="bg-[#00343F] rounded-lg p-5 border border-white/10">
        <h2 className="text-lg font-medium text-white mb-2">Mes récompenses</h2>
        {rewards.length === 0 ? (
          <div className="text-sm text-[#BEC3CA]">Aucune récompense pour le moment.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rewards.map((r) => {
              const now = Date.now();
              const until = r.validUntil ? new Date(r.validUntil).getTime() : undefined;
              const from = r.validFrom ? new Date(r.validFrom).getTime() : undefined;
              const usedOut = r.maxUses !== null && r.maxUses !== undefined && r.currentUses >= r.maxUses;
              const expired = typeof until === 'number' && now > until;
              const notStarted = typeof from === 'number' && now < from;
              const state = r.active && !usedOut ? 'Actif' : usedOut ? 'Utilisé' : expired ? 'Expiré' : notStarted ? 'À venir' : 'Inactif';
              const badgeClass = r.active && !usedOut
                ? 'bg-emerald-900/40 text-emerald-300'
                : usedOut
                ? 'bg-slate-700/40 text-slate-200'
                : expired
                ? 'bg-amber-900/30 text-amber-200'
                : 'bg-slate-700/40 text-slate-200';
              return (
                <div key={r.id} className="p-3 rounded-md border border-[#09444C] bg-[#002B33] flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-[#003844] rounded-md"><TicketPercent size={18} className="text-[#10B981]" /></div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#D1D5DB] font-semibold tracking-wide">{r.code}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded ${badgeClass}`}>{state}</span>
                      </div>
                      <div className="text-xs text-[#BEC3CA] mt-1">
                        {r.type === 'percentage' ? `${r.value}% de remise` : `${r.value}€ de remise`}
                        {r.minCartValue ? ` • Min. panier ${r.minCartValue}€` : ''}
                      </div>
                      <div className="text-[11px] text-[#9CA3AF] mt-1">
                        {r.validFrom ? `Du ${new Date(r.validFrom).toLocaleDateString('fr-FR')}` : ''}
                        {r.validUntil ? ` au ${new Date(r.validUntil).toLocaleDateString('fr-FR')}` : ''}
                      </div>
                      <div className="text-[11px] text-[#9CA3AF]">{r.currentUses}/{r.maxUses ?? '∞'} utilisation(s)</div>
                    </div>
                  </div>
                  <div>
                    <button onClick={() => copy(r.code)} className="px-2 py-1 bg-[#00424c] hover:bg-[#005866] rounded-md text-[#D1D5DB] flex items-center gap-1 text-xs">
                      <Copy size={14} /> Copier
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Filleuls */}
      <div className="bg-[#00343F] rounded-lg p-5 border border-white/10">
        <h2 className="text-lg font-medium text-white mb-2">Mes filleuls</h2>
        <div className="text-sm text-[#BEC3CA] mb-2">
          {counters.rewarded} récompense(s) • {counters.pending} en attente
        </div>
        {invitees.length === 0 ? (
          <div className="text-[#BEC3CA] text-sm">Aucun filleul pour le moment.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-[#9CA3AF]">
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">État</th>
                  <th className="py-2 pr-4">Commande</th>
                  <th className="py-2 pr-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {invitees.map((it) => (
                  <tr key={it.id} className="border-t border-[#0b3a41]">
                    <td className="py-2 pr-4 text-[#D1D5DB]">{it.email || "(email masqué)"}</td>
                    <td className="py-2 pr-4">
                      <span className={`px-2 py-1 rounded text-xs ${it.status === 'rewarded' ? 'bg-emerald-900/40 text-emerald-300' : it.status === 'pending' ? 'bg-slate-700/40 text-slate-200' : 'bg-amber-900/30 text-amber-200'}`}>
                        {it.status === 'rewarded' ? 'Validé' : it.status === 'pending' ? 'En attente' : it.status}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-[#BEC3CA]">
                      {it.firstOrder ? `${it.firstOrder.status || ''} (${it.firstOrder.paymentStatus || ''})` : '-'}
                    </td>
                    <td className="py-2 pr-4 text-[#9CA3AF]">{it.createdAt ? new Date(it.createdAt).toLocaleDateString('fr-FR') : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Conditions */}
      <div className="p-4 bg-[#00343F] border border-white/10 rounded-lg">
        <h4 className="font-semibold text-white mb-2">Conditions du programme</h4>
        <ul className="text-sm text-[#BEC3CA] space-y-1">
          <li>• Code valable 90 jours</li>
          <li>• Filleul: commande minimum de 60€ pour appliquer -15%</li>
          <li>• Parrain: code -30% utilisable dès 100€ de commande</li>
          <li>• Les récompenses sont créditées après validation de la commande</li>
        </ul>
        <p className="text-xs text-[#9CA3AF] mt-3 italic">* Nous nous réservons le droit d&apos;arrêter le programme à tout moment</p>
      </div>
    </div>
  );
}
