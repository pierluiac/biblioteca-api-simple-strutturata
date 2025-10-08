/**
 * Controller Prestiti
 * Gestisce le operazioni CRUD per i prestiti
 */

const Prestito = require('../models/Prestito');
const Libro = require('../models/Libro');
const Utente = require('../models/Utente');
const { asyncHandler } = require('../middleware/errorHandler');

class PrestitiController {
    /**
     * GET /api/prestiti - Ottiene tutti i prestiti
     */
    static getAllPrestiti = asyncHandler(async (req, res) => {
        const { limit = 50, offset = 0, stato = '' } = req.query;
        
        const options = {
            limit: parseInt(limit),
            offset: parseInt(offset),
            stato: stato.trim(),
            includeRelations: true
        };

        const prestiti = await Prestito.findAll(options);
        const total = await Prestito.count(options.stato);

        res.json({
            success: true,
            data: prestiti,
            pagination: {
                total,
                limit: options.limit,
                offset: options.offset,
                hasMore: (options.offset + options.limit) < total
            }
        });
    });

    /**
     * GET /api/prestiti/:id - Ottiene un prestito per ID
     */
    static getPrestitoById = asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'ID prestito non valido',
                    status: 400
                }
            });
        }

        const prestito = await Prestito.findById(id, true);
        
        if (!prestito) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Prestito non trovato',
                    status: 404
                }
            });
        }

        res.json({
            success: true,
            data: prestito
        });
    });

    /**
     * POST /api/prestiti - Crea un nuovo prestito
     */
    static createPrestito = asyncHandler(async (req, res) => {
        const { libro_id, utente_id } = req.body;
        
        // Verifica che libro e utente esistano
        const libro = await Libro.findById(libro_id);
        if (!libro) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Libro non trovato',
                    status: 404
                }
            });
        }

        const utente = await Utente.findById(utente_id);
        if (!utente) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Utente non trovato',
                    status: 404
                }
            });
        }

        // Verifica che il libro sia disponibile
        const isDisponibile = await Prestito.isLibroDisponibile(libro_id);
        if (!isDisponibile) {
            return res.status(409).json({
                success: false,
                error: {
                    message: 'Il libro non è disponibile per il prestito',
                    status: 409
                }
            });
        }

        const prestito = new Prestito({ libro_id, utente_id });
        
        // Validazione
        const validation = prestito.validate();
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

        await prestito.save();

        // Aggiorna lo stato del libro
        libro.disponibile = 0;
        await libro.update();

        res.status(201).json({
            success: true,
            data: prestito,
            message: 'Prestito creato con successo'
        });
    });

    /**
     * PUT /api/prestiti/:id/restituisci - Restituisce un prestito
     */
    static restituisciPrestito = asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'ID prestito non valido',
                    status: 400
                }
            });
        }

        const prestito = await Prestito.findById(id);
        
        if (!prestito) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Prestito non trovato',
                    status: 404
                }
            });
        }

        if (prestito.stato === 'restituito') {
            return res.status(409).json({
                success: false,
                error: {
                    message: 'Il prestito è già stato restituito',
                    status: 409
                }
            });
        }

        await prestito.restituisci();

        // Aggiorna lo stato del libro
        const libro = await Libro.findById(prestito.libro_id);
        if (libro) {
            libro.disponibile = 1;
            await libro.update();
        }

        res.json({
            success: true,
            data: prestito,
            message: 'Prestito restituito con successo'
        });
    });

    /**
     * DELETE /api/prestiti/:id - Elimina un prestito
     */
    static deletePrestito = asyncHandler(async (req, res) => {
        const { id } = req.params;
        
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'ID prestito non valido',
                    status: 400
                }
            });
        }

        const prestito = await Prestito.findById(id);
        
        if (!prestito) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Prestito non trovato',
                    status: 404
                }
            });
        }

        const deleted = await Prestito.delete(id);
        
        if (!deleted) {
            return res.status(500).json({
                success: false,
                error: {
                    message: 'Errore durante l\'eliminazione del prestito',
                    status: 500
                }
            });
        }

        res.json({
            success: true,
            message: 'Prestito eliminato con successo'
        });
    });

    /**
     * GET /api/prestiti/scaduti - Ottiene i prestiti scaduti
     */
    static getPrestitiScaduti = asyncHandler(async (req, res) => {
        const { limit = 50, offset = 0 } = req.query;
        
        const options = {
            limit: parseInt(limit),
            offset: parseInt(offset),
            stato: 'attivo',
            includeRelations: true
        };

        const prestiti = await Prestito.findAll(options);
        
        // Filtra solo i prestiti scaduti
        const prestitiScaduti = prestiti.filter(prestito => prestito.isScaduto());

        res.json({
            success: true,
            data: prestitiScaduti,
            pagination: {
                total: prestitiScaduti.length,
                limit: options.limit,
                offset: options.offset,
                hasMore: false
            }
        });
    });

    /**
     * GET /api/prestiti/libro/:libro_id - Ottiene i prestiti di un libro
     */
    static getPrestitiByLibro = asyncHandler(async (req, res) => {
        const { libro_id } = req.params;
        const { stato = '' } = req.query;
        
        if (!libro_id || isNaN(libro_id)) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'ID libro non valido',
                    status: 400
                }
            });
        }

        const libro = await Libro.findById(libro_id);
        
        if (!libro) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Libro non trovato',
                    status: 404
                }
            });
        }

        const prestiti = await Prestito.findByLibro(libro_id, stato);

        res.json({
            success: true,
            data: {
                libro: libro,
                prestiti: prestiti
            }
        });
    });

    /**
     * GET /api/prestiti/stats - Ottiene statistiche sui prestiti
     */
    static getPrestitiStats = asyncHandler(async (req, res) => {
        const totalPrestiti = await Prestito.count();
        const prestitiAttivi = await Prestito.count('attivo');
        const prestitiRestituiti = await Prestito.count('restituito');

        // Calcola prestiti scaduti
        const prestitiAttiviList = await Prestito.findAll({ stato: 'attivo', limit: 1000 });
        const prestitiScaduti = prestitiAttiviList.filter(p => p.isScaduto()).length;

        res.json({
            success: true,
            data: {
                total: totalPrestiti,
                attivi: prestitiAttivi,
                restituiti: prestitiRestituiti,
                scaduti: prestitiScaduti,
                percentuale_scaduti: prestitiAttivi > 0 ? Math.round((prestitiScaduti / prestitiAttivi) * 100) : 0
            }
        });
    });
}

module.exports = PrestitiController;
