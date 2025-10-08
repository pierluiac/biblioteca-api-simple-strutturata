# Biblioteca API Simple - Strutturata

[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-blue.svg)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-3.x-lightblue.svg)](https://sqlite.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

API REST per la gestione di una biblioteca implementata con architettura modulare seguendo le best practices di Node.js/Express.

## 🚀 Caratteristiche

- ✅ **Architettura Modulare**: Separazione delle responsabilità
- ✅ **CRUD Completo**: Operazioni su libri, utenti e prestiti
- ✅ **Validazione Input**: Controlli rigorosi sui dati
- ✅ **Gestione Errori**: Sistema centralizzato di error handling
- ✅ **Database SQLite**: Facile setup e sviluppo locale
- ✅ **Logging**: Tracciamento completo delle operazioni
- ✅ **CORS**: Supporto per richieste cross-origin
- ✅ **Health Check**: Monitoraggio stato applicazione

## 📁 Struttura Progetto

```
src/
├── config/          # Configurazione centralizzata
├── models/          # Modelli con validazione
├── controllers/     # Controller CRUD
├── routes/         # Route separate
├── middleware/      # Middleware modulari
└── server.js        # Server principale
```

## 🛠️ Installazione

```bash
# Clona il repository
git clone https://github.com/pierluiac/biblioteca-api-simple-strutturata.git
cd biblioteca-api-simple-strutturata

# Installa le dipendenze
npm install

# Avvia il server
npm run dev
```

## 📚 API Endpoints

### Generale
- `GET /health` - Health check
- `GET /api` - Informazioni API

### Libri
- `GET /api/libri` - Lista libri
- `GET /api/libri/:id` - Dettaglio libro
- `POST /api/libri` - Crea libro
- `PUT /api/libri/:id` - Aggiorna libro
- `DELETE /api/libri/:id` - Elimina libro

### Utenti
- `GET /api/utenti` - Lista utenti
- `GET /api/utenti/:id` - Dettaglio utente
- `POST /api/utenti` - Crea utente
- `PUT /api/utenti/:id` - Aggiorna utente
- `DELETE /api/utenti/:id` - Elimina utente

### Prestiti
- `GET /api/prestiti` - Lista prestiti
- `POST /api/prestiti` - Crea prestito
- `PUT /api/prestiti/:id/restituisci` - Restituisce prestito
- `GET /api/prestiti/stats` - Statistiche prestiti

## 🧪 Test

```bash
# Health check
curl http://localhost:3000/health

# Lista libri
curl http://localhost:3000/api/libri

# Crea nuovo libro
curl -X POST http://localhost:3000/api/libri \
  -H "Content-Type: application/json" \
  -d '{"titolo":"Test","autore":"Autore","isbn":"1234567890"}'
```

## 📖 Documentazione

Per la documentazione completa, consulta il file `README.md` nella directory del progetto.

## 🤝 Contributi

1. Fork del progetto
2. Crea un branch per la tua feature (`git checkout -b feature/AmazingFeature`)
3. Commit delle modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📄 Licenza

Distribuito sotto licenza MIT. Vedi `LICENSE` per maggiori informazioni.

## 👨‍💻 Autore

**Pier Luigi Iachini** - [@pierluiac](https://github.com/pierluiac)

## 🙏 Ringraziamenti

- Progetto sviluppato per il corso TPSI-5
- Architettura basata su best practices Node.js/Express
- Ispirato ai principi SOLID e design patterns
