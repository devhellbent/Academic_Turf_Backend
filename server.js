const dotenv = require('dotenv');
// server.js
dotenv.config()
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./models');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/userRoutes');
const certificateRoutes = require('./routes/ProfileRouts/certificate.routes');
const experienceRoutes = require('./routes/ProfileRouts/Experience.routes');
const PostRouts = require('./routes/PostRouts/postRoutes');

const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 5000;


app.use(cors());
// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Use routes
app.use('/auth', authRoutes);
app.use("/api", userRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/experience', experienceRoutes);
app.use('/api/post', PostRouts);
// Sync Database
db.sequelize.sync({ alter: true, logging: false }).then(() => {
    console.log('Drop and Resync Database');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
