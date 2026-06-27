import { useState, useRef, useEffect } from "react"
import axios from "axios"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"

const SESSION_ID = "user_" + Math.random().toString(36).substr(2, 9)
const API = "http://localhost:8000"

const DARK = window.matchMedia('(prefers-color-scheme: dark)').matches

const C = {
  primary: "#2563EB",
  primaryLight: DARK ? "#1e3a5f" : "#EFF6FF",
  primaryText: DARK ? "#93c5fd" : "#1d4ed8",
  primaryBorder: DARK ? "#1d4ed8" : "#bfdbfe",
  success: "#16A34A",
  successLight: DARK ? "#14532d" : "#F0FDF4",
  successText: DARK ? "#86efac" : "#15803d",
  successBorder: DARK ? "#166534" : "#bbf7d0",
  warning: "#D97706",
  warningLight: DARK ? "#451a03" : "#FFFBEB",
  warningText: DARK ? "#fcd34d" : "#b45309",
  warningBorder: DARK ? "#92400e" : "#fde68a",
  danger: "#DC2626",
  dangerLight: DARK ? "#450a0a" : "#FEF2F2",
  dangerText: DARK ? "#fca5a5" : "#b91c1c",
  dangerBorder: DARK ? "#991b1b" : "#fecaca",
  text: DARK ? "#f9fafb" : "#111827",
  textSecondary: DARK ? "#9ca3af" : "#6B7280",
  textMuted: DARK ? "#6b7280" : "#9CA3AF",
  border: DARK ? "#374151" : "#E5E7EB",
  borderStrong: DARK ? "#4b5563" : "#D1D5DB",
  surface0: DARK ? "#030712" : "#F9FAFB",
  surface1: DARK ? "#1f2937" : "#F3F4F6",
  surface2: DARK ? "#111827" : "#FFFFFF",
  onPrimary: "#ffffff",
  onSuccess: DARK ? "#052e16" : "#ffffff",
  onDanger: "#ffffff",
}

function HealthRing({ score }) {
  const radius = 30
  const circumference = 2 * Math.PI * radius
  const filled = ((score || 0) / 100) * circumference
  const color = score >= 70 ? C.success : score >= 40 ? C.warning : C.danger
  const textColor = score >= 70 ? C.successText : score >= 40 ? C.warningText : C.dangerText
  const label = score >= 70 ? "Good" : score >= 40 ? "Fair" : "Needs work"

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
      <div style={{ position: "relative", width: "72px", height: "72px", flexShrink: 0 }}>
        <svg width="72" height="72" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="36" cy="36" r={radius} fill="none" stroke={C.border} strokeWidth="5" />
          <circle cx="36" cy="36" r={radius} fill="none" stroke={color} strokeWidth="5"
            strokeDasharray={circumference} strokeDashoffset={circumference - filled}
            strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
        </svg>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
          <div style={{ fontSize: "18px", fontWeight: "500", color, lineHeight: 1 }}>{score ?? "--"}</div>
        </div>
      </div>
      <div>
        <div style={{ fontSize: "11px", color: C.textMuted, marginBottom: "2px" }}>Financial health</div>
        <div style={{ fontSize: "16px", fontWeight: "500", color: textColor }}>{label}</div>
        <div style={{ fontSize: "10px", color: C.textMuted }}>/ 100</div>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, color }) {
  const isEmpty = value === "--"
  return (
    <div style={{ background: C.surface2, border: `0.5px solid ${C.border}`, borderRadius: "10px", padding: "14px" }}>
      <div style={{ fontSize: "10px", color: C.textMuted, fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>{label}</div>
      <div style={{ fontSize: "18px", fontWeight: "500", color: isEmpty ? C.textMuted : (color || C.text) }}>{value}</div>
      {sub && <div style={{ fontSize: "10px", color: C.textMuted, marginTop: "2px" }}>{sub}</div>}
    </div>
  )
}

function GapItem({ gap }) {
  const color = gap.severity === "high" ? C.dangerText : gap.severity === "medium" ? C.warningText : C.primaryText
  const bg = gap.severity === "high" ? C.dangerLight : gap.severity === "medium" ? C.warningLight : C.primaryLight
  const dot = gap.severity === "high" ? C.danger : gap.severity === "medium" ? C.warning : C.primary
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "10px 12px", background: bg, borderRadius: "8px", marginBottom: "8px" }}>
      <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: dot, marginTop: "5px", flexShrink: 0 }} />
      <div>
        <div style={{ fontSize: "13px", color: C.text, lineHeight: "1.5" }}>{gap.message}</div>
        <div style={{ fontSize: "11px", color, marginTop: "2px", fontWeight: "500", textTransform: "capitalize" }}>{gap.severity} priority</div>
      </div>
    </div>
  )
}

