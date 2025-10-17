/**
 * Controller Libri
 * Gestisce le operazioni CRUD per i libri
 */

const Libro = require('../models/Libro');
const { asyncHandler } = require('../middleware/errorHandler');

class LibriController {
    /**
     * GET /api/libri - Ottiene tutti i libri
     */
    static getAllLibri = asyncHandler(async (req, res) => {
        const { limit = 50, offset = 0, search = '' } = req.query;
        
        const options = {
            limit: parseInt(limit),
            offset: parseInt(offset),
            search: search.trim()
        };

        const libri = await Libro.findAll(options);
        const total = await Libro.count(options.search);

        res.json({
            success: true,
            data: libri,
            pagination: {
                total,
                limit: options.limit,
                offset: options.offset,
                hasMore: (options.offset + options.limit) < total
            }
        });
    });

    /**
     * GET /api/libri/:id - Ottiene un libro per ID
     */
    static getLibroById = asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'ID libro non valido',
                    status: 400
                }
            });
        }

        const libro = await Libro.findById(id);
        
        if (!libro) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Libro non trovato',
                    status: 404
                }
            });
        }

        res.json({
            success: true,
            data: libro
        });
    });

    /**
     * POST /api/libri - Crea un nuovo libro
     */
    static createLibro = asyncHandler(async (req, res) => {
        const libroData = req.body;
        
        const libro = new Libro(libroData);
        
        // Validazione
        const validation = libro.validate();
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

        await libro.save();

        res.status(201).json({
            success: true,
            data: libro,
            message: 'Libro creato con successo'
        });
    });

    /**
     * PUT /api/libri/:id - Aggiorna un libro esistente
     */
    static updateLibro = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const updateData = req.body;
        
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'ID libro non valido',
                    status: 400
                }
            });
        }

        const libro = await Libro.findById(id);
        
        if (!libro) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Libro non trovato',
                    status: 404
                }
            });
        }

        // Aggiorna i campi
        Object.keys(updateData).forEach(key => {
            if (updateData[key] !== undefined) {
                libro[key] = updateData[key];
            }
        });

        // Validazione
        const validation = libro.validate();
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

        await libro.update();

        res.json({
            success: true,
            data: libro,
            message: 'Libro aggiornato con successo'
        });
    });

    /**
     * DELETE /api/libri/:id - Elimina un libro
     */
    static deleteLibro = asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'ID libro non valido',
                    status: 400
                }
            });
        }

        const libro = await Libro.findById(id);
        
        if (!libro) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Libro non trovato',
                    status: 404
                }
            });
        }

        const deleted = await Libro.delete(id);
        
        if (!deleted) {
            return res.status(500).json({
                success: false,
                error: {
                    message: 'Errore durante l\'eliminazione del libro',
                    status: 500
                }
            });
        }

        res.json({
            success: true,
            message: 'Libro eliminato con successo'
        });
    });

    /**
     * GET /api/libri/search - Ricerca libri
     */
    static searchLibri = asyncHandler(async (req, res) => {
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

        const libri = await Libro.findAll(options);
        const total = await Libro.count(options.search);

        res.json({
            success: true,
            data: libri,
            pagination: {
                total,
                limit: options.limit,
                offset: options.offset,
                hasMore: (options.offset + options.limit) < total
            },
            query: query.trim()
        });
    });
}

module.exports = LibriController;
