/**
 * Middleware di Configurazione
 * Gestisce CORS, parsing del body e altre configurazioni
 */

const cors = require('cors');
const config = require('../config/config');

/**
 * Configurazione CORS
 */
const corsOptions = {
    origin: config.cors.origin,
    methods: config.cors.methods,
    allowedHeaders: config.cors.allowedHeaders,
    credentials: true,
    optionsSuccessStatus: 200
};

const corsMiddleware = cors(corsOptions);

/**
 * Middleware per parsing del body JSON
 */
const jsonParser = (req, res, next) => {
    if (req.method === 'POST' || req.method === 'PUT') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                if (body) {
                    req.body = JSON.parse(body);
                } else {
                    req.body = {};
                }
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'JSON non valido',
                        status: 400
                    }
                });
            }
            next();
        });
    } else {
        next();
    }
};

/**
 * Middleware per parsing URL encoded
 */
const urlEncodedParser = (req, res, next) => {
    if (req.method === 'POST' || req.method === 'PUT') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                if (body) {
                    const params = new URLSearchParams(body);
                    req.body = Object.fromEntries(params);
                } else {
                    req.body = {};
                }
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Dati URL encoded non validi',
                        status: 400
                    }
                });
            }
            next();
        });
    } else {
        next();
    }
};

/**
 * Middleware per aggiungere headers di sicurezza
 */
const securityHeaders = (req, res, next) => {
    // Prevenire clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Prevenire MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Abilitare XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Content Security Policy (base)
    res.setHeader('Content-Security-Policy', "default-src 'self'");
    
    next();
};

/**
 * Middleware per aggiungere informazioni sulla versione API
 */
const apiInfo = (req, res, next) => {
    res.setHeader('X-API-Version', config.api.version);
    res.setHeader('X-Powered-By', 'Biblioteca API');
    next();
};

/**
 * Middleware per limitare la dimensione del body
 */
const bodySizeLimit = (maxSize = '10mb') => {
    return (req, res, next) => {
        const contentLength = parseInt(req.get('Content-Length') || '0');
        const maxBytes = parseSize(maxSize);
        
        if (contentLength > maxBytes) {
            return res.status(413).json({
                success: false,
                error: {
                    message: 'Payload troppo grande',
                    status: 413,
                    maxSize: maxSize
                }
            });
        }
        
        next();
    };
};

/**
 * Converte una stringa di dimensione in bytes
 */
function parseSize(size) {
    const units = {
        'b': 1,
        'kb': 1024,
        'mb': 1024 * 1024,
        'gb': 1024 * 1024 * 1024
    };
    
    const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)?$/);
    if (!match) return 0;
    
    const value = parseFloat(match[1]);
    const unit = match[2] || 'b';
    
    return Math.floor(value * units[unit]);
}

/**
 * Middleware per aggiungere timestamp alle richieste
 */
const addTimestamp = (req, res, next) => {
    req.timestamp = new Date().toISOString();
    next();
};

module.exports = {
    corsMiddleware,
    jsonParser,
    urlEncodedParser,
    securityHeaders,
    apiInfo,
    bodySizeLimit,
    addTimestamp
};
