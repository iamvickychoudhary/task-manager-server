import { Server } from 'socket.io';

let io;

export function initSockets(server) {
  io = new Server(server, {
    cors: { origin: process.env.FRONTEND_URL || '*', methods: ['GET', 'POST'] }
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('join-board', (boardId) => {
      if (!boardId) return;
      socket.join(`board:${boardId}`);
    });

    socket.on('leave-board', (boardId) => {
      if (!boardId) return;
      socket.leave(`board:${boardId}`);
    });

    socket.on('disconnect', () => {
    });
  });

  return io;
}

export function emitToBoard(boardId, event, payload) {
  if (!io) return;
  io.to(`board:${boardId}`).emit(event, payload);
}
