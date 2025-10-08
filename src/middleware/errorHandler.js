/**
 * Middleware di Gestione Errori
 * Gestisce gli errori dell'applicazione in modo centralizzato
 */

const config = require('../config/config');

/**
 * Middleware per gestire errori 404 (Route non trovata)
 */
const notFoundHandler = (req, res, next) => {
    const error = new Error(`Route non trovata: ${req.method} ${req.originalUrl}`);
    error.status = 404;
    next(error);
};

/**
 * Middleware principale per la gestione degli errori
 */
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log dell'errore
    console.error(`Error ${err.status || 500}: ${err.message}`);

    // Errore di validazione Mongoose (se presente)
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = {
            message,
            status: 400
        };
    }

    // Errore di duplicazione (SQLite)
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        const message = 'Risorsa già esistente';
        error = {
            message,
            status: 409
        };
    }

    // Errore di foreign key constraint
    if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
        const message = 'Impossibile eliminare: risorsa in uso';
        error = {
            message,
            status: 409
        };
    }

    // Errore di sintassi SQL
    if (err.code === 'SQLITE_ERROR') {
        const message = 'Errore nel database';
        error = {
            message,
            status: 500
        };
    }

    // Errore di connessione al database
    if (err.code === 'SQLITE_CANTOPEN') {
        const message = 'Impossibile connettersi al database';
        error = {
            message,
            status: 503
        };
    }

    // Risposta dell'errore
    res.status(error.status || 500).json({
        success: false,
        error: {
            message: error.message || 'Errore interno del server',
            status: error.status || 500,
            ...(config.server.environment === 'development' && { stack: err.stack })
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        method: req.method
    });
};

/**
 * Middleware per gestire errori di parsing JSON
 */
const jsonErrorHandler = (err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            success: false,
            error: {
                message: 'JSON non valido',
                status: 400
            },
            timestamp: new Date().toISOString(),
            path: req.originalUrl,
            method: req.method
        });
    }
    next(err);
};

/**
 * Middleware per gestire errori di validazione
 */
const validationErrorHandler = (errors, req, res, next) => {
    if (errors && errors.length > 0) {
        return res.status(400).json({
            success: false,
            error: {
                message: 'Dati di validazione non validi',
                status: 400,
                details: errors
            },
            timestamp: new Date().toISOString(),
            path: req.originalUrl,
            method: req.method
        });
    }
    next();
};

/**
 * Wrapper per gestire errori async
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = {
    notFoundHandler,
    errorHandler,
    jsonErrorHandler,
    validationErrorHandler,
    asyncHandler
};
