const express = require('express');
const connectDB = require('../config/db');
const { errorHandler } = require('./middleware/errorHandler');

const PORT = process.env.PORT || 5000;

const app = express();
connectDB();

app.use(express.json({ extended: false }));

app.get('/', (request, response) => response.send('API Running'));

app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));

app.use((error, request, response, next) => errorHandler(error, request, response, next));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
