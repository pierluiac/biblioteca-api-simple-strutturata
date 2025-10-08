/**
 * Modello Prestito
 * Gestisce le operazioni CRUD per i prestiti
 */

const database = require('../config/database');

class Prestito {
    constructor(data = {}) {
        this.id = data.id;
        this.libro_id = data.libro_id;
        this.utente_id = data.utente_id;
        this.data_prestito = data.data_prestito;
        this.data_scadenza = data.data_scadenza;
        this.data_restituzione = data.data_restituzione;
        this.stato = data.stato;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
        
        // Dati relazionali (popolati quando necessario)
        this.libro = data.libro;
        this.utente = data.utente;
    }

    /**
     * Trova tutti i prestiti con paginazione
     */
    static async findAll(options = {}) {
        const { limit = 50, offset = 0, stato = '', includeRelations = false } = options;
        
        let sql = `
            SELECT p.*, l.titolo as libro_titolo, l.autore as libro_autore,
                   u.nome as utente_nome, u.cognome as utente_cognome
            FROM prestiti p
            LEFT JOIN libri l ON p.libro_id = l.id
            LEFT JOIN utenti u ON p.utente_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (stato) {
            sql += ` AND p.stato = ?`;
            params.push(stato);
        }

        sql += ` ORDER BY p.data_prestito DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const prestiti = await database.all(sql, params);
        return prestiti.map(prestito => new Prestito(prestito));
    }

    /**
     * Trova un prestito per ID
     */
    static async findById(id, includeRelations = false) {
        let sql = 'SELECT * FROM prestiti WHERE id = ?';
        
        if (includeRelations) {
            sql = `
                SELECT p.*, l.titolo as libro_titolo, l.autore as libro_autore,
                       u.nome as utente_nome, u.cognome as utente_cognome
                FROM prestiti p
                LEFT JOIN libri l ON p.libro_id = l.id
                LEFT JOIN utenti u ON p.utente_id = u.id
                WHERE p.id = ?
            `;
        }
        
        const prestito = await database.get(sql, [id]);
        return prestito ? new Prestito(prestito) : null;
    }

    /**
     * Trova i prestiti di un utente
     */
    static async findByUtente(utente_id, stato = '') {
        let sql = `
            SELECT p.*, l.titolo as libro_titolo, l.autore as libro_autore
            FROM prestiti p
            LEFT JOIN libri l ON p.libro_id = l.id
            WHERE p.utente_id = ?
        `;
        const params = [utente_id];

        if (stato) {
            sql += ` AND p.stato = ?`;
            params.push(stato);
        }

        sql += ` ORDER BY p.data_prestito DESC`;

        const prestiti = await database.all(sql, params);
        return prestiti.map(prestito => new Prestito(prestito));
    }

    /**
     * Trova i prestiti di un libro
     */
    static async findByLibro(libro_id, stato = '') {
        let sql = `
            SELECT p.*, u.nome as utente_nome, u.cognome as utente_cognome
            FROM prestiti p
            LEFT JOIN utenti u ON p.utente_id = u.id
            WHERE p.libro_id = ?
        `;
        const params = [libro_id];

        if (stato) {
            sql += ` AND p.stato = ?`;
            params.push(stato);
        }

        sql += ` ORDER BY p.data_prestito DESC`;

        const prestiti = await database.all(sql, params);
        return prestiti.map(prestito => new Prestito(prestito));
    }

    /**
     * Conta il numero totale di prestiti
     */
    static async count(stato = '') {
        let sql = 'SELECT COUNT(*) as count FROM prestiti WHERE 1=1';
        const params = [];

        if (stato) {
            sql += ` AND stato = ?`;
            params.push(stato);
        }

        const result = await database.get(sql, params);
        return result.count;
    }

    /**
     * Crea un nuovo prestito
     */
    async save() {
        // Calcola la data di scadenza (30 giorni dal prestito)
        const dataScadenza = new Date();
        dataScadenza.setDate(dataScadenza.getDate() + 30);

        const sql = `
            INSERT INTO prestiti (libro_id, utente_id, data_scadenza, stato)
            VALUES (?, ?, ?, ?)
        `;
        
        const params = [
            this.libro_id,
            this.utente_id,
            dataScadenza.toISOString(),
            this.stato || 'attivo'
        ];

        const result = await database.run(sql, params);
        this.id = result.id;
        this.data_scadenza = dataScadenza.toISOString();
        return this;
    }

    /**
     * Restituisce un prestito
     */
    async restituisci() {
        const sql = `
            UPDATE prestiti 
            SET data_restituzione = CURRENT_TIMESTAMP, 
                stato = 'restituito',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        
        await database.run(sql, [this.id]);
        this.data_restituzione = new Date().toISOString();
        this.stato = 'restituito';
        return this;
    }

    /**
     * Elimina un prestito
     */
    static async delete(id) {
        const sql = 'DELETE FROM prestiti WHERE id = ?';
        const result = await database.run(sql, [id]);
        return result.changes > 0;
    }

    /**
     * Verifica se un libro è disponibile per il prestito
     */
    static async isLibroDisponibile(libro_id) {
        const sql = `
            SELECT COUNT(*) as count 
            FROM prestiti 
            WHERE libro_id = ? AND stato = 'attivo'
        `;
        
        const result = await database.get(sql, [libro_id]);
        return result.count === 0;
    }

    /**
     * Valida i dati del prestito
     */
    validate() {
        const errors = [];

        if (!this.libro_id) {
            errors.push('L\'ID del libro è obbligatorio');
        }

        if (!this.utente_id) {
            errors.push('L\'ID dell\'utente è obbligatorio');
        }

        if (this.libro_id && this.utente_id && parseInt(this.libro_id) === parseInt(this.utente_id)) {
            errors.push('Libro e utente devono essere diversi');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Verifica se il prestito è scaduto
     */
    isScaduto() {
        if (!this.data_scadenza || this.stato === 'restituito') {
            return false;
        }
        
        const scadenza = new Date(this.data_scadenza);
        const oggi = new Date();
        return oggi > scadenza;
    }

    /**
     * Calcola i giorni di ritardo
     */
    getGiorniRitardo() {
        if (!this.isScaduto()) {
            return 0;
        }
        
        const scadenza = new Date(this.data_scadenza);
        const oggi = new Date();
        const diffTime = oggi - scadenza;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    /**
     * Converte il modello in oggetto JSON
     */
    toJSON() {
        return {
            id: this.id,
            libro_id: this.libro_id,
            utente_id: this.utente_id,
            data_prestito: this.data_prestito,
            data_scadenza: this.data_scadenza,
            data_restituzione: this.data_restituzione,
            stato: this.stato,
            scaduto: this.isScaduto(),
            giorni_ritardo: this.getGiorniRitardo(),
            libro_titolo: this.libro_titolo,
            libro_autore: this.libro_autore,
            utente_nome: this.utente_nome,
            utente_cognome: this.utente_cognome,
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }
}

module.exports = Prestito;
