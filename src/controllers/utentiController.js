/**
 * Controller Utenti
 * Gestisce le operazioni CRUD per gli utenti
 */

const Utente = require('../models/Utente');
const { asyncHandler } = require('../middleware/errorHandler');

class UtentiController {
    /**
     * GET /api/utenti - Ottiene tutti gli utenti
     */
    static getAllUtenti = asyncHandler(async (req, res) => {
        const { limit = 50, offset = 0, search = '' } = req.query;
        
        const options = {
            limit: parseInt(limit),
            offset: parseInt(offset),
            search: search.trim()
        };

        const utenti = await Utente.findAll(options);
        const total = await Utente.count(options.search);

        res.json({
            success: true,
            data: utenti,
            pagination: {
                total,
                limit: options.limit,
                offset: options.offset,
                hasMore: (options.offset + options.limit) < total
            }
        });
    });

    /**
     * GET /api/utenti/:id - Ottiene un utente per ID
     */
    static getUtenteById = asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'ID utente non valido',
                    status: 400
                }
            });
        }

        const utente = await Utente.findById(id);
        
        if (!utente) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Utente non trovato',
                    status: 404
                }
            });
        }

        res.json({
            success: true,
            data: utente
        });
    });

    /**
     * POST /api/utenti - Crea un nuovo utente
     */
    static createUtente = asyncHandler(async (req, res) => {
        const utenteData = req.body;
        
        // Verifica se esiste già un utente con la stessa email
        if (utenteData.email) {
            const existingUtente = await Utente.findByEmail(utenteData.email);
            if (existingUtente) {
                return res.status(409).json({
                    success: false,
                    error: {
                        message: 'Un utente con questa email esiste già',
                        status: 409
                    }
                });
            }
        }

        const utente = new Utente(utenteData);
        
        // Validazione
        const validation = utente.validate();
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Dati di validazione non validi',
                    status: 400,
                    details: validation.errors
                }
            });
        }

        await utente.save();

        res.status(201).json({
            success: true,
            data: utente,
            message: 'Utente creato con successo'
        });
    });

    /**
     * PUT /api/utenti/:id - Aggiorna un utente esistente
     */
    static updateUtente = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const updateData = req.body;
        
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'ID utente non valido',
                    status: 400
                }
            });
        }

        const utente = await Utente.findById(id);
        
        if (!utente) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Utente non trovato',
                    status: 404
                }
            });
        }

        // Verifica email duplicata se viene modificata
        if (updateData.email && updateData.email !== utente.email) {
            const existingUtente = await Utente.findByEmail(updateData.email);
            if (existingUtente) {
                return res.status(409).json({
                    success: false,
                    error: {
                        message: 'Un utente con questa email esiste già',
                        status: 409
                    }
                });
            }
        }

        // Aggiorna i campi
        Object.keys(updateData).forEach(key => {
            if (updateData[key] !== undefined) {
                utente[key] = updateData[key];
            }
        });

        // Validazione
        const validation = utente.validate();
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Dati di validazione non validi',
                    status: 400,
                    details: validation.errors
                }
            });
        }

        await utente.update();

        res.json({
            success: true,
            data: utente,
            message: 'Utente aggiornato con successo'
        });
    });

    /**
     * DELETE /api/utenti/:id - Elimina un utente
     */
    static deleteUtente = asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'ID utente non valido',
                    status: 400
                }
            });
        }

        const utente = await Utente.findById(id);
        
        if (!utente) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Utente non trovato',
                    status: 404
                }
            });
        }

        const deleted = await Utente.delete(id);
        
        if (!deleted) {
            return res.status(500).json({
                success: false,
                error: {
                    message: 'Errore durante l\'eliminazione dell\'utente',
                    status: 500
                }
            });
        }

        res.json({
            success: true,
            message: 'Utente eliminato con successo'
        });
    });

    /**
     * GET /api/utenti/search - Ricerca utenti
     */
    static searchUtenti = asyncHandler(async (req, res) => {
        const { q: query, limit = 50, offset = 0 } = req.query;
        
        if (!query || query.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Query di ricerca richiesta',
                    status: 400
                }
            });
        }

        const options = {
            limit: parseInt(limit),
            offset: parseInt(offset),
            search: query.trim()
        };

        const utenti = await Utente.findAll(options);
        const total = await Utente.count(options.search);

        res.json({
            success: true,
            data: utenti,
            pagination: {
                total,
                limit: options.limit,
                offset: options.offset,
                hasMore: (options.offset + options.limit) < total
            },
            query: query.trim()
        });
    });

    /**
     * GET /api/utenti/:id/prestiti - Ottiene i prestiti di un utente
     */
    static getUtentePrestiti = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { stato = '' } = req.query;
        
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'ID utente non valido',
                    status: 400
                }
            });
        }

        const utente = await Utente.findById(id);
        
        if (!utente) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Utente non trovato',
                    status: 404
                }
            });
        }

        const Prestito = require('../models/Prestito');
        const prestiti = await Prestito.findByUtente(id, stato);

        res.json({
            success: true,
            data: {
                utente: utente,
                prestiti: prestiti
            }
        });
    });
}

module.exports = UtentiController;
