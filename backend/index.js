require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const studentsRoutes = require('./routes/students');
const projectsRoutes = require('./routes/projects');
const organizationsRoutes = require('./routes/organizations');
const enrollmentsRoutes = require('./routes/enrollments');
const usersRoutes = require('./routes/users');
const codesRoutes = require('./routes/codes');
const periodsRoutes = require('./routes/periods');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/organizations', organizationsRoutes);
app.use('/api/enrollments', enrollmentsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/codes', codesRoutes);
app.use('/api/periods', periodsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
});

// Catch unhandled errors that might crash the server silently
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION at:', promise, 'reason:', reason);
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Explicit keep-alive to prevent Node from exiting if something unrefs the server
setInterval(() => {}, 1000 * 60 * 60);
