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
        
        // Campi JOIN dal database
        this.libro_titolo = data.libro_titolo;
        this.libro_autore = data.libro_autore;
        this.utente_nome = data.utente_nome;
        this.utente_cognome = data.utente_cognome;
    }

    /**
     * Trova tutti i prestiti con paginazione
     */
    static async findAll(options = {}) {
        const { limit = 50, offset = 0, stato = '', search = '', includeRelations = false } = options;
        
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

        if (search) {
            sql += ` AND (l.titolo LIKE ? OR l.autore LIKE ? OR u.nome LIKE ? OR u.cognome LIKE ?)`;
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
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
    static async count(stato = '', search = '') {
        let sql = `
            SELECT COUNT(*) as count 
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

        if (search) {
            sql += ` AND (l.titolo LIKE ? OR l.autore LIKE ? OR u.nome LIKE ? OR u.cognome LIKE ?)`;
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
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
        // Prima ottieni il libro_id del prestito da eliminare
        const prestito = await database.get('SELECT libro_id FROM prestiti WHERE id = ?', [id]);
        
        if (!prestito) {
            return false;
        }
        
        // Elimina il prestito
        const sql = 'DELETE FROM prestiti WHERE id = ?';
        const result = await database.run(sql, [id]);
        
        if (result.changes > 0) {
            // Aggiorna lo stato del libro a disponibile
            await database.run('UPDATE libri SET disponibile = 1 WHERE id = ?', [prestito.libro_id]);
        }
        
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

        // RIMOSSO: La validazione che impediva stesso ID libro/utente era ERRATA
        // Un libro con ID 2 può essere prestato a un utente con ID 2 senza problemi
        // La validazione corretta dovrebbe controllare se il libro è già prestato allo stesso utente

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
