/**
 * Configurazione dell'applicazione
 * Centralizza tutte le configurazioni in un unico file
 */

const config = {
    // Configurazione server
    server: {
        port: process.env.PORT || 3000,
        host: process.env.HOST || 'localhost',
        environment: process.env.NODE_ENV || 'development'
    },

    // Configurazione database
    database: {
        filename: process.env.DB_FILENAME || 'database.db',
        path: process.env.DB_PATH || './database.db'
    },

    // Configurazione API
    api: {
        version: '1.0.0',
        basePath: '/api',
        defaultLimit: 50,
        maxLimit: 100
    },

    // Configurazione CORS
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    },

    // Configurazione logging
    logging: {
        level: process.env.LOG_LEVEL || 'combined',
        format: process.env.LOG_FORMAT || 'combined'
    }
};

module.exports = config;
