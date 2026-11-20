import { useState, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import LineChart from '../components/charts/LineChart';
import { getDevices } from '../api/devices.api';
import { getSensorHistory, exportSensorData } from '../api/sensors.api';

const History = () => {
  const [devices, setDevices] = useState([]);
  const [deviceId, setDeviceId] = useState('');
  const [sensorType, setSensorType] = useState('temperature');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await getDevices();
        if (res.data.success) {
          setDevices(res.data.devices);
          if (res.data.devices.length > 0) {
            setDeviceId(res.data.devices[0]._id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchDevices();
  }, []);

  // the actual search - takes from/to so the quick buttons can call it directly
  const runSearch = async (fromVal, toVal) => {
    if (!deviceId) return;
    setLoading(true);
    try {
      const params = { type: sensorType, limit: 500 };
      if (fromVal) params.from = fromVal;
      if (toVal) params.to = toVal;
      const res = await getSensorHistory(deviceId, params);
      if (res.data.success) {
        setReadings(res.data.readings);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    runSearch(from, to);
  };

  // quick buttons that set the range to the last 1h / 24h / 7d
  const quickRange = (window) => {
    const now = Date.now();
    let ms = 24 * 60 * 60 * 1000;
    if (window === '1h') ms = 60 * 60 * 1000;
    if (window === '7d') ms = 7 * 24 * 60 * 60 * 1000;

    const fromIso = new Date(now - ms).toISOString();
    setFrom(fromIso);
    setTo('');
    runSearch(fromIso, '');
  };

  const handleExport = async () => {
    if (!deviceId) return;
    try {
      const params = { deviceId, type: sensorType };
      if (from) params.from = from;
      if (to) params.to = to;
      const res = await exportSensorData(params);

      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sensor-export-${deviceId}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Export failed');
    }
  };

  const chartData = readings.slice().reverse().map(r => ({
    time: new Date(r.timestamp).toLocaleString(),
    value: r.value
  }));

  return (
    <PageWrapper title="History">
      <form onSubmit={handleSearch} style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px' }}>Device</label>
            <select value={deviceId} onChange={(e) => setDeviceId(e.target.value)} style={{ padding: '6px' }}>
              {devices.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px' }}>Sensor</label>
            <select value={sensorType} onChange={(e) => setSensorType(e.target.value)} style={{ padding: '6px' }}>
              <option value="temperature">temperature</option>
              <option value="humidity">humidity</option>
              <option value="motion">motion</option>
              <option value="pressure">pressure</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px' }}>From</label>
            <input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} style={{ padding: '6px' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px' }}>To</label>
            <input type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)} style={{ padding: '6px' }} />
          </div>

          <button type="submit" style={{ padding: '8px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Search
          </button>

          <button type="button" onClick={handleExport} style={{ padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Export CSV
          </button>
        </div>

        {/* quick time range buttons */}
        <div style={{ marginTop: '12px' }}>
          <span style={{ marginRight: '8px', fontSize: '13px', color: '#666' }}>Quick range:</span>
          <button type="button" onClick={() => quickRange('1h')} style={{ marginRight: '6px', padding: '4px 10px', cursor: 'pointer' }}>Last 1h</button>
          <button type="button" onClick={() => quickRange('24h')} style={{ marginRight: '6px', padding: '4px 10px', cursor: 'pointer' }}>Last 24h</button>
          <button type="button" onClick={() => quickRange('7d')} style={{ padding: '4px 10px', cursor: 'pointer' }}>Last 7d</button>
        </div>
      </form>

      {loading && <p>Loading...</p>}

      {chartData.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <LineChart data={chartData} dataKey="value" title={`${sensorType} chart`} color="#4f46e5" />
        </div>
      )}

      {readings.length > 0 && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginTop: 0 }}>Data ({readings.length} readings)</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                <th style={{ padding: '10px', textAlign: 'left' }}>Timestamp</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Type</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Value</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Unit</th>
              </tr>
            </thead>
            <tbody>
              {readings.map(r => (
                <tr key={r._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '8px' }}>{new Date(r.timestamp).toLocaleString()}</td>
                  <td style={{ padding: '8px' }}>{r.type}</td>
                  <td style={{ padding: '8px' }}>{r.value}</td>
                  <td style={{ padding: '8px' }}>{r.unit || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageWrapper>
  );
};

export default History;
