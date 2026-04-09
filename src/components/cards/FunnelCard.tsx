import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../ui/GlassCard';
import { funnelData as defaultFunnelData } from '../../data/mockData';
import type { DailyMetric } from '../../data/mockData';
import styles from './FunnelCard.module.css';

const FUNNEL_COLORS = [
  { main: '#6366f1', light: '#818cf8', dark: '#4338ca', shine: '#a5b4fc' },
  { main: '#06b6d4', light: '#22d3ee', dark: '#0e7490', shine: '#67e8f9' },
  { main: '#84cc16', light: '#a3e635', dark: '#4d7c0f', shine: '#bef264' },
  { main: '#eab308', light: '#facc15', dark: '#a16207', shine: '#fde047' },
  { main: '#ef4444', light: '#f87171', dark: '#b91c1c', shine: '#fca5a5' },
];

const costLabels = ['CPM', 'Custo/Clique', 'Custo/Page View', 'Custo/Lead', 'Custo/Conversão'];

interface FunnelCardProps {
  dailyMetrics?: DailyMetric[];
  totalSpend?: number;
}

export function FunnelCard({ dailyMetrics, totalSpend }: FunnelCardProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const funnelData = useMemo(() => {
    if (!dailyMetrics || dailyMetrics.length === 0) return defaultFunnelData;

    const totalImpressions = dailyMetrics.reduce((s, m) => s + m.impressions, 0);
    const totalClicks = dailyMetrics.reduce((s, m) => s + m.clicks, 0);
    const totalConversions = dailyMetrics.reduce((s, m) => s + m.conversions, 0);

    // Estimate intermediate funnel steps from real data
    const reach = Math.round(totalImpressions * 0.78);
    const leads = Math.max(Math.round(totalConversions * 4), Math.round(totalClicks * 0.15));

    return [
      { label: 'Impressões', value: totalImpressions, color: '#6366f1' },
      { label: 'Alcance', value: reach, color: '#8b5cf6' },
      { label: 'Cliques', value: totalClicks, color: '#06b6d4' },
      { label: 'Leads', value: leads, color: '#10b981' },
      { label: 'Conversões', value: totalConversions, color: '#f59e0b' },
    ];
  }, [dailyMetrics]);

  const spend = totalSpend ?? 12450;
  const totalSteps = funnelData.length;

  // SVG dimensions
  const svgW = 320;
  const svgH = 360;
  const topY = 10;
  const bottomY = svgH - 24;
  const topWidth = 260;
  const bottomWidth = 28;
  const centerX = svgW / 2;
  const gap = 4;

  // Calculate each segment
  const segH = (bottomY - topY - gap * (totalSteps - 1)) / totalSteps;

  const segments = funnelData.map((step, i) => {
    const y1 = topY + i * (segH + gap);
    const y2 = y1 + segH;
    const progress1 = i / totalSteps;
    const progress2 = (i + 1) / totalSteps;

    // Width at top and bottom of this segment (ease for more natural curve)
    const ease = (t: number) => t * t * 0.6 + t * 0.4;
    const w1 = topWidth - (topWidth - bottomWidth) * ease(progress1);
    const w2 = topWidth - (topWidth - bottomWidth) * ease(progress2);

    const colors = FUNNEL_COLORS[i];

    // Elliptical curve for 3D top edge
    const ry1 = Math.max(w1 * 0.08, 4);
    const ry2 = Math.max(w2 * 0.08, 3);

    return { step, y1, y2, w1, w2, ry1, ry2, colors, i };
  });

  return (
    <GlassCard delay={0.2} padding="14px 16px">
      <div className={styles.header}>
        <h3 className={styles.title}>Funil Geral</h3>
        <select className={styles.typeSelect}>
          <option>Tipo: E-Commerce</option>
          <option>Tipo: Lead Gen</option>
        </select>
      </div>

      <div className={styles.funnelLayout}>
        {/* SVG Funnel */}
        <div className={styles.svgWrap}>
          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            className={styles.svg}
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {segments.map(({ colors, i }) => (
                <linearGradient key={`grad-${i}`} id={`funnelGrad${i}`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={colors.dark} />
                  <stop offset="35%" stopColor={colors.main} />
                  <stop offset="65%" stopColor={colors.light} />
                  <stop offset="100%" stopColor={colors.dark} />
                </linearGradient>
              ))}
              {/* Brighter gradient for hover */}
              {segments.map(({ colors, i }) => (
                <linearGradient key={`gradhover-${i}`} id={`funnelGradHover${i}`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={colors.main} />
                  <stop offset="35%" stopColor={colors.light} />
                  <stop offset="65%" stopColor={colors.shine} />
                  <stop offset="100%" stopColor={colors.main} />
                </linearGradient>
              ))}
              {segments.map(({ colors, i }) => (
                <linearGradient key={`topgrad-${i}`} id={`funnelTop${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors.shine} stopOpacity="0.6" />
                  <stop offset="100%" stopColor={colors.main} stopOpacity="0.3" />
                </linearGradient>
              ))}
              {/* Glow filters per color */}
              {segments.map(({ colors, i }) => (
                <filter key={`glow-${i}`} id={`funnelGlow${i}`}>
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feFlood floodColor={colors.main} floodOpacity="0.4" result="color" />
                  <feComposite in="color" in2="blur" operator="in" result="glow" />
                  <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              ))}
            </defs>

            {segments.map(({ step, y1, y2, w1, w2, ry1, ry2, colors, i }) => {
              const x1L = centerX - w1 / 2;
              const x1R = centerX + w1 / 2;
              const x2L = centerX - w2 / 2;
              const x2R = centerX + w2 / 2;
              const isHovered = hoveredIndex === i;
              const isDimmed = hoveredIndex !== null && hoveredIndex !== i;

              return (
                <motion.g
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: isDimmed ? 0.4 : 1,
                    y: 0,
                    scale: isHovered ? 1.04 : 1,
                  }}
                  transition={{
                    delay: hoveredIndex !== null ? 0 : 0.2 + i * 0.1,
                    duration: hoveredIndex !== null ? 0.2 : 0.5,
                    scale: { type: 'spring', stiffness: 400, damping: 25 },
                  }}
                  style={{ transformOrigin: `${centerX}px ${(y1 + y2) / 2}px`, cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  filter={isHovered ? `url(#funnelGlow${i})` : undefined}
                >
                  {/* Main body - curved sides */}
                  <path
                    d={`
                      M ${x1L} ${y1 + ry1}
                      Q ${x1L} ${y1}, ${centerX - w1 * 0.3} ${y1}
                      Q ${centerX} ${y1 - ry1 * 0.5}, ${centerX + w1 * 0.3} ${y1}
                      Q ${x1R} ${y1}, ${x1R} ${y1 + ry1}
                      L ${x2R} ${y2 - ry2}
                      Q ${x2R} ${y2}, ${centerX + w2 * 0.3} ${y2}
                      Q ${centerX} ${y2 + ry2 * 0.5}, ${centerX - w2 * 0.3} ${y2}
                      Q ${x2L} ${y2}, ${x2L} ${y2 - ry2}
                      Z
                    `}
                    fill={isHovered ? `url(#funnelGradHover${i})` : `url(#funnelGrad${i})`}
                    stroke={isHovered ? colors.light : colors.dark}
                    strokeWidth={isHovered ? 1 : 0.5}
                    opacity={isHovered ? 1 : 0.95}
                  />

                  {/* Top ellipse for 3D effect */}
                  <ellipse
                    cx={centerX}
                    cy={y1}
                    rx={w1 / 2}
                    ry={ry1}
                    fill={`url(#funnelTop${i})`}
                    stroke={colors.light}
                    strokeWidth={isHovered ? 1 : 0.5}
                    opacity={isHovered ? 0.9 : 0.7}
                  />

                  {/* Shine highlight (left side) */}
                  <path
                    d={`
                      M ${x1L + w1 * 0.08} ${y1 + ry1 + 4}
                      Q ${x1L + w1 * 0.15} ${(y1 + y2) / 2}, ${x2L + w2 * 0.12} ${y2 - ry2 - 2}
                      L ${x2L + w2 * 0.02} ${y2 - ry2}
                      Q ${x1L + w1 * 0.02} ${(y1 + y2) / 2}, ${x1L + w1 * 0.01} ${y1 + ry1 + 2}
                      Z
                    `}
                    fill={isHovered ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.12)'}
                  />

                  {/* Text - Label */}
                  <text
                    x={centerX}
                    y={(y1 + y2) / 2 - 6}
                    textAnchor="middle"
                    fill={isHovered ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.7)'}
                    fontSize={isHovered ? 10 : 9}
                    fontWeight="600"
                    fontFamily="Inter"
                    style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}
                  >
                    {step.label}
                  </text>

                  {/* Text - Value */}
                  <text
                    x={centerX}
                    y={(y1 + y2) / 2 + 10}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize={isHovered ? 18 : 16}
                    fontWeight="800"
                    fontFamily="Inter"
                  >
                    {step.value.toLocaleString('pt-BR')}
                  </text>
                </motion.g>
              );
            })}

            {/* Bottom drip */}
            <motion.ellipse
              cx={centerX}
              cy={bottomY + 5}
              rx={12}
              ry={4}
              fill={FUNNEL_COLORS[totalSteps - 1].dark}
              opacity="0.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.8 }}
            />
          </svg>
        </div>

        {/* Side metrics */}
        <div className={styles.sideMetrics}>
          {funnelData.map((step, i) => {
            const rate = i > 0
              ? ((step.value / funnelData[i - 1].value) * 100).toFixed(1)
              : null;
            const costPer = step.value > 0
              ? (spend / step.value).toFixed(2).replace('.', ',')
              : '0,00';
            const isHovered = hoveredIndex === i;
            const isDimmed = hoveredIndex !== null && hoveredIndex !== i;
            return (
              <motion.div
                key={step.label}
                className={styles.metricRow}
                initial={{ opacity: 0, x: 20 }}
                animate={{
                  opacity: isDimmed ? 0.3 : 1,
                  x: 0,
                  scale: isHovered ? 1.08 : 1,
                }}
                transition={{
                  delay: hoveredIndex !== null ? 0 : 0.3 + i * 0.1,
                  duration: 0.2,
                  scale: { type: 'spring', stiffness: 400, damping: 25 },
                }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{ cursor: 'pointer' }}
              >
                {rate && (
                  <span
                    className={styles.rateBadge}
                    style={isHovered ? {
                      background: `rgba(${FUNNEL_COLORS[i].main}, 0.15)`,
                      borderColor: FUNNEL_COLORS[i].light,
                      color: FUNNEL_COLORS[i].light,
                    } : undefined}
                  >
                    {rate}%
                  </span>
                )}
                <div className={styles.costCol}>
                  <span className={styles.costLabel}>{costLabels[i]}</span>
                  <span
                    className={styles.costValue}
                    style={isHovered ? { color: FUNNEL_COLORS[i].light } : undefined}
                  >
                    R$ {costPer}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
}