function ProductCard({ product }) {
  const color = product.severity === "high" ? C.dangerText : product.severity === "medium" ? C.warningText : C.primaryText
  const dot = product.severity === "high" ? C.danger : product.severity === "medium" ? C.warning : C.primary
  return (
    <div style={{ background: C.surface2, border: `0.5px solid ${C.border}`, borderLeft: `3px solid ${dot}`, borderRadius: "10px", padding: "16px 18px", marginBottom: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "5px" }}>
            <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: dot }} />
            <div style={{ fontSize: "10px", color, fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.4px" }}>{product.severity} priority</div>
          </div>
          <div style={{ fontSize: "14px", fontWeight: "500", color: C.text, marginBottom: "5px" }}>{product.name}</div>
          <div style={{ fontSize: "12px", color: C.textSecondary, lineHeight: "1.6" }}>{product.description}</div>
          {product.gap_message && (
            <div style={{ marginTop: "8px", fontSize: "11px", color: C.textMuted, background: C.surface1, padding: "6px 10px", borderRadius: "6px" }}>
              Why: {product.gap_message}
            </div>
          )}
        </div>
        <button style={{ background: C.surface1, border: `0.5px solid ${C.borderStrong}`, borderRadius: "7px", padding: "6px 14px", fontSize: "12px", color: C.text, cursor: "pointer", fontWeight: "500", whiteSpace: "nowrap", flexShrink: 0 }}>
          {product.cta}
        </button>
      </div>
    </div>
  )
}

function ProgressBar({ label, current, target, color }) {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0
  return (
    <div style={{ marginBottom: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "7px" }}>
        <span style={{ color: C.text, fontWeight: "500" }}>{label}</span>
        <span style={{ color: C.textSecondary, fontSize: "12px" }}>₹{(current || 0).toLocaleString()} / ₹{(target || 0).toLocaleString()}</span>
      </div>
      <div style={{ background: C.surface1, borderRadius: "999px", height: "5px" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color || C.primary, borderRadius: "999px", transition: "width 0.8s ease" }} />
      </div>
      <div style={{ fontSize: "10px", color: C.textMuted, marginTop: "4px" }}>{Math.round(pct)}% complete</div>
    </div>
  )
}

