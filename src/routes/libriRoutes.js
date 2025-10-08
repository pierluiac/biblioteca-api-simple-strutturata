/**
 * Routes Libri
 * Definisce le rotte per le operazioni sui libri
 */

const express = require('express');
const router = express.Router();
const LibriController = require('../controllers/libriController');

/**
 * @route   GET /api/libri
 * @desc    Ottiene tutti i libri con paginazione e ricerca
 * @access  Public
 * @query   limit, offset, search
 */
router.get('/', LibriController.getAllLibri);

/**
 * @route   GET /api/libri/search
 * @desc    Ricerca libri per titolo, autore o genere
 * @access  Public
 * @query   q (query), limit, offset
 */
router.get('/search', LibriController.searchLibri);

/**
 * @route   GET /api/libri/:id
 * @desc    Ottiene un libro per ID
 * @access  Public
 * @params  id (numero)
 */
router.get('/:id', LibriController.getLibroById);

/**
 * @route   POST /api/libri
 * @desc    Crea un nuovo libro
 * @access  Public
 * @body    titolo, autore, isbn, anno_pubblicazione, genere, disponibile
 */
router.post('/', LibriController.createLibro);

/**
 * @route   PUT /api/libri/:id
 * @desc    Aggiorna un libro esistente
 * @access  Public
 * @params  id (numero)
 * @body    titolo, autore, isbn, anno_pubblicazione, genere, disponibile
 */
router.put('/:id', LibriController.updateLibro);

/**
 * @route   DELETE /api/libri/:id
 * @desc    Elimina un libro
 * @access  Public
 * @params  id (numero)
 */
router.delete('/:id', LibriController.deleteLibro);

module.exports = router;
