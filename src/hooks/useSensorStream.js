import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';
import { getLatestReadings } from '../api/sensors.api';

export const useSensorStream = (deviceId) => {
  const [readings, setReadings] = useState([]);
  const [liveReading, setLiveReading] = useState(null);

  const handleSensorUpdate = useCallback((reading) => {
    if (String(reading.deviceId) === String(deviceId)) {
      setLiveReading(reading);
    }
  }, [deviceId]);

  const { subscribe, unsubscribe } = useSocket(handleSensorUpdate, null, null);

  useEffect(() => {
    if (!deviceId) return;

    const fetchLatest = async () => {
      try {
        const res = await getLatestReadings(deviceId);
        if (res.data.success) {
          setReadings(res.data.readings);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchLatest();
    subscribe(deviceId);

    return () => unsubscribe(deviceId);
  }, [deviceId, subscribe, unsubscribe]);

  return { readings, liveReading };
};
