import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import LineChart from '../components/charts/LineChart';
import GaugeChart from '../components/charts/GaugeChart';
import MetricCard from '../components/cards/MetricCard';
import Spinner from '../components/common/Spinner';
import Skeleton from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import { getDevice, getDevices, updateDevice } from '../api/devices.api';
import { getSensorHistory, getLatestReadings } from '../api/sensors.api';
import { useSensorStream } from '../hooks/useSensorStream';
import { useAuth } from '../context/useAuth';

// work out the "from" date based on the chosen time window
const getFromDate = (window) => {
  const now = Date.now();
  if (window === '1h') return new Date(now - 60 * 60 * 1000).toISOString();
  if (window === '24h') return new Date(now - 24 * 60 * 60 * 1000).toISOString();
  if (window === '7d') return new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
  return undefined;
};

// max value for the gauge depends on the sensor type
const getGaugeMax = (type) => {
  if (type === 'temperature') return 120;
  if (type === 'humidity') return 100;
  if (type === 'pressure') return 1100;
  return 1;
};

// colors for each device line in the comparison chart
const palette = ['#4f46e5', '#ef4444', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'];

const DeviceDetail = () => {
  const { deviceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  const [device, setDevice] = useState(null);
  const [selectedType, setSelectedType] = useState('temperature');
  const [timeWindow, setTimeWindow] = useState('24h');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // track latest values for ALL sensor types to power the Live Grid
  const [latestReadings, setLatestReadings] = useState({});

  // for comparing the SAME sensor across other devices
  const [allDevices, setAllDevices] = useState([]);
  const [compareDeviceIds, setCompareDeviceIds] = useState([]);
  const [compareData, setCompareData] = useState([]);

  const { liveReading } = useSensorStream(deviceId);

  // capture live readings across all types for the Live Grid
  useEffect(() => {
    if (liveReading) {
      setLatestReadings(prev => ({
        ...prev,
        [liveReading.type]: liveReading.value
      }));
    }
  }, [liveReading]);

  // pre-fetch the latest readings for all sensors on mount so the grid isn't empty
  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await getLatestReadings(deviceId);
        if (res.data.success && res.data.readings) {
          const initial = {};
          res.data.readings.forEach(r => {
            initial[r.type] = r.value;
          });
          // merge with any live readings that might have arrived in the meantime
          setLatestReadings(prev => ({ ...initial, ...prev }));
        }
      } catch (err) {
        console.error("Failed to fetch latest readings:", err);
      }
    };
    fetchLatest();
  }, [deviceId]);

  // fetch the current device
  useEffect(() => {
    const fetchDevice = async () => {
      try {
        const res = await getDevice(deviceId);
        if (res.data.success) setDevice(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDevice();
  }, [deviceId]);

  // fetch the full device list so we can offer them for comparison
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await getDevices();
        if (res.data.success) setAllDevices(res.data.devices);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDevices();
  }, []);

  // main chart history for THIS device
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const params = { type: selectedType, limit: 200 };
        const from = getFromDate(timeWindow);
        if (from) params.from = from;

        const res = await getSensorHistory(deviceId, params);
        if (res.data.success) {
          const formatted = res.data.readings.reverse().map(r => ({
            time: new Date(r.timestamp).toLocaleTimeString(),
            value: r.value
          }));
          setHistory(formatted);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchHistory();
  }, [deviceId, selectedType, timeWindow]);

  // add live readings to the main chart as they arrive
  useEffect(() => {
    if (liveReading && liveReading.type === selectedType) {
      const point = {
        time: new Date(liveReading.timestamp).toLocaleTimeString(),
        value: liveReading.value
      };
      setHistory(prev => [...prev, point].slice(-200));
    }
  }, [liveReading, selectedType]);

  // build the comparison data: the SAME sensor type across the current device + the selected ones
  useEffect(() => {
    if (compareDeviceIds.length === 0) {
      setCompareData([]);
      return;
    }

    const fetchCompare = async () => {
      try {
        const ids = [deviceId, ...compareDeviceIds];
        const histories = {};
        for (let id of ids) {
          const params = { type: selectedType, limit: 50 };
          const from = getFromDate(timeWindow);
          if (from) params.from = from;
          const res = await getSensorHistory(id, params);
          if (res.data.success) histories[id] = res.data.readings.reverse();
        }

        // line them up by index (all devices publish together so they roughly align)
        const len = Math.min(...ids.map(id => (histories[id] || []).length));
        const merged = [];
        for (let i = 0; i < len; i++) {
          const row = { time: new Date(histories[ids[0]][i].timestamp).toLocaleTimeString() };
          for (let id of ids) {
            row[id] = histories[id][i].value;
          }
          merged.push(row);
        }
        setCompareData(merged);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCompare();
  }, [deviceId, selectedType, timeWindow, compareDeviceIds]);

  if (loading) return (
    <PageWrapper title="Loading Device...">
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <Skeleton height="100px" width="200px" borderRadius="8px" />
        <Skeleton height="100px" width="200px" borderRadius="8px" />
        <Skeleton height="100px" width="200px" borderRadius="8px" />
      </div>
      <Skeleton height="400px" borderRadius="8px" />
    </PageWrapper>
  );
  if (!device) return <PageWrapper title="Device Detail"><p>Device not found.</p></PageWrapper>;

  const types = ['temperature', 'humidity', 'motion', 'pressure'];
  const windows = ['1h', '24h', '7d'];

  const otherDevices = allDevices.filter(d => d._id !== deviceId);

  const nameById = (id) => {
    if (id === deviceId) return `${device.name} (this)`;
    const d = allDevices.find(x => x._id === id);
    return d ? d.name : id;
  };

  const toggleCompareDevice = (id) => {
    setCompareDeviceIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // one line per device, all showing the same sensor type
  const compareSeries = [deviceId, ...compareDeviceIds].map((id, idx) => ({
    dataKey: id,
    name: nameById(id),
    color: palette[idx % palette.length]
  }));

  const handleOpenEdit = () => {
    setFormData({
      name: device.name,
      serialNumber: device.serialNumber || '',
      type: device.type,
      status: device.status,
      firmware: device.firmware || '',
      ipAddress: device.ipAddress || '',
      location: device.location || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await updateDevice(deviceId, formData);
      setDevice(res.data.device);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving device:', err);
      alert('Failed to save device');
    }
  };

  return (
    <PageWrapper title={device.name}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ fontSize: '14px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ cursor: 'pointer', color: '#4f46e5', fontWeight: '500' }} onClick={() => navigate('/devices')}>Devices</span>
          <span>/</span>
          <span style={{ color: '#0f172a', fontWeight: '500' }}>{device.name}</span>
        </div>
        {isAdmin && <Button variant="secondary" onClick={handleOpenEdit}>Edit Device</Button>}
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <MetricCard title="Type" value={device.type} />
        <MetricCard title="Status" value={device.status} color={device.status === 'online' ? 'green' : 'red'} />
        <MetricCard title="Serial No." value={device.serialNumber || '-'} />
        <MetricCard title="Firmware" value={device.firmware || '-'} />
      </div>

      <h3 style={{ marginTop: '30px', marginBottom: '15px', color: '#0f172a' }}>Live Sensor Overview</h3>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px', flexWrap: 'wrap' }}>
        <GaugeChart value={latestReadings.temperature ?? (selectedType === 'temperature' && history.length ? history[history.length - 1].value : null)} max={getGaugeMax('temperature')} label="Temperature (°F)" color="#ef4444" />
        <GaugeChart value={latestReadings.humidity ?? (selectedType === 'humidity' && history.length ? history[history.length - 1].value : null)} max={getGaugeMax('humidity')} label="Humidity (%)" color="#3b82f6" />
        <GaugeChart value={latestReadings.pressure ?? (selectedType === 'pressure' && history.length ? history[history.length - 1].value : null)} max={getGaugeMax('pressure')} label="Pressure (hPa)" color="#10b981" />
        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h4 style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Motion Status</h4>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a' }}>
            {latestReadings.motion !== undefined ? (latestReadings.motion ? 'DETECTED' : 'CLEAR') : '--'}
          </div>
        </div>
      </div>

      <h3 style={{ marginTop: '30px', marginBottom: '15px', color: '#0f172a' }}>Historical Analysis</h3>
      <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontWeight: '500', color: '#475569' }}>Metric:</label>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}>
              {types.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {windows.map(w => (
              <button
                key={w}
                onClick={() => setTimeWindow(w)}
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '500',
                  background: timeWindow === w ? '#4f46e5' : '#f1f5f9',
                  color: timeWindow === w ? 'white' : '#475569',
                  transition: 'background 0.2s ease'
                }}
              >
                {w === '1h' ? 'Last 1h' : w === '24h' ? 'Last 24h' : 'Last 7d'}
              </button>
            ))}
          </div>
        </div>
        <div style={{ margin: '0 -24px -24px -24px' }}>
          <LineChart data={history} dataKey="value" color="#4f46e5" />
        </div>
      </div>

      {/* compare the SAME sensor with other devices - same unit so it makes sense */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h3 style={{ marginTop: 0 }}>Compare {selectedType} with other devices</h3>
        {otherDevices.length === 0 ? (
          <EmptyState
            title="No other devices available"
            description="You need at least two devices on your network to use the comparison tool."
          />
        ) : (
          <div style={{ marginBottom: '15px' }}>
            {otherDevices.map(d => (
              <label key={d._id} style={{ marginRight: '15px' }}>
                <input
                  type="checkbox"
                  checked={compareDeviceIds.includes(d._id)}
                  onChange={() => toggleCompareDevice(d._id)}
                /> {d.name}
              </label>
            ))}
          </div>
        )}
        {compareData.length > 0 ? (
          <LineChart data={compareData} series={compareSeries} title={`${selectedType} across devices`} />
        ) : (
          <EmptyState
            title="Select a device to compare"
            description={`Select one or more devices above to compare their ${selectedType} with this one.`}
          />
        )}
      </div>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Update Node Config"
      >
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Device Name/ID</label>
            <input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} required />
          </div>

          <div className="form-group">
            <label>Serial Number</label>
            <input type="text" value={formData.serialNumber || ''} onChange={e => setFormData({...formData, serialNumber: e.target.value})} placeholder="SN-12345" required />
          </div>

          <div className="form-group">
            <label>Device Type</label>
            <input type="text" value={formData.type || ''} onChange={e => setFormData({...formData, type: e.target.value})} required />
          </div>

          <div className="form-group">
            <label>Network Status</label>
            <select value={formData.status || 'online'} onChange={e => setFormData({...formData, status: e.target.value})}>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="idle">Idle</option>
            </select>
          </div>

          <div className="form-group">
            <label>Location Area</label>
            <input type="text" value={formData.location || ''} onChange={e => setFormData({...formData, location: e.target.value})} />
          </div>

          <div className="form-group">
            <label>IP Address</label>
            <input type="text" value={formData.ipAddress || ''} onChange={e => setFormData({...formData, ipAddress: e.target.value})} />
          </div>

          <div className="form-group">
            <label>Firmware Version</label>
            <input type="text" value={formData.firmware || ''} onChange={e => setFormData({...formData, firmware: e.target.value})} />
          </div>

          <div className="modal-actions">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Save Changes</Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
};

export default DeviceDetail;
