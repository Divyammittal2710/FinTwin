import { useState, useRef, useEffect } from "react"
import axios from "axios"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"

const SESSION_ID = "user_" + Math.random().toString(36).substr(2, 9)
const API = "http://localhost:8000"

const C = {
  primary: "#2563EB",
  primaryLight: "#EFF6FF",
  success: "#16A34A",
  successLight: "#F0FDF4",
  warning: "#D97706",
  warningLight: "#FFFBEB",
  danger: "#DC2626",
  dangerLight: "#FEF2F2",
  text: "#111827",
  textSecondary: "#6B7280",
  textTertiary: "#9CA3AF",
  border: "#E5E7EB",
  borderLight: "#F3F4F6",
  bg: "#F9FAFB",
  white: "#FFFFFF",
}

function HealthRing({ score }) {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const filled = ((score || 0) / 100) * circumference
  const color = score >= 70 ? C.success : score >= 40 ? C.warning : C.danger
  const label = score >= 70 ? "Good" : score >= 40 ? "Fair" : "Needs Work"
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
      <div style={{ position: "relative", width: "120px", height: "120px", flexShrink: 0 }}>
        <svg width="120" height="120" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="60" cy="60" r={radius} fill="none" stroke={C.borderLight} strokeWidth="8" />
          <circle cx="60" cy="60" r={radius} fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={circumference} strokeDashoffset={circumference - filled}
            strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
        </svg>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
          <div style={{ fontSize: "24px", fontWeight: "700", color, lineHeight: 1 }}>{score ?? "--"}</div>
          <div style={{ fontSize: "10px", color: C.textTertiary, marginTop: "2px", fontWeight: "500" }}>/100</div>
        </div>
      </div>
      <div>
        <div style={{ fontSize: "13px", color: C.textSecondary, marginBottom: "4px" }}>Financial Health</div>
        <div style={{ fontSize: "20px", fontWeight: "700", color }}>{label}</div>
        <div style={{ fontSize: "12px", color: C.textTertiary, marginTop: "4px" }}>Based on your profile</div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }) {
  const isEmpty = value === "--"
  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px" }}>
      <div style={{ fontSize: "11px", color: C.textTertiary, fontWeight: "600", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.6px" }}>{label}</div>
      <div style={{ fontSize: "22px", fontWeight: "700", color: isEmpty ? C.textTertiary : (color || C.text) }}>{value}</div>
    </div>
  )
}

function GapItem({ gap }) {
  const color = gap.severity === "high" ? C.danger : gap.severity === "medium" ? C.warning : C.primary
  const bg = gap.severity === "high" ? C.dangerLight : gap.severity === "medium" ? C.warningLight : C.primaryLight
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "14px 16px", background: bg, borderRadius: "10px", marginBottom: "8px" }}>
      <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: color, marginTop: "6px", flexShrink: 0 }} />
      <div>
        <div style={{ fontSize: "14px", color: C.text, lineHeight: "1.5" }}>{gap.message}</div>
        <div style={{ fontSize: "12px", color, marginTop: "3px", fontWeight: "500", textTransform: "capitalize" }}>{gap.severity} priority</div>
      </div>
    </div>
  )
}

