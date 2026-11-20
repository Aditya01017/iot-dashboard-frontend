import { useState, useEffect } from 'react';
import { getDevices, getDevicesSummary } from '../api/devices.api';

export const useDevices = () => {
  const [devices, setDevices] = useState([]);
  const [summary, setSummary] = useState({ total: 0, online: 0, offline: 0, idle: 0 });
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await getDevices();
      setDevices(res.data.devices);

      const sumRes = await getDevicesSummary();
      if (sumRes.data.success) {
        setSummary(sumRes.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return { devices, summary, loading, refetch: fetchAll };
};
