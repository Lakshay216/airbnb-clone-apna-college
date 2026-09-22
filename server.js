if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const mongoose = require('mongoose');
const app = require('./app.js');

const port = process.env.PORT || 8080;
let server;

async function startServer() {
    if (!process.env.ATLASDB_URL) {
        throw new Error('ATLASDB_URL must be set');
    }

    await mongoose.connect(process.env.ATLASDB_URL);
    console.log('MongoDB connection successful');

    server = app.listen(port, () => {
        console.log(`Listening on port ${port}`);
    });
}

async function stopServer() {
    await mongoose.connection.close();

    if (server) {
        server.close(() => process.exit(0));
    } else {
        process.exit(0);
    }
}

process.on('SIGTERM', stopServer);
process.on('SIGINT', stopServer);

startServer().catch((err) => {
    console.error('Unable to start the application:', err.message);
    process.exit(1);
});