function ProductCard({ product }) {
  const color = product.severity === "high" ? C.danger : product.severity === "medium" ? C.warning : C.primary
  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px", marginBottom: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: color }} />
            <div style={{ fontSize: "11px", color, fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>{product.severity} priority</div>
          </div>
          <div style={{ fontSize: "15px", fontWeight: "600", color: C.text, marginBottom: "6px" }}>{product.name}</div>
          <div style={{ fontSize: "13px", color: C.textSecondary, lineHeight: "1.6" }}>{product.description}</div>
          {product.gap_message && (
            <div style={{ marginTop: "10px", fontSize: "12px", color: C.textSecondary, background: C.bg, padding: "8px 12px", borderRadius: "6px" }}>
              Why this: {product.gap_message}
            </div>
          )}
        </div>
        <button style={{ background: C.primary, color: C.white, border: "none", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", cursor: "pointer", fontWeight: "500", whiteSpace: "nowrap", flexShrink: 0 }}>
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
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "8px" }}>
        <span style={{ color: C.text, fontWeight: "500" }}>{label}</span>
        <span style={{ color: C.textSecondary }}>₹{(current || 0).toLocaleString()} / ₹{(target || 0).toLocaleString()}</span>
      </div>
      <div style={{ background: C.borderLight, borderRadius: "999px", height: "6px" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color || C.primary, borderRadius: "999px", transition: "width 0.8s ease" }} />
      </div>
      <div style={{ fontSize: "11px", color: C.textTertiary, marginTop: "4px" }}>{Math.round(pct)}% complete</div>
    </div>
  )
}

function BudgetPieChart({ twin }) {
  const fixed = twin.fixed_expenses || 0
  const variable = twin.variable_expenses || 0
  const savings = twin.monthly_savings || 0
  const income = twin.monthly_income || 0

  if (!income) return (
    <div style={{ textAlign: "center", padding: "40px", color: C.textSecondary, fontSize: "14px" }}>
      Income data needed to show budget breakdown.
    </div>
  )

  const data = [
    { name: "Fixed Expenses", value: fixed, color: C.danger },
    { name: "Variable Expenses", value: variable, color: C.warning },
    { name: "Savings", value: Math.max(savings, 0), color: C.success },
  ].filter(d => d.value > 0)

  return (
    <div>
      <div style={{ fontSize: "11px", fontWeight: "600", color: C.textTertiary, marginBottom: "20px", textTransform: "uppercase", letterSpacing: "0.6px" }}>
        Monthly Budget Breakdown
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
        <ResponsiveContainer width={180} height={180}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ flex: 1 }}>
          {data.map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "3px", background: item.color }} />
                <span style={{ fontSize: "13px", color: C.text }}>{item.name}</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "14px", fontWeight: "600", color: C.text }}>₹{item.value.toLocaleString()}</div>
                <div style={{ fontSize: "11px", color: C.textTertiary }}>{Math.round((item.value / income) * 100)}%</div>
              </div>
            </div>
          ))}
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: "12px", marginTop: "4px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: C.text }}>Total Income</span>
              <span style={{ fontSize: "14px", fontWeight: "700", color: C.primary }}>₹{income.toLocaleString()}</span>
            </div>
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
    const remainingMonths = months % 12
    const timeStr = years > 0
      ? `${years} yr${years > 1 ? "s" : ""}${remainingMonths > 0 ? ` ${remainingMonths} mo` : ""}`
      : `${months} month${months > 1 ? "s" : ""}`

    const monthlyRate = 0.071 / 12
    const monthsWithReturns = Math.ceil(
      Math.log(1 + (target * monthlyRate) / allocatedSavings) / Math.log(1 + monthlyRate)
    )
    const yearsWR = Math.floor(monthsWithReturns / 12)
    const monthsWR = monthsWithReturns % 12
    const timeStrWR = yearsWR > 0
      ? `${yearsWR} yr${yearsWR > 1 ? "s" : ""}${monthsWR > 0 ? ` ${monthsWR} mo` : ""}`
      : `${monthsWithReturns} month${monthsWithReturns > 1 ? "s" : ""}`

    setResult({ target, months, timeStr, monthsWithReturns, timeStrWR })
  }

  return (
    <div>
      <div style={{ fontSize: "11px", fontWeight: "600", color: C.textTertiary, marginBottom: "20px", textTransform: "uppercase", letterSpacing: "0.6px" }}>
        Goal Timeline Calculator
      </div>
      <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
        <input value={goalName} onChange={e => setGoalName(e.target.value)}
          placeholder="Goal (e.g. Car, Europe trip)"
          style={{ flex: 1, padding: "10px 14px", border: `1px solid ${C.border}`, borderRadius: "8px", fontSize: "14px", outline: "none", color: C.text, background: C.white }} />
        <input value={goalAmount} onChange={e => setGoalAmount(e.target.value)}
          placeholder="Target amount (₹)"
          style={{ flex: 1, padding: "10px 14px", border: `1px solid ${C.border}`, borderRadius: "8px", fontSize: "14px", outline: "none", color: C.text, background: C.white }} />
        <button onClick={calculate}
          style={{ background: C.primary, color: C.white, border: "none", borderRadius: "8px", padding: "10px 20px", fontSize: "14px", cursor: "pointer", fontWeight: "500", whiteSpace: "nowrap" }}>
          Calculate
        </button>
      </div>

      {/* Allocation slider */}
      <div style={{ background: C.bg, borderRadius: "10px", padding: "16px", marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "10px" }}>
          <span style={{ color: C.text, fontWeight: "500" }}>
            Allocating {allocation}% of savings to this goal
          </span>
          <span style={{ color: C.primary, fontWeight: "600" }}>
            ₹{allocatedSavings.toLocaleString()}/month
          </span>
        </div>
        <input type="range" min="10" max="100" step="5" value={allocation}
          onChange={e => { setAllocation(Number(e.target.value)); setResult(null) }}
          style={{ width: "100%", accentColor: C.primary }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: C.textTertiary, marginTop: "4px" }}>
          <span>10% (₹{Math.floor(monthlySavings * 0.1).toLocaleString()})</span>
          <span>100% (₹{monthlySavings.toLocaleString()})</span>
        </div>
        <div style={{ fontSize: "12px", color: C.textSecondary, marginTop: "8px" }}>
          Remaining ₹{(monthlySavings - allocatedSavings).toLocaleString()}/month goes to other goals & investments
        </div>
      </div>

      {monthlySavings <= 0 && (
        <div style={{ background: C.warningLight, border: `1px solid ${C.warning}`, borderRadius: "8px", padding: "12px 16px", fontSize: "13px", color: C.warning }}>
          Complete your financial profile with Finn to use the goal calculator.
        </div>
      )}

      {result && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px" }}>
            <div style={{ fontSize: "11px", color: C.textTertiary, fontWeight: "600", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Without Returns</div>
            <div style={{ fontSize: "22px", fontWeight: "700", color: C.text, marginBottom: "4px" }}>{result.timeStr}</div>
            <div style={{ fontSize: "13px", color: C.textSecondary }}>₹{allocatedSavings.toLocaleString()}/month allocated</div>
          </div>
          <div style={{ background: C.successLight, border: `1px solid ${C.success}`, borderRadius: "12px", padding: "20px" }}>
            <div style={{ fontSize: "11px", color: C.success, fontWeight: "600", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>With 7.1% FD Returns</div>
            <div style={{ fontSize: "22px", fontWeight: "700", color: C.success, marginBottom: "4px" }}>{result.timeStrWR}</div>
            <div style={{ fontSize: "13px", color: C.success }}>faster with smart savings</div>
          </div>
          <div style={{ background: C.primaryLight, border: `1px solid ${C.primary}`, borderRadius: "12px", padding: "16px", gridColumn: "span 2" }}>
            <div style={{ fontSize: "13px", color: C.primary, lineHeight: "1.6" }}>
              {goalName || "Your goal"} of <strong>₹{result.target.toLocaleString()}</strong> is achievable
              while still saving <strong>₹{(monthlySavings - allocatedSavings).toLocaleString()}/month</strong> for other goals.
              Use SBI Savings Plus for 7.1% guaranteed returns.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function WhatIfPanel({ sessionId, currentScore }) {
  const [extraSavings, setExtraSavings] = useState(0)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const runScenario = async () => {
    setLoading(true)
    try {
      const res = await axios.post(`${API}/scenario`, {
        session_id: sessionId,
        extra_monthly_savings: extraSavings,
        extra_investments: 0
      })
      setResult(res.data)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const scoreDiff = result ? (result.simulated_score ?? 0) - (result.original_score ?? 0) : 0

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <div style={{ fontSize: "13px", color: C.textSecondary, marginBottom: "12px", fontWeight: "500" }}>
          What if I save ₹{extraSavings.toLocaleString()} more per month?
        </div>
        <input type="range" min="0" max="50000" step="1000" value={extraSavings}
          onChange={e => { setExtraSavings(Number(e.target.value)); setResult(null) }}
          style={{ width: "100%", accentColor: C.primary, marginBottom: "6px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: C.textTertiary }}>
          <span>₹0</span><span>₹50,000</span>
        </div>
      </div>
      <button onClick={runScenario} disabled={loading || extraSavings === 0}
        style={{ width: "100%", background: extraSavings === 0 ? C.borderLight : C.primary, color: extraSavings === 0 ? C.textTertiary : C.white, border: "none", borderRadius: "8px", padding: "12px", fontSize: "14px", cursor: extraSavings === 0 ? "default" : "pointer", fontWeight: "500" }}>
        {loading ? "Calculating..." : "Run Simulation"}
      </button>
      {result && (
        <div style={{ marginTop: "20px", background: C.bg, borderRadius: "10px", padding: "20px" }}>
          <div style={{ fontSize: "11px", color: C.textTertiary, marginBottom: "16px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Projected Outcome</div>
          <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "32px", fontWeight: "700", color: C.textSecondary }}>{result.original_score ?? "--"}</div>
              <div style={{ fontSize: "12px", color: C.textTertiary, marginTop: "4px" }}>Current</div>
            </div>
            <div style={{ fontSize: "20px", color: C.border }}>→</div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "32px", fontWeight: "700", color: scoreDiff > 0 ? C.success : scoreDiff < 0 ? C.danger : C.textSecondary }}>{result.simulated_score ?? "--"}</div>
              <div style={{ fontSize: "12px", color: C.textTertiary, marginTop: "4px" }}>Projected</div>
            </div>
          </div>
          {scoreDiff > 0 && (
            <div style={{ marginTop: "16px", textAlign: "center", fontSize: "14px", color: C.success, fontWeight: "500" }}>
              +{scoreDiff} point improvement
            </div>
          )}
          {scoreDiff === 0 && (
            <div style={{ marginTop: "16px", textAlign: "center", fontSize: "14px", color: C.textSecondary }}>
              Try saving more to see an improvement
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function NudgePanel({ nudges }) {
  if (!nudges || nudges.length === 0) return null
  const typeStyles = {
    alert: { border: C.danger, dot: C.danger, badge: "Alert" },
    warning: { border: C.warning, dot: C.warning, badge: "Warning" },
    opportunity: { border: C.success, dot: C.success, badge: "Opportunity" },
    insight: { border: C.primary, dot: C.primary, badge: "Insight" },
  }
  return (
    <div style={{ marginBottom: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
        <div style={{ fontSize: "11px", fontWeight: "600", color: C.textTertiary, textTransform: "uppercase", letterSpacing: "0.6px" }}>Proactive Alerts</div>
        <div style={{ background: C.danger, color: C.white, borderRadius: "10px", padding: "2px 7px", fontSize: "11px", fontWeight: "600" }}>{nudges.length}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {nudges.map((nudge, i) => {
          const style = typeStyles[nudge.type] || typeStyles.insight
          return (
            <div key={i} style={{ background: C.white, border: `1px solid ${C.border}`, borderLeft: `3px solid ${style.border}`, borderRadius: "10px", padding: "16px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: style.dot, flexShrink: 0 }} />
                    <div style={{ fontSize: "11px", color: style.dot, fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.4px" }}>{style.badge}</div>
                    <div style={{ fontSize: "11px", color: C.textTertiary, textTransform: "capitalize" }}>{nudge.category}</div>
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: C.text, marginBottom: "6px" }}>{nudge.title}</div>
                  <div style={{ fontSize: "13px", color: C.textSecondary, lineHeight: "1.6" }}>{nudge.message}</div>
                </div>
                <button style={{ background: C.primary, color: C.white, border: "none", borderRadius: "7px", padding: "7px 14px", fontSize: "12px", cursor: "pointer", fontWeight: "500", whiteSpace: "nowrap", flexShrink: 0 }}>
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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (!profileReady) return
    axios.get(`${API}/recommendations/${SESSION_ID}`)
      .then(res => setRecommendations(res.data.recommendations || []))
      .catch(() => { })
  }, [twin])

  useEffect(() => {
    if (!profileReady) return
    const fetchNudges = () => {
      axios.get(`${API}/nudges/${SESSION_ID}`)
        .then(res => setNudges(res.data.nudges || []))
        .catch(() => { })
    }
    fetchNudges()
    const interval = setInterval(fetchNudges, 30000)
    return () => clearInterval(interval)
  }, [twin])

  useEffect(() => {
    if (!profileReady) return
    axios.get(`${API}/investment-guide/${SESSION_ID}`)
      .then(res => setInvestGuide(res.data.guide || []))
      .catch(() => { })
  }, [twin])

  const startConversation = async () => {
    setStarted(true)
    setLoading(true)
    try {
      const res = await axios.post(`${API}/chat`, { session_id: SESSION_ID, message: "Hello, I want to build my financial twin" })
      setMessages([{ role: "assistant", content: res.data.message }])
      setTwin(res.data.twin)
      setQuickReplies(res.data.quick_replies || [])
    } catch {
      setMessages([{ role: "assistant", content: "Hi, I'm Finn. What's your name?" }])
    }
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
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Something went wrong. Please try again." }])
    }
    setLoading(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "budget", label: "Budget" },
    { id: "goals", label: "Goals" },
    { id: "products", label: "Recommendations" },
    { id: "invest", label: "Where to Invest" },
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
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 4px; }
      `}</style>

      <div style={{ display: "flex", height: "100vh", width: "100vw", background: C.bg, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: C.text, overflow: "hidden" }}>

        {/* LEFT PANEL */}
        <div style={{ width: "420px", minWidth: "420px", background: C.white, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", height: "100vh" }}>

          {/* Header */}
          <div style={{ padding: "0 24px", height: "60px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "32px", height: "32px", background: C.primary, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: "700", fontSize: "14px", color: C.text, lineHeight: 1.2 }}>FinTwin</div>
                <div style={{ fontSize: "11px", color: C.textTertiary, lineHeight: 1.2 }}>by SBI</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: C.success }} />
              <span style={{ fontSize: "12px", color: C.textSecondary, fontWeight: "500" }}>Live</span>
            </div>
          </div>

          {/* Finn bar */}
          <div style={{ padding: "0 24px", height: "56px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
            <div style={{ width: "36px", height: "36px", background: C.primaryLight, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: "600", fontSize: "14px", color: C.text, lineHeight: 1.3 }}>Finn</div>
              <div style={{ fontSize: "12px", color: C.textSecondary, lineHeight: 1.3 }}>Financial Onboarding Advisor</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 8px" }}>
            {!started ? (
              <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 16px 40px" }}>
                <div style={{ width: "56px", height: "56px", background: C.primaryLight, borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="1.8" strokeLinecap="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <h2 style={{ fontSize: "18px", fontWeight: "700", color: C.text, marginBottom: "8px" }}>Meet Finn</h2>
                <p style={{ color: C.textSecondary, fontSize: "13px", lineHeight: "1.6", marginBottom: "6px" }}>
                  A short conversation to build a complete picture of your financial life.
                </p>
                <p style={{ color: C.textTertiary, fontSize: "12px", marginBottom: "20px" }}>5 minutes. No forms.</p>
                <button onClick={startConversation}
                  style={{ background: C.primary, color: C.white, border: "none", borderRadius: "8px", padding: "10px 22px", fontSize: "14px", cursor: "pointer", fontWeight: "500" }}>
                  Get Started
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {messages.map((msg, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                    {msg.role === "assistant" && (
                      <div style={{ fontSize: "10px", color: C.textTertiary, fontWeight: "600", letterSpacing: "0.5px", marginBottom: "4px", paddingLeft: "2px" }}>FINN</div>
                    )}
                    <div style={{
                      background: msg.role === "user" ? C.primary : C.bg,
                      color: msg.role === "user" ? C.white : C.text,
                      padding: "10px 14px",
                      borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      maxWidth: "84%", fontSize: "14px", lineHeight: "1.55",
                      border: msg.role === "assistant" ? `1px solid ${C.border}` : "none"
                    }}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                    <div style={{ fontSize: "10px", color: C.textTertiary, fontWeight: "600", letterSpacing: "0.5px", marginBottom: "4px", paddingLeft: "2px" }}>FINN</div>
                    <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: "12px 16px", borderRadius: "16px 16px 16px 4px", display: "flex", gap: "4px", alignItems: "center" }}>
                      {[0, 1, 2].map(i => (
                        <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: C.textTertiary, animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
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
            <div style={{ padding: "8px 20px 4px", display: "flex", flexWrap: "wrap", gap: "8px", flexShrink: 0 }}>
              {quickReplies.map((reply, i) => (
                <button key={i} onClick={() => sendMessage(reply)}
                  style={{ background: C.white, border: `1px solid ${C.primary}`, color: C.primary, borderRadius: "20px", padding: "6px 14px", fontSize: "13px", cursor: "pointer", fontWeight: "500" }}
                  onMouseEnter={e => e.currentTarget.style.background = C.primaryLight}
                  onMouseLeave={e => e.currentTarget.style.background = C.white}
                >{reply}</button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: "10px 16px 16px", flexShrink: 0 }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", background: C.bg, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "5px 5px 5px 14px" }}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
                disabled={!started || loading}
                placeholder={started ? "Type a message..." : "Start the conversation first"}
                style={{ flex: 1, background: "transparent", border: "none", color: C.text, fontSize: "14px", outline: "none", padding: "6px 0" }} />
              <button onClick={() => sendMessage()} disabled={!started || loading || !input.trim()}
                style={{ background: input.trim() ? C.primary : C.borderLight, border: "none", borderRadius: "7px", width: "32px", height: "32px", cursor: input.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill={input.trim() ? "white" : C.textTertiary}><path d="M2 21l21-9L2 3v7l15 2-15 2v7z" /></svg>
              </button>
            </div>
            <div style={{ textAlign: "center", fontSize: "11px", color: C.textTertiary, marginTop: "6px" }}>
              Enter to send · Shift+Enter for new line
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ flex: 1, overflowY: "auto", height: "100vh" }}>
          {!profileReady ? (
            <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "40px" }}>
              <div style={{ width: "64px", height: "64px", background: C.white, border: `1px solid ${C.border}`, borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.textTertiary} strokeWidth="1.5" strokeLinecap="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
                </svg>
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "8px", color: C.text }}>Your Financial Twin</h2>
              <p style={{ color: C.textSecondary, fontSize: "14px", lineHeight: "1.7", maxWidth: "300px" }}>
                {started
                  ? "Keep chatting with Finn. Your dashboard will appear once your basic profile is ready."
                  : "Start a conversation with Finn. Your financial profile will appear here in real time."}
              </p>
              {started && (
                <div style={{ marginTop: "24px", display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center", maxWidth: "360px" }}>
                  {[
                    { label: "Name", done: !!twin?.name },
                    { label: "Life Stage", done: !!twin?.life_stage },
                    { label: "Income", done: !!twin?.monthly_income },
                  ].map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", background: item.done ? C.successLight : C.borderLight, border: `1px solid ${item.done ? C.success : C.border}`, borderRadius: "20px", padding: "5px 12px" }}>
                      <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: item.done ? C.success : C.textTertiary }} />
                      <span style={{ fontSize: "12px", color: item.done ? C.success : C.textTertiary, fontWeight: "500" }}>{item.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: "36px 40px", maxWidth: "1100px" }}>

              {/* Top bar */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
                <div>
                  <div style={{ fontSize: "11px", color: C.textTertiary, fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "6px" }}>Financial Twin</div>
                  <h1 style={{ fontSize: "26px", fontWeight: "700", marginBottom: "4px", color: C.text }}>{twin.name}</h1>
                  <div style={{ fontSize: "14px", color: C.textSecondary, textTransform: "capitalize" }}>
                    {twin.life_stage ? twin.life_stage.replace(/_/g, " ") : ""}
                    {twin.age ? ` · ${twin.age} Years Old` : ""}
                  </div>
                </div>
                <HealthRing score={twin.health_score} />
              </div>

              {/* Tabs */}
              <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, marginBottom: "28px", overflowX: "auto" }}>
                {tabs.map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    style={{ background: "none", border: "none", padding: "10px 20px", fontSize: "14px", cursor: "pointer", fontWeight: activeTab === tab.id ? "600" : "400", color: activeTab === tab.id ? C.primary : C.textSecondary, borderBottom: activeTab === tab.id ? `2px solid ${C.primary}` : "2px solid transparent", marginBottom: "-1px", whiteSpace: "nowrap" }}>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Overview */}
              {activeTab === "overview" && (
                <div>
                  <NudgePanel nudges={nudges} />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
                    <StatCard label="Monthly Income" value={twin.monthly_income ? `₹${twin.monthly_income.toLocaleString()}` : "--"} color={C.success} />
                    <StatCard label="Monthly Savings" value={twin.monthly_savings != null ? `₹${twin.monthly_savings.toLocaleString()}` : "--"} color={C.primary} />
                    <StatCard label="Net Worth" value={twin.net_worth ? `₹${twin.net_worth.toLocaleString()}` : "--"} color={C.text} />
                    <StatCard label="Emergency Fund" value={twin.emergency_fund_months ? `${twin.emergency_fund_months} mo` : "--"} color={twin.emergency_fund_months >= 3 ? C.success : C.warning} />
                  </div>
                  {twin.gaps?.length > 0 && (
                    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "24px" }}>
                      <div style={{ fontSize: "11px", fontWeight: "600", color: C.textTertiary, marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.6px" }}>Action Items</div>
                      {twin.gaps.map((gap, i) => <GapItem key={i} gap={gap} />)}
                    </div>
                  )}
                </div>
              )}

              {/* Budget */}
              {activeTab === "budget" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "24px" }}>
                    <BudgetPieChart twin={twin} />
                  </div>
                  <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "24px" }}>
                    <GoalTimeline twin={twin} />
                  </div>
                </div>
              )}

              {/* Goals */}
              {activeTab === "goals" && (
                <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "24px" }}>
                  <div style={{ fontSize: "11px", fontWeight: "600", color: C.textTertiary, marginBottom: "20px", textTransform: "uppercase", letterSpacing: "0.6px" }}>Goals & Progress</div>
                  {twin.goals?.length > 0 ? (
                    <>
                      {twin.savings_account != null && twin.monthly_income && (
                        <ProgressBar label="Emergency Buffer"
                          current={twin.savings_account || 0}
                          target={Math.max((twin.fixed_expenses || 0) + (twin.variable_expenses || 0), twin.monthly_income) * 3}
                          color={C.danger} />
                      )}
                      {twin.investments > 0 && (
                        <ProgressBar label="Investment Portfolio"
                          current={twin.investments || 0}
                          target={(twin.monthly_income || 50000) * 12}
                          color={C.primary} />
                      )}
                      <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: `1px solid ${C.border}` }}>
                        <div style={{ fontSize: "12px", color: C.textSecondary, marginBottom: "12px", fontWeight: "500" }}>Stated Goals</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                          {twin.goals.map((goal, i) => (
                            <div key={i} style={{ background: C.primaryLight, color: C.primary, borderRadius: "6px", padding: "6px 12px", fontSize: "13px", fontWeight: "500" }}>
                              {goal}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <p style={{ color: C.textSecondary, fontSize: "14px" }}>Keep chatting with Finn to define your goals.</p>
                  )}
                </div>
              )}

              {/* Products */}
              {activeTab === "products" && (
                <div>
                  <div style={{ fontSize: "13px", color: C.textSecondary, marginBottom: "20px" }}>
                    Personalized SBI product recommendations based on your financial profile.
                  </div>
                  {recommendations.length > 0 ? recommendations.map((p, i) => <ProductCard key={i} product={p} />) : (
                    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "32px", textAlign: "center" }}>
                      <p style={{ color: C.textSecondary, fontSize: "14px" }}>Complete your profile to receive personalized recommendations.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Where to Invest */}
              {activeTab === "invest" && (
                <div>
                  <div style={{ fontSize: "13px", color: C.textSecondary, marginBottom: "8px" }}>
                    Personalized investment options based on your{" "}
                    <span style={{ color: C.primary, fontWeight: "600", textTransform: "capitalize" }}>
                      {twin.risk_appetite || "moderate"}
                    </span>{" "}
                    risk appetite.
                  </div>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
                    {["conservative", "moderate", "aggressive"].map(r => (
                      <div key={r} style={{
                        padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "500", textTransform: "capitalize",
                        background: twin.risk_appetite === r ? C.primary : C.borderLight,
                        color: twin.risk_appetite === r ? C.white : C.textTertiary
                      }}>{r}</div>
                    ))}
                  </div>
                  {investGuide.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {investGuide.map((item, i) => (
                        <div key={i} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                            <div>
                              <div style={{ fontSize: "15px", fontWeight: "600", color: C.text, marginBottom: "4px" }}>{item.option}</div>
                              <div style={{ fontSize: "12px", color: C.textTertiary }}>{item.ideal_for}</div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontSize: "16px", fontWeight: "700", color: C.success }}>{item.returns}</div>
                              <div style={{ fontSize: "11px", color: C.textTertiary }}>expected returns</div>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <div style={{ background: C.borderLight, borderRadius: "6px", padding: "4px 10px", fontSize: "12px", color: C.textSecondary }}>
                              Risk: {item.risk}
                            </div>
                            <div style={{ background: C.borderLight, borderRadius: "6px", padding: "4px 10px", fontSize: "12px", color: C.textSecondary }}>
                              Horizon: {item.horizon}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "32px", textAlign: "center" }}>
                      <p style={{ color: C.textSecondary, fontSize: "14px" }}>Tell Finn your risk appetite to get personalized investment options.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Simulator */}
              {activeTab === "simulator" && (
                <div style={{ maxWidth: "480px" }}>
                  <div style={{ fontSize: "13px", color: C.textSecondary, marginBottom: "24px" }}>
                    Adjust the slider to see how saving more each month impacts your financial health score.
                  </div>
                  <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "24px" }}>
                    <WhatIfPanel sessionId={SESSION_ID} currentScore={twin.health_score} />
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