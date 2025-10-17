/**
 * Routes Prestiti
 * Definisce le rotte per le operazioni sui prestiti
 */

const express = require('express');
const router = express.Router();
const PrestitiController = require('../controllers/prestitiController');

/**
 * @route   GET /api/prestiti
 * @desc    Ottiene tutti i prestiti con paginazione
 * @access  Public
 * @query   limit, offset, stato
 */
router.get('/', PrestitiController.getAllPrestiti);

/**
 * @route   GET /api/prestiti/stats
 * @desc    Ottiene statistiche sui prestiti
 * @access  Public
 */
router.get('/stats', PrestitiController.getPrestitiStats);

/**
 * @route   GET /api/prestiti/scaduti
 * @desc    Ottiene i prestiti scaduti
 * @access  Public
 * @query   limit, offset
 */
router.get('/scaduti', PrestitiController.getPrestitiScaduti);

/**
 * @route   GET /api/prestiti/libro/:libro_id
 * @desc    Ottiene i prestiti di un libro specifico
 * @access  Public
 * @params  libro_id (numero)
 * @query   stato (opzionale)
 */
router.get('/libro/:libro_id', PrestitiController.getPrestitiByLibro);

/**
 * @route   GET /api/prestiti/:id
 * @desc    Ottiene un prestito per ID
 * @access  Public
 * @params  id (numero)
 */
router.get('/:id', PrestitiController.getPrestitoById);

/**
 * @route   POST /api/prestiti
 * @desc    Crea un nuovo prestito
 * @access  Public
 * @body    libro_id, utente_id
 */
router.post('/', PrestitiController.createPrestito);

/**
 * @route   PUT /api/prestiti/:id/restituisci
 * @desc    Restituisce un prestito
 * @access  Public
 * @params  id (numero)
 */
router.put('/:id/restituisci', PrestitiController.restituisciPrestito);

/**
 * @route   DELETE /api/prestiti/:id
 * @desc    Elimina un prestito
 * @access  Public
 * @params  id (numero)
 */
router.delete('/:id', PrestitiController.deletePrestito);

module.exports = router;