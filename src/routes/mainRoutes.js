/**
 * Routes Principali
 * Definisce le rotte principali dell'API
 */

const express = require('express');
const router = express.Router();
const config = require('../config/config');

/**
 * @route   GET /api
 * @desc    Informazioni sull'API
 * @access  Public
 */
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Biblioteca API - Versione Strutturata',
        version: config.api.version,
        timestamp: new Date().toISOString(),
        endpoints: {
            libri: '/api/libri',
            utenti: '/api/utenti',
            prestiti: '/api/prestiti',
            health: '/health'
        },
        documentation: {
            description: 'API REST per la gestione di una biblioteca',
            features: [
                'CRUD completo per libri, utenti e prestiti',
                'Ricerca e paginazione',
                'Gestione prestiti con scadenze',
                'Statistiche e report',
                'Architettura modulare e scalabile'
            ]
        }
    });
});

/**
 * @route   GET /health
 * @desc    Health check dell'API
 * @access  Public
 */
router.get('/health', (req, res) => {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    
    res.json({
        status: 'OK',
        service: 'Biblioteca API Strutturata',
        version: config.api.version,
        timestamp: new Date().toISOString(),
        uptime: uptime,
        environment: config.server.environment,
        memory: {
            used: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
            total: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB'
        },
        database: {
            status: 'Connected',
            path: config.database.path
        }
    });
});

/**
 * @route   GET /api/status
 * @desc    Status dettagliato dell'API
 * @access  Public
 */
router.get('/status', async (req, res) => {
    try {
        const database = require('../config/database');
        
        // Test connessione database
        const dbTest = await database.get('SELECT 1 as test');
        
        res.json({
            success: true,
            status: 'OK',
            timestamp: new Date().toISOString(),
            services: {
                api: 'OK',
                database: dbTest ? 'OK' : 'ERROR',
                server: 'OK'
            },
            version: config.api.version,
            environment: config.server.environment
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            status: 'ERROR',
            timestamp: new Date().toISOString(),
            services: {
                api: 'OK',
                database: 'ERROR',
                server: 'OK'
            },
            error: error.message
        });
    }
});

module.exports = router;
