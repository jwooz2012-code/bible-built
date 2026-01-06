import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

const CustomTick = ({ payload, x, y }) => {
  const words = payload.value.split(' ');
  return (
    <text x={x} y={y} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize={10}>
      {words.map((word, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : 12}>
          {word}
        </tspan>
      ))}
    </text>
  );
};

export default function CoverageRadar({ sectionData }) {
  const chartData = sectionData.map(s => ({
    section: s.section.split('/')[0], // Shorten labels
    coverage: s.percent
  }));

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="text-base font-semibold text-foreground mb-4">Bible Coverage</h3>
      <ResponsiveContainer width="100%" height={380}>
        <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="65%">
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
  );
}