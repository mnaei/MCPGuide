import net from "node:net";

function createLogServer(port = 8099) {
  const server = net.createServer((socket) => {
    console.log('Client connected');
    
    socket.on('data', (data) => {
      const entries = data.toString().split('\n').filter(Boolean);
      entries.forEach(entry => {
        try {
          const logEntry = JSON.parse(entry);
          console.log(`[${logEntry.level.toUpperCase()}] ${logEntry.message}`);
        } catch (e) {
          console.log('Raw log:', data.toString());
        }
      });
    });
    
    socket.on('close', () => {
      console.log('Client disconnected');
    });
  });

  server.listen(port, () => {
    console.log(`Log server listening on port ${port}`);
  });
  
  return {
    stop: () => {
      server.close();
      console.log(`Log server on port ${port} stopped`);
    }
  };
}

// Usage:
createLogServer();
// Later when you want to stop:
// logServer.stop();