/**
 * Routes Utenti
 * Definisce le rotte per le operazioni sugli utenti
 */

const express = require('express');
const router = express.Router();
const UtentiController = require('../controllers/utentiController');

/**
 * @route   GET /api/utenti
 * @desc    Ottiene tutti gli utenti con paginazione e ricerca
 * @access  Public
 * @query   limit, offset, search
 */
router.get('/', UtentiController.getAllUtenti);

/**
 * @route   GET /api/utenti/search
 * @desc    Ricerca utenti per nome, cognome o email
 * @access  Public
 * @query   q (query), limit, offset
 */
router.get('/search', UtentiController.searchUtenti);

/**
 * @route   GET /api/utenti/:id
 * @desc    Ottiene un utente per ID
 * @access  Public
 * @params  id (numero)
 */
router.get('/:id', UtentiController.getUtenteById);

/**
 * @route   GET /api/utenti/:id/prestiti
 * @desc    Ottiene i prestiti di un utente
 * @access  Public
 * @params  id (numero)
 * @query   stato (opzionale)
 */
router.get('/:id/prestiti', UtentiController.getUtentePrestiti);

/**
 * @route   POST /api/utenti
 * @desc    Crea un nuovo utente
 * @access  Public
 * @body    nome, cognome, email, telefono, indirizzo
 */
router.post('/', UtentiController.createUtente);

/**
 * @route   PUT /api/utenti/:id
 * @desc    Aggiorna un utente esistente
 * @access  Public
 * @params  id (numero)
 * @body    nome, cognome, email, telefono, indirizzo
 */
router.put('/:id', UtentiController.updateUtente);

/**
 * @route   DELETE /api/utenti/:id
 * @desc    Elimina un utente
 * @access  Public
 * @params  id (numero)
 */
router.delete('/:id', UtentiController.deleteUtente);

module.exports = router;
