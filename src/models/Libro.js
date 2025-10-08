/**
 * Modello Libro
 * Gestisce le operazioni CRUD per i libri
 */

const database = require('../config/database');

class Libro {
    constructor(data = {}) {
        this.id = data.id;
        this.titolo = data.titolo;
        this.autore = data.autore;
        this.isbn = data.isbn;
        this.anno_pubblicazione = data.anno_pubblicazione;
        this.genere = data.genere;
        this.disponibile = data.disponibile;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    /**
     * Trova tutti i libri con paginazione
     */
    static async findAll(options = {}) {
        const { limit = 50, offset = 0, search = '' } = options;
        
        let sql = `
            SELECT * FROM libri 
            WHERE 1=1
        `;
        const params = [];

        if (search) {
            sql += ` AND (titolo LIKE ? OR autore LIKE ? OR genere LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        sql += ` ORDER BY titolo LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const libri = await database.all(sql, params);
        return libri.map(libro => new Libro(libro));
    }

    /**
     * Trova un libro per ID
     */
    static async findById(id) {
        const sql = 'SELECT * FROM libri WHERE id = ?';
        const libro = await database.get(sql, [id]);
        return libro ? new Libro(libro) : null;
    }

    /**
     * Trova un libro per ISBN
     */
    static async findByIsbn(isbn) {
        const sql = 'SELECT * FROM libri WHERE isbn = ?';
        const libro = await database.get(sql, [isbn]);
        return libro ? new Libro(libro) : null;
    }

    /**
     * Conta il numero totale di libri
     */
    static async count(search = '') {
        let sql = 'SELECT COUNT(*) as count FROM libri WHERE 1=1';
        const params = [];

        if (search) {
            sql += ` AND (titolo LIKE ? OR autore LIKE ? OR genere LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        const result = await database.get(sql, params);
        return result.count;
    }

    /**
     * Crea un nuovo libro
     */
    async save() {
        const sql = `
            INSERT INTO libri (titolo, autore, isbn, anno_pubblicazione, genere, disponibile)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        const params = [
            this.titolo,
            this.autore,
            this.isbn,
            this.anno_pubblicazione,
            this.genere,
            this.disponibile !== undefined ? this.disponibile : 1
        ];

        const result = await database.run(sql, params);
        this.id = result.id;
        return this;
    }

    /**
     * Aggiorna un libro esistente
     */
    async update() {
        const sql = `
            UPDATE libri 
            SET titolo = ?, autore = ?, isbn = ?, anno_pubblicazione = ?, 
                genere = ?, disponibile = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        
        const params = [
            this.titolo,
            this.autore,
            this.isbn,
            this.anno_pubblicazione,
            this.genere,
            this.disponibile,
            this.id
        ];

        await database.run(sql, params);
        return this;
    }

    /**
     * Elimina un libro
     */
    static async delete(id) {
        const sql = 'DELETE FROM libri WHERE id = ?';
        const result = await database.run(sql, [id]);
        return result.changes > 0;
    }

    /**
     * Valida i dati del libro
     */
    validate() {
        const errors = [];

        if (!this.titolo || this.titolo.trim().length === 0) {
            errors.push('Il titolo è obbligatorio');
        }

        if (!this.autore || this.autore.trim().length === 0) {
            errors.push('L\'autore è obbligatorio');
        }

        if (!this.isbn || this.isbn.trim().length === 0) {
            errors.push('L\'ISBN è obbligatorio');
        }

        if (this.anno_pubblicazione && (this.anno_pubblicazione < 1000 || this.anno_pubblicazione > new Date().getFullYear())) {
            errors.push('L\'anno di pubblicazione deve essere valido');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Converte il modello in oggetto JSON
     */
    toJSON() {
        return {
            id: this.id,
            titolo: this.titolo,
            autore: this.autore,
            isbn: this.isbn,
            anno_pubblicazione: this.anno_pubblicazione,
            genere: this.genere,
            disponibile: this.disponibile,
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }
}

module.exports = Libro;
