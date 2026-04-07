import { io } from 'socket.io-client';
import { API_BASE_URL } from '../config';

let socket;

export const initSocket = (user) => {
    if (socket) return socket;

    socket = io(API_BASE_URL, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5
    });

    socket.on('connect', () => {
        console.log('📡 Connected to Real-time Sync');
        
        // Let server know who we are to join rooms
        if (user) {
            socket.emit('join', { 
                userId: user.id || user.user?.id, 
                role: user.role || user.user?.role 
            });
        }
    });

    socket.on('disconnect', () => {
        console.log('📡 Disconnected from Sync');
    });

    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

// Common event listeners
export const subscribeToNotifications = (callback) => {
    if (!socket) return;
    socket.on('NOTIFICATION_CREATED', (data) => {
        console.log('🔔 New Notification received via Socket:', data);
        callback(data);
    });
};

export const subscribeToEvents = (callback) => {
    if (!socket) return;
    socket.on('EVENT_CREATED', (data) => callback(data, 'CREATED'));
    socket.on('EVENT_UPDATED', (data) => callback(data, 'UPDATED'));
};
