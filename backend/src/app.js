const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const userRoutes = require('./routes/user.routes');
const employeeRoutes = require('./routes/employee.routes');
const invitationRoutes = require('./routes/invitation.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const companyRoutes = require('./routes/company.routes');
const departmentRoutes = require('./routes/department.routes');
const vacationRoutes = require('./routes/vacation.routes');

const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security & parsing
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));

// Routes
app.use('/health', healthRoutes);
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/users', userRoutes);
app.use('/employees', employeeRoutes);
app.use('/invitations', invitationRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/company', companyRoutes);
app.use('/departments', departmentRoutes);
app.use('/vacations', vacationRoutes);
// 404
app.use((req, res) => res.status(404).json({ message: 'Not found' }));

// Error handler
app.use(errorHandler);

module.exports = app;
