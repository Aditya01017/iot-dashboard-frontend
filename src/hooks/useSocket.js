import { useCallback, useEffect } from 'react';
import { useSocketContext } from '../context/useSocketContext';

export const useSocket = (onSensorUpdate, onAlertTriggered, onDeviceStatus) => {
  const socket = useSocketContext();

  useEffect(() => {
    if (!socket) return;

    if (onSensorUpdate) socket.on('sensor:update', onSensorUpdate);
    if (onAlertTriggered) socket.on('alert:triggered', onAlertTriggered);
    if (onDeviceStatus) socket.on('device:status', onDeviceStatus);

    return () => {
      if (onSensorUpdate) socket.off('sensor:update', onSensorUpdate);
      if (onAlertTriggered) socket.off('alert:triggered', onAlertTriggered);
      if (onDeviceStatus) socket.off('device:status', onDeviceStatus);
    };
  }, [socket, onSensorUpdate, onAlertTriggered, onDeviceStatus]);

  const subscribe = useCallback((deviceId) => socket?.emit('subscribe:device', { deviceId }), [socket]);
  const unsubscribe = useCallback((deviceId) => socket?.emit('unsubscribe:device', { deviceId }), [socket]);

  return { subscribe, unsubscribe };
};
