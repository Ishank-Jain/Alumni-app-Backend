// --- SERVER.JS ---
// 1. INITIALIZE TELEMETRY FIRST

require('./telemetry');

const dotenv = require("dotenv");
dotenv.config();

// 2. Load app and mongoose AFTER telemetry is fully initialized
const mongoose = require("mongoose");
const app = require("./app");
app.set('trust proxy', true);

// 3. INITIALIZATION
async function startServer() {
    try {
        console.log("⏳ Initializing application...");
        
        // Wait a tiny tick to ensure OTel has finished monkey-patching
        await new Promise(resolve => setTimeout(resolve, 500)); 

        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB connected !!");

        const PORT = process.env.PORT || 8000;
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        });

    } catch (err) {
        console.error("❌ Critical startup error:", err);
        process.exit(1);
    }
}

// 4. Debug Middleware (Keep this for now to confirm context propagation)
// Once you see traces in Tempo, you can delete this middleware.
app.use((req, res, next) => {
    const traceparent = req.headers['traceparent'];
    if (traceparent) {
        console.log(`DEBUG_TRACE_HEADERS: traceparent=${traceparent}`);
    }
    next();
});

startServer();