function BudgetPieChart({ twin }) {
  const fixed = twin.fixed_expenses || 0
  const variable = twin.variable_expenses || 0
  const savings = twin.monthly_savings || 0
  const income = twin.monthly_income || 0

  if (!income) return (
    <div style={{ textAlign: "center", padding: "32px", color: C.textMuted, fontSize: "13px" }}>
      Income data needed to show budget breakdown.
    </div>
  )

  const data = [
    { name: "Fixed expenses", value: fixed, color: C.danger },
    { name: "Variable expenses", value: variable, color: C.warning },
    { name: "Savings", value: Math.max(savings, 0), color: C.success },
  ].filter(d => d.value > 0)

  return (
    <div>
      <div style={{ fontSize: "10px", color: C.textMuted, fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "16px" }}>Monthly budget</div>
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <ResponsiveContainer width={150} height={150}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={68} paddingAngle={2} dataKey="value">
              {data.map((entry, index) => <Cell key={index} fill={entry.color} />)}
            </Pie>
            <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} contentStyle={{ background: C.surface2, border: `0.5px solid ${C.border}`, borderRadius: "8px", fontSize: "12px", color: C.text }} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ flex: 1 }}>
          {data.map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: item.color }} />
                <span style={{ fontSize: "12px", color: C.textSecondary }}>{item.name}</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "13px", fontWeight: "500", color: C.text }}>₹{item.value.toLocaleString()}</div>
                <div style={{ fontSize: "10px", color: C.textMuted }}>{Math.round((item.value / income) * 100)}%</div>
              </div>
            </div>
          ))}
          <div style={{ borderTop: `0.5px solid ${C.border}`, paddingTop: "10px", marginTop: "4px", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", fontWeight: "500", color: C.text }}>Total income</span>
            <span style={{ fontSize: "13px", fontWeight: "500", color: C.primaryText }}>₹{income.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function GoalTimeline({ twin }) {
  const [goalName, setGoalName] = useState("")
  const [goalAmount, setGoalAmount] = useState("")
  const [allocation, setAllocation] = useState(30)
  const [result, setResult] = useState(null)

  const monthlySavings = twin.monthly_savings || 0
  const allocatedSavings = Math.floor(monthlySavings * allocation / 100)

  const calculate = () => {
    const target = parseInt(goalAmount.replace(/,/g, "").replace(/\./g, ""))
    if (!target || allocatedSavings <= 0) return
    const months = Math.ceil(target / allocatedSavings)
    const years = Math.floor(months / 12)
    const rem = months % 12
    const timeStr = years > 0 ? `${years}y${rem > 0 ? " " + rem + "m" : ""}` : `${months}m`
    const r = 0.071 / 12
    const mwr = Math.ceil(Math.log(1 + (target * r) / allocatedSavings) / Math.log(1 + r))
    const ywR = Math.floor(mwr / 12)
    const mwR = mwr % 12
    const timeStrWR = ywR > 0 ? `${ywR}y${mwR > 0 ? " " + mwR + "m" : ""}` : `${mwr}m`
    setResult({ target, timeStr, timeStrWR })
  }

  return (
    <div>
      <div style={{ fontSize: "10px", color: C.textMuted, fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "14px" }}>Goal timeline</div>
      <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
        <input value={goalName} onChange={e => setGoalName(e.target.value)} placeholder="Goal name"
          style={{ flex: 1, padding: "8px 12px", border: `0.5px solid ${C.borderStrong}`, borderRadius: "7px", fontSize: "13px", outline: "none", color: C.text, background: C.surface2 }} />
        <input value={goalAmount} onChange={e => setGoalAmount(e.target.value)} placeholder="Target ₹"
          style={{ flex: 1, padding: "8px 12px", border: `0.5px solid ${C.borderStrong}`, borderRadius: "7px", fontSize: "13px", outline: "none", color: C.text, background: C.surface2 }} />
        <button onClick={calculate}
          style={{ background: C.surface1, border: `0.5px solid ${C.borderStrong}`, borderRadius: "7px", padding: "8px 16px", fontSize: "13px", cursor: "pointer", color: C.text, fontWeight: "500", whiteSpace: "nowrap" }}>
          Calculate
        </button>
      </div>
      <div style={{ background: C.surface1, borderRadius: "8px", padding: "12px 14px", marginBottom: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "8px" }}>
          <span style={{ color: C.textSecondary }}>Allocating {allocation}% of savings to this goal</span>
          <span style={{ color: C.primaryText, fontWeight: "500" }}>₹{allocatedSavings.toLocaleString()}/mo</span>
        </div>
        <input type="range" min="10" max="100" step="5" value={allocation}
          onChange={e => { setAllocation(Number(e.target.value)); setResult(null) }}
          style={{ width: "100%", accentColor: C.primary }} />
        <div style={{ fontSize: "11px", color: C.textMuted, marginTop: "4px" }}>
          ₹{(monthlySavings - allocatedSavings).toLocaleString()}/mo remaining for other goals
        </div>
      </div>
      {monthlySavings <= 0 && (
        <div style={{ background: C.warningLight, border: `0.5px solid ${C.warningBorder}`, borderRadius: "8px", padding: "10px 14px", fontSize: "12px", color: C.warningText }}>
          Complete your profile with Finn to use the goal calculator.
        </div>
      )}
      {result && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <div style={{ background: C.surface2, border: `0.5px solid ${C.border}`, borderRadius: "8px", padding: "14px" }}>
            <div style={{ fontSize: "10px", color: C.textMuted, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.4px" }}>Without returns</div>
            <div style={{ fontSize: "20px", fontWeight: "500", color: C.text }}>{result.timeStr}</div>
            <div style={{ fontSize: "11px", color: C.textMuted, marginTop: "2px" }}>₹{allocatedSavings.toLocaleString()}/mo</div>
          </div>
          <div style={{ background: C.successLight, border: `0.5px solid ${C.successBorder}`, borderRadius: "8px", padding: "14px" }}>
            <div style={{ fontSize: "10px", color: C.successText, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.4px" }}>With 7.1% returns</div>
            <div style={{ fontSize: "20px", fontWeight: "500", color: C.successText }}>{result.timeStrWR}</div>
            <div style={{ fontSize: "11px", color: C.successText, marginTop: "2px" }}>faster with SBI FD</div>
          </div>
          <div style={{ background: C.primaryLight, border: `0.5px solid ${C.primaryBorder}`, borderRadius: "8px", padding: "12px 14px", gridColumn: "span 2" }}>
            <div style={{ fontSize: "12px", color: C.primaryText, lineHeight: "1.6" }}>
              {goalName || "Your goal"} of <strong>₹{result.target.toLocaleString()}</strong> is achievable while saving <strong>₹{(monthlySavings - allocatedSavings).toLocaleString()}/mo</strong> for other goals.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function WhatIfPanel({ sessionId }) {
  const [extraSavings, setExtraSavings] = useState(0)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const runScenario = async () => {
    setLoading(true)
    try {
      const res = await axios.post(`${API}/scenario`, { session_id: sessionId, extra_monthly_savings: extraSavings, extra_investments: 0 })
      setResult(res.data)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const scoreDiff = result ? (result.simulated_score ?? 0) - (result.original_score ?? 0) : 0

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "10px" }}>
          <span style={{ color: C.textSecondary }}>What if I save more per month?</span>
          <span style={{ color: C.primaryText, fontWeight: "500" }}>₹{extraSavings.toLocaleString()}</span>
        </div>
        <input type="range" min="0" max="50000" step="1000" value={extraSavings}
          onChange={e => { setExtraSavings(Number(e.target.value)); setResult(null) }}
          style={{ width: "100%", accentColor: C.primary, marginBottom: "5px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: C.textMuted }}>
          <span>₹0</span><span>₹50,000</span>
        </div>
      </div>
      <button onClick={runScenario} disabled={loading || extraSavings === 0}
        style={{ width: "100%", background: C.surface1, border: `0.5px solid ${extraSavings === 0 ? C.border : C.borderStrong}`, borderRadius: "8px", padding: "10px", fontSize: "13px", cursor: extraSavings === 0 ? "default" : "pointer", fontWeight: "500", color: extraSavings === 0 ? C.textMuted : C.text }}>
        {loading ? "Calculating..." : "Run simulation"}
      </button>
      {result && (
        <div style={{ marginTop: "16px", background: C.surface1, borderRadius: "8px", padding: "16px" }}>
          <div style={{ fontSize: "10px", color: C.textMuted, marginBottom: "14px", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.5px" }}>Projected outcome</div>
          <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "28px", fontWeight: "500", color: C.textSecondary }}>{result.original_score ?? "--"}</div>
              <div style={{ fontSize: "11px", color: C.textMuted, marginTop: "4px" }}>Current</div>
            </div>
            <div style={{ color: C.textMuted, fontSize: "18px" }}>→</div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "28px", fontWeight: "500", color: scoreDiff > 0 ? C.successText : C.textSecondary }}>{result.simulated_score ?? "--"}</div>
              <div style={{ fontSize: "11px", color: C.textMuted, marginTop: "4px" }}>Projected</div>
            </div>
          </div>
          {scoreDiff > 0 && <div style={{ marginTop: "12px", textAlign: "center", fontSize: "13px", color: C.successText, fontWeight: "500" }}>+{scoreDiff} point improvement</div>}
          {scoreDiff === 0 && <div style={{ marginTop: "12px", textAlign: "center", fontSize: "12px", color: C.textMuted }}>Try saving more to see an improvement</div>}
        </div>
      )}
    </div>
  )
}

function NudgePanel({ nudges }) {
  if (!nudges || nudges.length === 0) return null
  const styles = {
    alert: { dot: C.danger, label: "Alert", labelColor: C.dangerText },
    warning: { dot: C.warning, label: "Warning", labelColor: C.warningText },
    opportunity: { dot: C.success, label: "Opportunity", labelColor: C.successText },
    insight: { dot: C.primary, label: "Insight", labelColor: C.primaryText },
  }
  return (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
        <div style={{ fontSize: "10px", fontWeight: "500", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.6px" }}>Proactive alerts</div>
        <div style={{ background: C.danger, color: "#fff", borderRadius: "10px", padding: "1px 6px", fontSize: "10px", fontWeight: "500" }}>{nudges.length}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {nudges.map((nudge, i) => {
          const s = styles[nudge.type] || styles.insight
          return (
            <div key={i} style={{ background: C.surface2, border: `0.5px solid ${C.border}`, borderLeft: `3px solid ${s.dot}`, borderRadius: "10px", padding: "12px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "5px" }}>
                    <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
                    <div style={{ fontSize: "10px", color: s.labelColor, fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.4px" }}>{s.label}</div>
                    <div style={{ fontSize: "10px", color: C.textMuted, textTransform: "capitalize" }}>· {nudge.category}</div>
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: "500", color: C.text, marginBottom: "4px" }}>{nudge.title}</div>
                  <div style={{ fontSize: "12px", color: C.textSecondary, lineHeight: "1.6" }}>{nudge.message}</div>
                </div>
                <button style={{ background: C.surface1, border: `0.5px solid ${C.borderStrong}`, borderRadius: "7px", padding: "5px 12px", fontSize: "11px", cursor: "pointer", fontWeight: "500", color: C.text, whiteSpace: "nowrap", flexShrink: 0 }}>
                  {nudge.cta}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function App() {
  const [started, setStarted] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [twin, setTwin] = useState(null)
  const [loading, setLoading] = useState(false)
  const [quickReplies, setQuickReplies] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [nudges, setNudges] = useState([])
  const [investGuide, setInvestGuide] = useState([])
  const [activeTab, setActiveTab] = useState("overview")
  const bottomRef = useRef(null)

  const profileReady = twin?.name && twin?.monthly_income && twin?.life_stage

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages])

  useEffect(() => {
    if (!profileReady) return
    axios.get(`${API}/recommendations/${SESSION_ID}`).then(res => setRecommendations(res.data.recommendations || [])).catch(() => {})
  }, [twin])

  useEffect(() => {
    if (!profileReady) return
    const fetch = () => axios.get(`${API}/nudges/${SESSION_ID}`).then(res => setNudges(res.data.nudges || [])).catch(() => {})
    fetch()
    const t = setInterval(fetch, 30000)
    return () => clearInterval(t)
  }, [twin])

  useEffect(() => {
    if (!profileReady) return
    axios.get(`${API}/investment-guide/${SESSION_ID}`).then(res => setInvestGuide(res.data.guide || [])).catch(() => {})
  }, [twin])

  const startConversation = async () => {
    setStarted(true)
    setLoading(true)
    try {
      const res = await axios.post(`${API}/chat`, { session_id: SESSION_ID, message: "Hello, I want to build my financial twin" })
      setMessages([{ role: "assistant", content: res.data.message }])
      setTwin(res.data.twin)
      setQuickReplies(res.data.quick_replies || [])
    } catch { setMessages([{ role: "assistant", content: "Hi, I'm Finn. What's your name?" }]) }
    setLoading(false)
  }

  const sendMessage = async (override = null) => {
    const msg = override || input.trim()
    if (!msg || loading) return
    setInput("")
    setQuickReplies([])
    setMessages(prev => [...prev, { role: "user", content: msg }])
    setLoading(true)
    try {
      const res = await axios.post(`${API}/chat`, { session_id: SESSION_ID, message: msg })
      setMessages(prev => [...prev, { role: "assistant", content: res.data.message }])
      setTwin(res.data.twin)
      setQuickReplies(res.data.quick_replies || [])
    } catch { setMessages(prev => [...prev, { role: "assistant", content: "Something went wrong. Please try again." }]) }
    setLoading(false)
  }

  const handleKeyDown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage() } }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "budget", label: "Budget" },
    { id: "goals", label: "Goals" },
    { id: "products", label: "Recommendations" },
    { id: "invest", label: "Where to invest" },
    { id: "simulator", label: "Simulator" },
  ]

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body, #root { height: 100%; width: 100%; }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.borderStrong}; border-radius: 3px; }
        input::placeholder { color: ${C.textMuted}; }
        input[type="range"] { accent-color: ${C.primary}; }
      `}</style>

      <div style={{ display: "flex", height: "100vh", width: "100vw", background: C.surface0, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: C.text, overflow: "hidden" }}>

        {/* LEFT PANEL */}
        <div style={{ width: "380px", minWidth: "380px", background: C.surface2, borderRight: `0.5px solid ${C.border}`, display: "flex", flexDirection: "column", height: "100vh" }}>

          {/* Header */}
          <div style={{ padding: "0 20px", height: "52px", borderBottom: `0.5px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "28px", height: "28px", background: C.primary, borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: "500", fontSize: "13px", color: C.text, lineHeight: 1.2 }}>FinTwin</div>
                <div style={{ fontSize: "10px", color: C.textMuted, lineHeight: 1.2 }}>by SBI</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: C.success }} />
              <span style={{ fontSize: "11px", color: C.textSecondary }}>Live</span>
            </div>
          </div>

          {/* Finn bar */}
          <div style={{ padding: "0 20px", height: "52px", borderBottom: `0.5px solid ${C.border}`, display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
            <div style={{ width: "32px", height: "32px", background: C.primaryLight, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.primaryText} strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: "500", fontSize: "13px", color: C.text, lineHeight: 1.3 }}>Finn</div>
              <div style={{ fontSize: "11px", color: C.textMuted, lineHeight: 1.3 }}>Financial advisor · SBI</div>
            </div>
            <div style={{ background: C.successLight, border: `0.5px solid ${C.successBorder}`, borderRadius: "20px", padding: "2px 8px", fontSize: "10px", color: C.successText, fontWeight: "500" }}>Active</div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px" }}>
            {!started ? (
              <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 16px 40px" }}>
                <div style={{ width: "48px", height: "48px", background: C.primaryLight, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.primaryText} strokeWidth="1.8" strokeLinecap="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <h2 style={{ fontSize: "16px", fontWeight: "500", color: C.text, marginBottom: "8px" }}>Meet Finn</h2>
                <p style={{ color: C.textSecondary, fontSize: "12px", lineHeight: "1.6", marginBottom: "4px" }}>
                  A 5-minute conversation to build a complete picture of your financial life.
                </p>
                <p style={{ color: C.textMuted, fontSize: "11px", marginBottom: "18px" }}>No forms. No branch visit.</p>
                <button onClick={startConversation}
                  style={{ background: C.primary, color: "#fff", border: "none", borderRadius: "8px", padding: "9px 20px", fontSize: "13px", cursor: "pointer", fontWeight: "500" }}>
                  Get started
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {messages.map((msg, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                    {msg.role === "assistant" && (
                      <div style={{ fontSize: "9px", color: C.textMuted, fontWeight: "500", letterSpacing: "0.5px", marginBottom: "3px", paddingLeft: "2px" }}>FINN</div>
                    )}
                    <div style={{
                      background: msg.role === "user" ? C.primary : C.surface1,
                      color: msg.role === "user" ? "#fff" : C.text,
                      padding: "9px 12px",
                      borderRadius: msg.role === "user" ? "12px 12px 3px 12px" : "12px 12px 12px 3px",
                      maxWidth: "86%", fontSize: "13px", lineHeight: "1.55",
                      border: msg.role === "assistant" ? `0.5px solid ${C.border}` : "none"
                    }}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                    <div style={{ fontSize: "9px", color: C.textMuted, fontWeight: "500", letterSpacing: "0.5px", marginBottom: "3px", paddingLeft: "2px" }}>FINN</div>
                    <div style={{ background: C.surface1, border: `0.5px solid ${C.border}`, padding: "10px 14px", borderRadius: "12px 12px 12px 3px", display: "flex", gap: "4px", alignItems: "center" }}>
                      {[0, 1, 2].map(i => (
                        <div key={i} style={{ width: "5px", height: "5px", borderRadius: "50%", background: C.textMuted, animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* Quick Replies */}
          {started && quickReplies.length > 0 && (
            <div style={{ padding: "6px 16px 4px", display: "flex", flexWrap: "wrap", gap: "6px", flexShrink: 0 }}>
              {quickReplies.map((reply, i) => (
                <button key={i} onClick={() => sendMessage(reply)}
                  style={{ background: C.surface2, border: `0.5px solid ${C.primaryBorder}`, color: C.primaryText, borderRadius: "20px", padding: "5px 12px", fontSize: "12px", cursor: "pointer", fontWeight: "500" }}
                  onMouseEnter={e => e.currentTarget.style.background = C.primaryLight}
                  onMouseLeave={e => e.currentTarget.style.background = C.surface2}
                >{reply}</button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: "8px 14px 14px", flexShrink: 0 }}>
            <div style={{ display: "flex", gap: "7px", alignItems: "center", background: C.surface1, border: `0.5px solid ${C.border}`, borderRadius: "10px", padding: "4px 4px 4px 13px" }}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
                disabled={!started || loading}
                placeholder={started ? "Type a message..." : "Start the conversation first"}
                style={{ flex: 1, background: "transparent", border: "none", color: C.text, fontSize: "13px", outline: "none", padding: "6px 0" }} />
              <button onClick={() => sendMessage()} disabled={!started || loading || !input.trim()}
                style={{ background: input.trim() ? C.primary : C.surface2, border: `0.5px solid ${input.trim() ? "transparent" : C.border}`, borderRadius: "7px", width: "30px", height: "30px", cursor: input.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill={input.trim() ? "white" : C.textMuted}><path d="M2 21l21-9L2 3v7l15 2-15 2v7z" /></svg>
              </button>
            </div>
            <div style={{ textAlign: "center", fontSize: "10px", color: C.textMuted, marginTop: "5px" }}>
              Enter to send · Shift+Enter for new line
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ flex: 1, overflowY: "auto", height: "100vh", background: C.surface0 }}>
          {!profileReady ? (
            <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "40px" }}>
              <div style={{ width: "56px", height: "56px", background: C.surface2, border: `0.5px solid ${C.border}`, borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="1.5" strokeLinecap="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
                </svg>
              </div>
              <h2 style={{ fontSize: "18px", fontWeight: "500", marginBottom: "8px", color: C.text }}>Your financial twin</h2>
              <p style={{ color: C.textSecondary, fontSize: "13px", lineHeight: "1.7", maxWidth: "280px", marginBottom: "24px" }}>
                {started
                  ? "Keep chatting with Finn. Your dashboard appears once the basic profile is ready."
                  : "Start a conversation with Finn. Your financial profile will appear here in real time."}
              </p>
              {started && (
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
                  {[
                    { label: "Name", done: !!twin?.name },
                    { label: "Life stage", done: !!twin?.life_stage },
                    { label: "Income", done: !!twin?.monthly_income },
                  ].map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "5px", background: item.done ? C.successLight : C.surface2, border: `0.5px solid ${item.done ? C.successBorder : C.border}`, borderRadius: "20px", padding: "4px 10px" }}>
                      <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: item.done ? C.success : C.textMuted }} />
                      <span style={{ fontSize: "11px", color: item.done ? C.successText : C.textMuted, fontWeight: "500" }}>{item.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: "28px 32px", maxWidth: "1100px" }}>

              {/* Top bar */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                <div>
                  <div style={{ fontSize: "10px", color: C.textMuted, fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "5px" }}>Financial twin</div>
                  <h1 style={{ fontSize: "22px", fontWeight: "500", marginBottom: "3px", color: C.text }}>{twin.name}</h1>
                  <div style={{ fontSize: "13px", color: C.textSecondary, textTransform: "capitalize" }}>
                    {twin.life_stage ? twin.life_stage.replace(/_/g, " ") : ""}
                    {twin.age ? ` · ${twin.age} years old` : ""}
                  </div>
                </div>
                <HealthRing score={twin.health_score} />
              </div>

              {/* Tabs */}
              <div style={{ display: "flex", borderBottom: `0.5px solid ${C.border}`, marginBottom: "24px", overflowX: "auto" }}>
                {tabs.map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    style={{ background: "none", border: "none", padding: "9px 18px", fontSize: "13px", cursor: "pointer", fontWeight: activeTab === tab.id ? "500" : "400", color: activeTab === tab.id ? C.primaryText : C.textSecondary, borderBottom: activeTab === tab.id ? `2px solid ${C.primary}` : "2px solid transparent", marginBottom: "-0.5px", whiteSpace: "nowrap" }}>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Overview */}
              {activeTab === "overview" && (
                <div>
                  <NudgePanel nudges={nudges} />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "16px" }}>
                    <StatCard label="Monthly income" value={twin.monthly_income ? `₹${twin.monthly_income.toLocaleString()}` : "--"} sub="per month" color={C.successText} />
                    <StatCard label="Monthly savings" value={twin.monthly_savings != null ? `₹${twin.monthly_savings.toLocaleString()}` : "--"} sub="per month" color={C.primaryText} />
                    <StatCard label="Net worth" value={twin.net_worth ? `₹${twin.net_worth.toLocaleString()}` : "--"} sub="total assets" />
                    <StatCard label="Emergency fund" value={twin.emergency_fund_months ? `${twin.emergency_fund_months} mo` : "--"} sub="target: 3 months" color={twin.emergency_fund_months >= 3 ? C.successText : C.warningText} />
                  </div>
                  {twin.gaps?.length > 0 && (
                    <div style={{ background: C.surface2, border: `0.5px solid ${C.border}`, borderRadius: "10px", padding: "16px 18px" }}>
                      <div style={{ fontSize: "10px", fontWeight: "500", color: C.textMuted, marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.6px" }}>Action items</div>
                      {twin.gaps.map((gap, i) => <GapItem key={i} gap={gap} />)}
                    </div>
                  )}
                </div>
              )}

              {/* Budget */}
              {activeTab === "budget" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ background: C.surface2, border: `0.5px solid ${C.border}`, borderRadius: "10px", padding: "20px" }}>
                    <BudgetPieChart twin={twin} />
                  </div>
                  <div style={{ background: C.surface2, border: `0.5px solid ${C.border}`, borderRadius: "10px", padding: "20px" }}>
                    <GoalTimeline twin={twin} />
                  </div>
                </div>
              )}

              {/* Goals */}
              {activeTab === "goals" && (
                <div style={{ background: C.surface2, border: `0.5px solid ${C.border}`, borderRadius: "10px", padding: "20px" }}>
                  <div style={{ fontSize: "10px", fontWeight: "500", color: C.textMuted, marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.6px" }}>Goals & progress</div>
                  {twin.goals?.length > 0 ? (
                    <>
                      {twin.savings_account != null && twin.monthly_income && (
                        <ProgressBar label="Emergency buffer" current={twin.savings_account || 0} target={Math.max((twin.fixed_expenses || 0) + (twin.variable_expenses || 0), twin.monthly_income) * 3} color={C.danger} />
                      )}
                      {twin.investments > 0 && (
                        <ProgressBar label="Investment portfolio" current={twin.investments || 0} target={(twin.monthly_income || 50000) * 12} color={C.primary} />
                      )}
                      <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: `0.5px solid ${C.border}` }}>
                        <div style={{ fontSize: "11px", color: C.textMuted, marginBottom: "10px", fontWeight: "500" }}>Stated goals</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
                          {twin.goals.map((goal, i) => (
                            <div key={i} style={{ background: C.primaryLight, color: C.primaryText, border: `0.5px solid ${C.primaryBorder}`, borderRadius: "6px", padding: "5px 10px", fontSize: "12px", fontWeight: "500" }}>
                              {goal}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <p style={{ color: C.textSecondary, fontSize: "13px" }}>Keep chatting with Finn to define your goals.</p>
                  )}
                </div>
              )}

              {/* Products */}
              {activeTab === "products" && (
                <div>
                  <div style={{ fontSize: "12px", color: C.textSecondary, marginBottom: "16px" }}>Personalized SBI product recommendations based on your financial profile.</div>
                  {recommendations.length > 0 ? recommendations.map((p, i) => <ProductCard key={i} product={p} />) : (
                    <div style={{ background: C.surface2, border: `0.5px solid ${C.border}`, borderRadius: "10px", padding: "32px", textAlign: "center" }}>
                      <p style={{ color: C.textSecondary, fontSize: "13px" }}>Complete your profile to receive personalized recommendations.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Where to invest */}
              {activeTab === "invest" && (
                <div>
                  <div style={{ fontSize: "12px", color: C.textSecondary, marginBottom: "8px" }}>
                    Investment options based on your{" "}
                    <span style={{ color: C.primaryText, fontWeight: "500", textTransform: "capitalize" }}>{twin.risk_appetite || "moderate"}</span> risk appetite.
                  </div>
                  <div style={{ display: "flex", gap: "6px", marginBottom: "20px" }}>
                    {["conservative", "moderate", "aggressive"].map(r => (
                      <div key={r} style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "500", textTransform: "capitalize", background: twin.risk_appetite === r ? C.primaryLight : C.surface2, border: `0.5px solid ${twin.risk_appetite === r ? C.primaryBorder : C.border}`, color: twin.risk_appetite === r ? C.primaryText : C.textMuted }}>
                        {r}
                      </div>
                    ))}
                  </div>
                  {investGuide.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {investGuide.map((item, i) => (
                        <div key={i} style={{ background: C.surface2, border: `0.5px solid ${C.border}`, borderRadius: "10px", padding: "16px 18px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                            <div>
                              <div style={{ fontSize: "14px", fontWeight: "500", color: C.text, marginBottom: "3px" }}>{item.option}</div>
                              <div style={{ fontSize: "11px", color: C.textMuted }}>{item.ideal_for}</div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontSize: "15px", fontWeight: "500", color: C.successText }}>{item.returns}</div>
                              <div style={{ fontSize: "10px", color: C.textMuted }}>expected returns</div>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <div style={{ background: C.surface1, border: `0.5px solid ${C.border}`, borderRadius: "6px", padding: "3px 9px", fontSize: "11px", color: C.textSecondary }}>Risk: {item.risk}</div>
                            <div style={{ background: C.surface1, border: `0.5px solid ${C.border}`, borderRadius: "6px", padding: "3px 9px", fontSize: "11px", color: C.textSecondary }}>Horizon: {item.horizon}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ background: C.surface2, border: `0.5px solid ${C.border}`, borderRadius: "10px", padding: "32px", textAlign: "center" }}>
                      <p style={{ color: C.textSecondary, fontSize: "13px" }}>Tell Finn your risk appetite to get personalized investment options.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Simulator */}
              {activeTab === "simulator" && (
                <div style={{ maxWidth: "460px" }}>
                  <div style={{ fontSize: "12px", color: C.textSecondary, marginBottom: "20px" }}>
                    See how saving more each month changes your financial health score over the next 12 months.
                  </div>
                  <div style={{ background: C.surface2, border: `0.5px solid ${C.border}`, borderRadius: "10px", padding: "20px" }}>
                    <WhatIfPanel sessionId={SESSION_ID} />
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </>
  )
}