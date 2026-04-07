const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*", // Adjust in production
            methods: ["GET", "POST", "PATCH", "DELETE"]
        }
    });

    console.log('✅ Socket.IO Initialized');

    io.on('connection', (socket) => {
        console.log(`🔌 New connection: ${socket.id}`);

        // Join room based on user ID or role
        socket.on('join', (data) => {
            if (data.userId) {
                socket.join(`user_${data.userId}`);
                console.log(`👤 User ${data.userId} joined their room`);
            }
            if (data.role) {
                socket.join(`role_${data.role}`);
                console.log(`🎭 User joined role room: role_${data.role}`);
            }
        });

        socket.on('disconnect', () => {
            console.log(`🔌 Socket disconnected: ${socket.id}`);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

module.exports = { initSocket, getIO };
