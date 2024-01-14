const supertest = require('supertest');
const socketClient = require('socket.io-client');
const app = require('../index.js'); // Adjust the path according to your project structure

const PORT = process.env.PORT || 3010;
const SOCKET_URL = `http://localhost:${PORT}`;
let clientSocket;

describe('Server and Socket.IO Endpoints', () => {
  let request;

  beforeAll((done) => {
    request = supertest(app);
    clientSocket = socketClient.connect(SOCKET_URL, {
      'reconnection delay': 0,
      'reopen delay': 0,
      'force new connection': true,
      transports: ['websocket'],
    });

    clientSocket.on('connect', () => {
      done();
    });
  });

  afterAll((done) => {
    if (clientSocket.connected) {
      clientSocket.disconnect();
    }
    done();
  });

  it('should respond with a status OK for the root route', async () => {
    const response = await request.get('/');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ Web_server_status: "OK" });
  });

  it('should return a JWT token on login', async () => {
    const response = await request.post('/login')
                                 .send({ username: 'test', password: 'test' });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  it('should deny access to protected route without token', async () => {
    const response = await request.get('/protected');
    expect(response.statusCode).toBe(401);
  });

  it('should receive real-time financial data via Socket.IO', (done) => {
    clientSocket.on('financialData', (data) => {
      expect(data).toHaveProperty('stockName');
      expect(data).toHaveProperty('price');
      expect(data).toHaveProperty('timestamp');
      done();
    });
  });

  // Additional tests as needed
});
