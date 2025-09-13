import http from 'http';
import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';
import { initSockets } from './sockets/socket.js';

dotenv.config();
const PORT = process.env.PORT || 4000;

await connectDB();

const server = http.createServer(app);
initSockets(server); 

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
