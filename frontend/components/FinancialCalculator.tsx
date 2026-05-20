'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Calculator, Info } from 'lucide-react'
import { Project } from '@/types/projects'

interface Props { project: Project }

const CITY_DEFAULTS: Record<string, number> = {
  Oslo:         87000,
  Kristiansand: 52000,
}

const fmt    = (n: number) => Math.round(n).toLocaleString('no')
const fmtM   = (n: number) => (Math.round(n * 10) / 10).toLocaleString('no', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const fmtPct = (n: number) => (Math.round(n * 10) / 10).toFixed(1) + ' %'

function compute(project: Project, sp: number, bk: number, sg: number, ekPct: number, rente: number, aar: number) {
  const M          = 1_000_000
  const bra        = project.bra_m2 ?? 0
  const investMNOK = project.investment_mnok ?? 0
  const salgsverdi = (bra * sp * sg / 100) / M
  const bygging    = (bra * bk) / M
  const tomt       = investMNOK * 0.14
  const prosjAdmin = bygging * 0.08
  const salgsKost  = salgsverdi * 0.03
  const totalKost  = bygging + tomt + prosjAdmin + salgsKost
  const bruttoFort = salgsverdi - totalKost
  const bruttoMargin = salgsverdi > 0 ? (bruttoFort / salgsverdi) * 100 : 0
  const ek         = totalKost * (ekPct / 100)
  const lan        = totalKost * (1 - ekPct / 100)
  const finansKost = lan * (rente / 100) * aar
  const nettoFort  = bruttoFort - finansKost
  const roe        = ek > 0 ? (nettoFort / ek) * 100 : 0
  const irr        = aar > 0 && (1 + roe / 100) > 0 ? (Math.pow(1 + roe / 100, 1 / aar) - 1) * 100 : 0
  return { salgsverdi, bygging, tomt, prosjAdmin, salgsKost, totalKost, bruttoFort, bruttoMargin, ek, lan, finansKost, nettoFort, roe, irr }
}

export default function FinancialCalculator({ project }: Props) {
  const [open,  setOpen]  = useState(false)
  const [sp,    setSp]    = useState(CITY_DEFAULTS[project.location ?? ''] ?? 65000)
  const [bk,    setBk]    = useState(33000)
  const [sg,    setSg]    = useState(90)
  const [ekPct, setEkPct] = useState(30)
  const [rente, setRente] = useState(5.5)
  const [aar,   setAar]   = useState(Math.max(2, (project.completion_year ?? (new Date().getFullYear() + 2)) - new Date().getFullYear()))

  const r = useMemo(() => compute(project, sp, bk, sg, ekPct, rente, aar),
    [project, sp, bk, sg, ekPct, rente, aar])

  const profitColor = r.nettoFort >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
  const roeColor    = r.roe >= 15 ? 'text-emerald-600 dark:text-emerald-400'
                    : r.roe >= 0  ? 'text-amber-600 dark:text-amber-400'
                    :               'text-red-600 dark:text-red-400'

  const chartBars = [
    { label: 'Bygging',       value: r.bygging,    color: '#ef4444' },
    { label: 'Tomt',          value: r.tomt,       color: '#f97316' },
    { label: 'Prosjektering', value: r.prosjAdmin, color: '#f59e0b' },
    { label: 'Finansiering',  value: r.finansKost, color: '#8b5cf6' },
    { label: 'Salgskostnader',value: r.salgsKost,  color: '#ec4899' },
    { label: 'Netto',         value: Math.max(0, r.nettoFort), color: '#10b981' },
  ]
  const chartTotal = chartBars.reduce((s, b) => s + b.value, 0)

  return (
    <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
            <Calculator size={14} className="text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-sm font-semibold text-slate-800 dark:text-gray-200">Finansiell kalkulator</span>
          <span className="text-xs text-slate-400 dark:text-gray-600 hidden sm:inline">— juster forutsetninger i sanntid</span>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} className="text-slate-400 dark:text-gray-600" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-100 dark:border-gray-800 p-5">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-gray-600">Forutsetninger</p>
                  <SliderRow label="Salgspris" unit="kr/m²" value={sp} min={25000} max={150000} step={1000} onChange={setSp} display={fmt(sp)} />
                  <SliderRow label="Byggekostnad" unit="kr/m²" value={bk} min={18000} max={65000} step={500} onChange={setBk} display={fmt(bk)} />
                  <SliderRow label="Salgsgrad" unit="%" value={sg} min={50} max={100} step={1} onChange={setSg} display={sg + ' %'} />
                  <SliderRow label="Egenkapital" unit="%" value={ekPct} min={10} max={60} step={1} onChange={setEkPct} display={ekPct + ' %'} />
                  <SliderRow label="Lånerente" unit="%" value={rente} min={2.0} max={12.0} step={0.1} onChange={setRente} display={rente.toFixed(1) + ' %'} />
                  <SliderRow label="Prosjektperiode" unit="år" value={aar} min={1} max={10} step={1} onChange={setAar} display={aar + ' år'} />
                  <div className="flex items-start gap-1.5 mt-2 p-3 rounded-lg bg-slate-50 dark:bg-gray-800/60 border border-slate-200 dark:border-gray-700">
                    <Info size={11} className="text-slate-400 dark:text-gray-600 mt-0.5 flex-none" />
                    <p className="text-[10px] text-slate-400 dark:text-gray-600 leading-relaxed">
                      Forenklede estimater. Inkluderer ikke MVA, tekniske kostnader eller kommunale avgifter.
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-gray-600 mb-4">Resultat</p>
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    <ResultCard label="Total salgsverdi"    value={`${fmtM(r.salgsverdi)} MNOK`}  sub={`${fmt(sp)} kr/m² × ${sg}%`}              neutral />
                    <ResultCard label="Totale kostnader"    value={`${fmtM(r.totalKost)} MNOK`}   sub={`${fmtM((r.totalKost / r.salgsverdi) * 100)} % av salg`} neutral />
                    <ResultCard label="Bruttofortjeneste"   value={`${fmtM(r.bruttoFort)} MNOK`}  sub={`Margin: ${fmtPct(r.bruttoMargin)}`}        positive={r.bruttoFort > 0} negative={r.bruttoFort <= 0} />
                    <ResultCard label="Egenkapitalkrav"     value={`${fmtM(r.ek)} MNOK`}          sub={`Lån: ${fmtM(r.lan)} MNOK`}                neutral />
                    <ResultCard label="Finanskostnader"     value={`${fmtM(r.finansKost)} MNOK`}  sub={`${rente}% × ${aar} år`}                    neutral />
                    <ResultCard label="Salgskostnader"      value={`${fmtM(r.salgsKost)} MNOK`}   sub="3 % av salgsverdi"                          neutral />
                    <ResultCard label="Netto fortjeneste"   value={`${fmtM(r.nettoFort)} MNOK`}   sub="Etter alle kostnader"                       positive={r.nettoFort > 0} negative={r.nettoFort <= 0} large />
                    <ResultCard label="EK-avkastning (ROE)" value={fmtPct(r.roe)}                 sub={`IRR: ${fmtPct(r.irr)}`}                    positive={r.roe >= 15} warning={r.roe > 0 && r.roe < 15} negative={r.roe <= 0} large />
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-400 dark:text-gray-600 mb-2">Kostnadsfordeling (av salgsverdi)</p>
                    <div className="flex h-5 rounded-lg overflow-hidden gap-px mb-3">
                      {chartBars.map((bar) => {
                        const pct = chartTotal > 0 ? Math.max(0, (bar.value / r.salgsverdi) * 100) : 0
                        return (
                          <motion.div key={bar.label} className="h-full relative group cursor-pointer"
                            style={{ background: bar.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            title={`${bar.label}: ${fmtM(bar.value)} MNOK (${pct.toFixed(1)}%)`}>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                              {bar.label}: {fmtM(bar.value)} MNOK
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                    <div className="grid grid-cols-3 gap-x-3 gap-y-1">
                      {chartBars.map((bar) => {
                        const pct = r.salgsverdi > 0 ? Math.max(0, (bar.value / r.salgsverdi) * 100) : 0
                        return (
                          <div key={bar.label} className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-sm flex-none" style={{ background: bar.color }} />
                            <span className="text-[10px] text-slate-500 dark:text-gray-500 truncate">{bar.label}</span>
                            <span className="text-[10px] text-slate-400 dark:text-gray-600 ml-auto">{pct.toFixed(0)}%</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className={`mt-4 px-4 py-3 rounded-xl border text-xs flex items-center justify-between ${
                    r.roe >= 20 ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' :
                    r.roe >= 10 ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20' :
                                  'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20'
                  }`}>
                    <span className={r.roe >= 20 ? 'text-emerald-700 dark:text-emerald-400' : r.roe >= 10 ? 'text-amber-700 dark:text-amber-400' : 'text-red-700 dark:text-red-400'}>
                      {r.roe >= 20 ? '✓ Godt prosjekt — over 20% EK-avkastning'
                       : r.roe >= 10 ? '⚠ Marginal lønnsomhet — 10–20% EK-avkastning'
                       :               '✗ Ikke lønnsomt med disse forutsetningene'}
                    </span>
                    <span className={`font-bold text-sm ${profitColor} ${roeColor}`}>{fmtPct(r.roe)}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SliderRow({ label, unit, value, min, max, step, onChange, display }: {
  label: string; unit: string; value: number; min: number; max: number
  step: number; onChange: (v: number) => void; display: string
}) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-slate-500 dark:text-gray-400">{label}</span>
        <span className="text-xs font-semibold text-slate-800 dark:text-gray-200 tabular-nums">{display}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ background: `linear-gradient(to right, #3b82f6 ${pct}%, var(--slider-track, #e2e8f0) ${pct}%)` }}
        className="w-full [--slider-track:#e2e8f0] dark:[--slider-track:#374151]"
      />
    </div>
  )
}

function ResultCard({ label, value, sub, positive, negative, warning, neutral, large }: {
  label: string; value: string; sub?: string
  positive?: boolean; negative?: boolean; warning?: boolean; neutral?: boolean; large?: boolean
}) {
  const valueColor = positive ? 'text-emerald-600 dark:text-emerald-400'
                   : negative ? 'text-red-600 dark:text-red-400'
                   : warning  ? 'text-amber-600 dark:text-amber-400'
                   :            'text-slate-800 dark:text-gray-200'
  return (
    <div className={`rounded-xl p-3 border ${
      large ? 'bg-slate-50 dark:bg-gray-800/80 border-slate-300 dark:border-gray-700'
             : 'bg-white dark:bg-gray-900 border-slate-200 dark:border-gray-800'
    }`}>
      <p className="text-[10px] text-slate-400 dark:text-gray-600 mb-1 leading-tight">{label}</p>
      <p className={`font-bold tabular-nums ${large ? 'text-base' : 'text-sm'} ${valueColor}`}>{value}</p>
      {sub && <p className="text-[10px] text-slate-400 dark:text-gray-600 mt-0.5">{sub}</p>}
    </div>
  )
}
