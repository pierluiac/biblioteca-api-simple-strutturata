# Biblioteca API - Versione Strutturata

API REST per la gestione di una biblioteca, implementata con architettura modulare seguendo le best practices di Node.js/Express.

## 🏗️ Architettura del Progetto

```
biblioteca-api-simple-strutturata/
├── src/
│   ├── config/
│   │   ├── config.js          # Configurazione centralizzata
│   │   └── database.js       # Gestione database SQLite
│   ├── models/
│   │   ├── Libro.js          # Modello Libro
│   │   ├── Utente.js         # Modello Utente
│   │   └── Prestito.js       # Modello Prestito
│   ├── controllers/
│   │   ├── libriController.js    # Controller per libri
│   │   ├── utentiController.js   # Controller per utenti
│   │   └── prestitiController.js # Controller per prestiti
│   ├── routes/
│   │   ├── mainRoutes.js     # Route principali e health check
│   │   ├── libriRoutes.js     # Route per libri
│   │   ├── utentiRoutes.js    # Route per utenti
│   │   └── prestitiRoutes.js  # Route per prestiti
│   ├── middleware/
│   │   ├── logging.js        # Middleware di logging
│   │   ├── errorHandler.js    # Gestione errori
│   │   └── config.js          # Middleware di configurazione
│   └── server.js             # Server principale
├── tests/                    # Directory per test (futuro)
├── package.json
└── README.md
```

## 🚀 Installazione e Avvio

### Prerequisiti
- Node.js (versione 16+)
- npm (Node Package Manager)

### Setup
```bash
# Clona o naviga nella directory del progetto
cd biblioteca-api-simple-strutturata

# Installa le dipendenze
npm install

# Avvia il server in modalità sviluppo
npm run dev

# Oppure avvia in modalità produzione
npm start
```

## 📚 API Endpoints

### Informazioni API
- `GET /api` - Informazioni sull'API
- `GET /health` - Health check
- `GET /api/status` - Status dettagliato

### Libri
- `GET /api/libri` - Lista libri (con paginazione e ricerca)
- `GET /api/libri/:id` - Dettaglio libro
- `POST /api/libri` - Crea nuovo libro
- `PUT /api/libri/:id` - Aggiorna libro
- `DELETE /api/libri/:id` - Elimina libro
- `GET /api/libri/search?q=query` - Ricerca libri

### Utenti
- `GET /api/utenti` - Lista utenti (con paginazione e ricerca)
- `GET /api/utenti/:id` - Dettaglio utente
- `POST /api/utenti` - Crea nuovo utente
- `PUT /api/utenti/:id` - Aggiorna utente
- `DELETE /api/utenti/:id` - Elimina utente
- `GET /api/utenti/search?q=query` - Ricerca utenti
- `GET /api/utenti/:id/prestiti` - Prestiti di un utente

### Prestiti
- `GET /api/prestiti` - Lista prestiti (con paginazione)
- `GET /api/prestiti/:id` - Dettaglio prestito
- `POST /api/prestiti` - Crea nuovo prestito
- `PUT /api/prestiti/:id/restituisci` - Restituisce prestito
- `DELETE /api/prestiti/:id` - Elimina prestito
- `GET /api/prestiti/stats` - Statistiche prestiti
- `GET /api/prestiti/scaduti` - Prestiti scaduti
- `GET /api/prestiti/libro/:libro_id` - Prestiti di un libro

## 🔧 Caratteristiche Tecniche

### Architettura Modulare
- **Separazione delle responsabilità**: Ogni componente ha un ruolo specifico
- **Modelli**: Gestiscono la logica di business e l'accesso ai dati
- **Controller**: Gestiscono la logica delle richieste HTTP
- **Routes**: Definiscono gli endpoint dell'API
- **Middleware**: Gestiscono aspetti trasversali (logging, errori, sicurezza)

### Gestione Errori
- Gestione centralizzata degli errori
- Logging dettagliato per debugging
- Risposte JSON standardizzate
- Gestione graceful shutdown

### Sicurezza
- Headers di sicurezza configurati
- Validazione input
- Gestione CORS
- Protezione contro attacchi comuni

### Database
- SQLite per semplicità di setup
- Migrazione automatica delle tabelle
- Dati di esempio pre-caricati
- Gestione connessioni ottimizzata

## 🧪 Test dell'API

### Health Check
```bash
curl http://localhost:3000/health
```

### Esempi di utilizzo
```bash
# Ottieni tutti i libri
curl http://localhost:3000/api/libri

# Crea un nuovo libro
curl -X POST http://localhost:3000/api/libri \
  -H "Content-Type: application/json" \
  -d '{"titolo":"Nuovo Libro","autore":"Autore","isbn":"1234567890","anno_pubblicazione":2023,"genere":"Fantasy"}'

# Ottieni statistiche prestiti
curl http://localhost:3000/api/prestiti/stats
```

## 🔄 Differenze dalla Versione Monolitica

### Vantaggi della Versione Strutturata
1. **Manutenibilità**: Codice organizzato in moduli logici
2. **Scalabilità**: Facile aggiungere nuove funzionalità
3. **Testabilità**: Componenti isolati e testabili
4. **Riusabilità**: Modelli e middleware riutilizzabili
5. **Debugging**: Errori più facili da tracciare
6. **Collaborazione**: Team può lavorare su moduli diversi

### Miglioramenti Implementati
- Configurazione centralizzata
- Gestione errori robusta
- Logging strutturato
- Middleware modulari
- Validazione dati
- Gestione graceful shutdown
- Documentazione API integrata

## 📝 Note per gli Sviluppatori

### Aggiungere Nuove Funzionalità
1. Crea il modello in `src/models/`
2. Implementa il controller in `src/controllers/`
3. Definisci le route in `src/routes/`
4. Registra le route in `src/server.js`

### Configurazione
Tutte le configurazioni sono centralizzate in `src/config/config.js` e possono essere sovrascritte tramite variabili d'ambiente.

### Logging
Il sistema di logging è configurato per fornire informazioni dettagliate in sviluppo e informazioni essenziali in produzione.

## 🚀 Prossimi Sviluppi

- [ ] Test unitari e di integrazione
- [ ] Documentazione API con Swagger
- [ ] Autenticazione JWT
- [ ] Rate limiting
- [ ] Caching con Redis
- [ ] Docker containerization
- [ ] CI/CD pipeline
