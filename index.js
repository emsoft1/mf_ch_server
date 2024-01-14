require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const { expressjwt: jwtMiddleware } = require('express-jwt');
const socketIo = require('socket.io');
const http = require('http');

// Environment variables
const SECRET_KEY = process.env.SECRET_KEY || 'default_secret_key';
const PORT = process.env.PORT || 3000;

// Initialize express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middlewares
app.use(express.json()); // for parsing application/json
app.get('/', (req, res) => {
  
  res.json({ Web_server_status : "OK"  });
});
// JWT middleware setup
app.use(jwtMiddleware({ 
    secret: SECRET_KEY, 
    algorithms: ['HS256'] 
}).unless({ path: ['/login'] }));


// Login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '24h' });

  res.json({ token });
});


// Protected endpoint example
app.get('/protected', (req, res) => {
  res.send('Accessing protected route');
});

// Random financial data generator
function generateRandomFinancialData() {
  return {
    stockName: "ExampleStock",
    price: Math.random() * 1000,
    timestamp: new Date()
  };
}

// Emit financial data every second
setInterval(() => {
  const data = generateRandomFinancialData();
  io.emit('financialData', data);
}, 1000);

// Starting the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


module.exports = app;