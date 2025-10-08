/**
 * Modello Utente
 * Gestisce le operazioni CRUD per gli utenti
 */

const database = require('../config/database');

class Utente {
    constructor(data = {}) {
        this.id = data.id;
        this.nome = data.nome;
        this.cognome = data.cognome;
        this.email = data.email;
        this.telefono = data.telefono;
        this.indirizzo = data.indirizzo;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    /**
     * Trova tutti gli utenti con paginazione
     */
    static async findAll(options = {}) {
        const { limit = 50, offset = 0, search = '' } = options;
        
        let sql = `
            SELECT * FROM utenti 
            WHERE 1=1
        `;
        const params = [];

        if (search) {
            sql += ` AND (nome LIKE ? OR cognome LIKE ? OR email LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        sql += ` ORDER BY cognome, nome LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const utenti = await database.all(sql, params);
        return utenti.map(utente => new Utente(utente));
    }

    /**
     * Trova un utente per ID
     */
    static async findById(id) {
        const sql = 'SELECT * FROM utenti WHERE id = ?';
        const utente = await database.get(sql, [id]);
        return utente ? new Utente(utente) : null;
    }

    /**
     * Trova un utente per email
     */
    static async findByEmail(email) {
        const sql = 'SELECT * FROM utenti WHERE email = ?';
        const utente = await database.get(sql, [email]);
        return utente ? new Utente(utente) : null;
    }

    /**
     * Conta il numero totale di utenti
     */
    static async count(search = '') {
        let sql = 'SELECT COUNT(*) as count FROM utenti WHERE 1=1';
        const params = [];

        if (search) {
            sql += ` AND (nome LIKE ? OR cognome LIKE ? OR email LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        const result = await database.get(sql, params);
        return result.count;
    }

    /**
     * Crea un nuovo utente
     */
    async save() {
        const sql = `
            INSERT INTO utenti (nome, cognome, email, telefono, indirizzo)
            VALUES (?, ?, ?, ?, ?)
        `;
        
        const params = [
            this.nome,
            this.cognome,
            this.email,
            this.telefono,
            this.indirizzo
        ];

        const result = await database.run(sql, params);
        this.id = result.id;
        return this;
    }

    /**
     * Aggiorna un utente esistente
     */
    async update() {
        const sql = `
            UPDATE utenti 
            SET nome = ?, cognome = ?, email = ?, telefono = ?, 
                indirizzo = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        
        const params = [
            this.nome,
            this.cognome,
            this.email,
            this.telefono,
            this.indirizzo,
            this.id
        ];

        await database.run(sql, params);
        return this;
    }

    /**
     * Elimina un utente
     */
    static async delete(id) {
        const sql = 'DELETE FROM utenti WHERE id = ?';
        const result = await database.run(sql, [id]);
        return result.changes > 0;
    }

    /**
     * Valida i dati dell'utente
     */
    validate() {
        const errors = [];

        if (!this.nome || this.nome.trim().length === 0) {
            errors.push('Il nome è obbligatorio');
        }

        if (!this.cognome || this.cognome.trim().length === 0) {
            errors.push('Il cognome è obbligatorio');
        }

        if (!this.email || this.email.trim().length === 0) {
            errors.push('L\'email è obbligatoria');
        } else if (!this.isValidEmail(this.email)) {
            errors.push('L\'email deve essere valida');
        }

        if (this.telefono && !this.isValidPhone(this.telefono)) {
            errors.push('Il telefono deve essere valido');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Valida formato email
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Valida formato telefono
     */
    isValidPhone(phone) {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 7;
    }

    /**
     * Ottiene il nome completo dell'utente
     */
    getFullName() {
        return `${this.nome} ${this.cognome}`;
    }

    /**
     * Converte il modello in oggetto JSON
     */
    toJSON() {
        return {
            id: this.id,
            nome: this.nome,
            cognome: this.cognome,
            email: this.email,
            telefono: this.telefono,
            indirizzo: this.indirizzo,
            nome_completo: this.getFullName(),
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }
}

module.exports = Utente;
