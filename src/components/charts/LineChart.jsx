import { LineChart as RLineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

// if you pass `series` (array of { dataKey, color, name }) it draws multiple lines,
// otherwise it just draws one line using `dataKey`
const LineChart = ({ data, dataKey, title, color = '#4f46e5', series }) => {
  const isMulti = series && series.length > 0;

  return (
    <div style={{
      background: '#ffffff',
      padding: '24px',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
    }}>
      {title && <h3 style={{ margin: '0 0 20px 0', color: '#0f172a', fontSize: '18px' }}>{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <RLineChart data={data}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="0" vertical={false} />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          {isMulti && <Legend />}
          {isMulti ? (
            series.map(s => (
              <Line
                key={s.dataKey}
                type="monotone"
                dataKey={s.dataKey}
                name={s.name || s.dataKey}
                stroke={s.color}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            ))
          ) : (
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          )}
        </RLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart;
