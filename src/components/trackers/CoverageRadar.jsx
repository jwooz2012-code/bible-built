import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

const CustomTick = ({ payload, x, y }) => {
  const words = payload.value.split(' ');
  return (
    <text x={x} y={y} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize={11} fontWeight={500}>
      {words.map((word, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : 13}>
          {word}
        </tspan>
      ))}
    </text>
  );
};

export default function CoverageRadar({ sectionData }) {
  const abbreviateLabel = (label) => {
    const abbrev = {
      'General Epistles': 'Gen. Epistles',
      'Pastoral Epistles': 'Pastoral',
      'Major Prophets': 'Major Proph.',
      'Minor Prophets': 'Minor Proph.'
    };
    return abbrev[label] || label;
  };

  const chartData = sectionData.map(s => ({
    section: abbreviateLabel(s.section.split('/')[0]),
    coverage: s.percent
  }));

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="text-base font-semibold text-foreground mb-4">Bible Coverage</h3>
      <div className="h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="75%" margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis 
            dataKey="section" 
            tick={<CustomTick />}
            tickLine={false}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
          />
          <Radar 
            name="Coverage" 
            dataKey="coverage" 
            stroke="hsl(var(--chart-1))" 
            fill="hsl(var(--chart-1))" 
            fillOpacity={0.6} 
          />
        </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}