import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, BarChart, Bar, Cell, AreaChart, Area, Legend,
} from 'recharts'

const AXIS = { fontSize: 12, fill: '#5a5a62' }
const tooltipStyle = {
  background: '#fff', border: '1px solid #e4e4e8', borderRadius: 6,
  fontSize: 13, fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 14px rgba(23,23,26,0.08)',
}

export function ScoreTrend({ data }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
        <CartesianGrid stroke="#eeeef1" vertical={false} />
        <XAxis dataKey="week" tick={AXIS} tickLine={false} axisLine={{ stroke: '#e4e4e8' }} />
        <YAxis domain={[0, 100]} tick={AXIS} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, 'Score']} />
        <Line type="monotone" dataKey="pct" stroke="#c41e24" strokeWidth={2.5} dot={{ r: 3.5, fill: '#c41e24' }} name="Score percent" />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function MasteryBars({ data }) {
  return (
    <ResponsiveContainer width="100%" height={230}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, bottom: 0, left: 8 }}>
        <CartesianGrid stroke="#eeeef1" horizontal={false} />
        <XAxis type="number" domain={[0, 100]} tick={AXIS} tickLine={false} axisLine={{ stroke: '#e4e4e8' }} />
        <YAxis type="category" dataKey="name" width={110} tick={{ ...AXIS, fontSize: 11.5 }} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, 'Mastery']} />
        <Bar dataKey="mastery" barSize={14} radius={[0, 3, 3, 0]} name="Mastery">
          {data.map((d, i) => (
            <Cell key={i} fill={d.mastery == null ? '#cfcfd6' : d.mastery >= 70 ? '#12b76a' : d.mastery >= 40 ? '#f79009' : '#c41e24'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function EngagementArea({ weeks, views, color = '#b08733' }) {
  const data = weeks.map((w, i) => ({ week: w, views: views[i] }))
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
        <CartesianGrid stroke="#eeeef1" vertical={false} />
        <XAxis dataKey="week" tick={AXIS} tickLine={false} axisLine={{ stroke: '#e4e4e8' }} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => [v, 'Resource views']} />
        <Area type="monotone" dataKey="views" stroke={color} fill={color} fillOpacity={0.12} strokeWidth={2} name="Resource views" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function TrendLine({ data, color = '#c41e24', name = 'Average score percent' }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
        <CartesianGrid stroke="#eeeef1" vertical={false} />
        <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={{ stroke: '#e4e4e8' }} />
        <YAxis domain={[0, 100]} tick={AXIS} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} dot={{ r: 3.5, fill: color }} name={name} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function RiskDistribution({ data }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -22 }}>
        <CartesianGrid stroke="#eeeef1" vertical={false} />
        <XAxis dataKey="band" tick={AXIS} tickLine={false} axisLine={{ stroke: '#e4e4e8' }} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="students" barSize={36} radius={[3, 3, 0, 0]} name="Students">
          {data.map((d, i) => <Cell key={i} fill={d.color} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export { Legend }
