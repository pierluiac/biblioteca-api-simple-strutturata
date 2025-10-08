/**
 * Middleware di Logging
 * Gestisce il logging delle richieste HTTP
 */

const morgan = require('morgan');
const config = require('../config/config');

/**
 * Middleware di logging personalizzato
 */
const requestLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.originalUrl;
    const userAgent = req.get('User-Agent') || 'Unknown';
    const ip = req.ip || req.connection.remoteAddress;

    console.log(`[${timestamp}] ${method} ${url} - ${ip} - ${userAgent}`);
    
    // Aggiungi timestamp alla richiesta per uso nei controller
    req.timestamp = timestamp;
    
    next();
};

/**
 * Middleware di logging delle risposte
 */
const responseLogger = (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
        const timestamp = new Date().toISOString();
        const statusCode = res.statusCode;
        const contentLength = res.get('Content-Length') || 0;
        
        console.log(`[${timestamp}] Response ${statusCode} - ${contentLength} bytes`);
        
        originalSend.call(this, data);
    };
    
    next();
};

/**
 * Middleware di logging degli errori
 */
const errorLogger = (err, req, res, next) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.originalUrl;
    const errorMessage = err.message;
    const stack = err.stack;

    console.error(`[${timestamp}] ERROR ${method} ${url}:`);
    console.error(`[${timestamp}] Message: ${errorMessage}`);
    
    if (config.server.environment === 'development') {
        console.error(`[${timestamp}] Stack: ${stack}`);
    }
    
    next(err);
};

/**
 * Configurazione Morgan per logging HTTP
 */
const morganLogger = morgan(config.logging.format, {
    skip: (req, res) => {
        // Salta il logging per le richieste di health check
        return req.url === '/health';
    }
});

module.exports = {
    requestLogger,
    responseLogger,
    errorLogger,
    morganLogger
};
