const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./connectDB/connect');
const productRoutes = require('./routes/productRoute');
const userRoutes = require('./routes/userRoute');
const orderRoutes = require('./routes/orderRoute');
const paymentRoutes = require('./routes/paymentRoute');

// FIXED: Cloudinary import (must use .v2)
const cloudinary = require('cloudinary').v2;

const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const multer = require('multer');
const { register, inventoryGauge, httpRequestDuration, httpRequestTotal } = require('./metrics');

// Load environment variables from backend/.env
require('dotenv').config({ path: path.join(__dirname, '.env') });

const PORT = process.env.PORT || 4000;

let server;

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to uncaught exception`);
    if (server) {
        server.close(() => process.exit(1));
    } else {
        process.exit(1);
    }
});

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(fileUpload());

// CORS configuration
const cors = require('cors');
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5000'],
    credentials: true
}));

// ✅ FIXED CLOUDINARY CONFIG
if (
    process.env.CLOUDINARY_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    console.log("Cloudinary configured successfully!");
} else {
    console.log("Cloudinary NOT configured. Missing environment variables.");
}

// API Routes
app.use('/api/v1/product', productRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/order', orderRoutes);
app.use('/api/v1/payment', paymentRoutes);

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
    try {
        res.set('Content-Type', register.contentType);
        const metrics = await register.metrics();
        res.end(metrics);
    } catch (err) {
        res.status(500).end(err);
    }
});

// Root endpoint
app.get('/', (req, res) => {
    res.send('Server is Working! Access API at /api/v1/...');
});

// Test endpoint
app.get('/test', (req, res) => {
    res.send('This is E-Kart website.');
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
    const frontendPath = path.join(__dirname, '..', 'frontend', 'dist');
    app.use(express.static(frontendPath));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(frontendPath, 'index.html'));
    });
}

// Start server + connect DB with auto free port logic
const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI);

        let currentPort = PORT;

        const startServer = () => {
            server = app.listen(currentPort, () => {
                console.log(`Server running at http://localhost:${currentPort}`);
            });

            server.on('error', (err) => {
                if (err.code === 'EADDRINUSE') {
                    console.log(`⚠️  Port ${currentPort} is in use. Trying next port...`);
                    currentPort++; // increment port
                    startServer(); // try again
                } else {
                    console.log(`❌ Server error: ${err.message}`);
                    process.exit(1);
                }
            });
        };

        startServer();

        // Update inventory metrics periodically
        const ProductSchema = require('./modals/ProductSchema');
        const updateInventoryMetrics = async () => {
            try {
                const totalProducts = await ProductSchema.countDocuments();
                inventoryGauge.set(totalProducts);
            } catch (error) {
                console.log('Error updating inventory metrics:', error.message);
            }
        };

        // Update metrics immediately and then every 30 seconds
        updateInventoryMetrics();
        setInterval(updateInventoryMetrics, 30000);

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (err) => {
            console.log(`Error: ${err.message}`);
            console.log(`Shutting down the server due to unhandled promise rejection`);
            if (server) server.close(() => process.exit(1));
        });

    } catch (error) {
        console.log('Something went wrong, Please check the Database');
        process.exit(1);
    }
};

start();
