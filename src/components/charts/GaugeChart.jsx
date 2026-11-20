import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';

// a simple half-circle gauge that shows a value against a max
const GaugeChart = ({ value, max = 100, label, color = '#4f46e5' }) => {
  const data = [{ value: value || 0 }];

  return (
    <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', textAlign: 'center', flex: 1 }}>
      {label && <h4 style={{ margin: '0 0 10px 0', color: '#64748b', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</h4>}
      <ResponsiveContainer width="100%" height={150}>
        <RadialBarChart innerRadius="75%" outerRadius="100%" data={data} startAngle={180} endAngle={0}>
          <PolarAngleAxis type="number" domain={[0, max]} angleAxisId={0} tick={false} />
          <RadialBar dataKey="value" fill={color} background cornerRadius={12} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a', marginTop: '-30px' }}>{value ?? '--'}</div>
    </div>
  );
};

export default GaugeChart;
