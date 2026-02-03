const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const fileUpload = require('express-fileupload');
const sharp = require('sharp');

const app = express();
const PORT = 3001;

// --- LOG DE CONFIRMACIÓN ---
console.log("***************************************************");
console.log("*** SERVIDOR INICIADO CON EXPRESS-FILEUPLOAD ***");
console.log("***************************************************");

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Habilitar subida de archivos
app.use(fileUpload({
    limits: { fileSize: 100 * 1024 * 1024 },
    createParentPath: true,
    abortOnLimit: true,
    debug: true // Activar debug de subida
}));

// --- RUTAS DE CARPETAS ---
const projectRoot = process.cwd();
const publicDir = path.join(projectRoot, 'public');
const backgroundsDir = path.join(publicDir, 'backgrounds');
const systemImagesDir = path.join(publicDir, 'system-images');

if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);
if (!fs.existsSync(backgroundsDir)) fs.mkdirSync(backgroundsDir, { recursive: true });
if (!fs.existsSync(systemImagesDir)) fs.mkdirSync(systemImagesDir, { recursive: true });

app.use('/backgrounds', express.static(backgroundsDir));
app.use('/system-images', express.static(systemImagesDir));

// --- BASE DE DATOS ---
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Error DB:', err.message);
  else {
      console.log('DB Conectada');
      initDb();
  }
});

function initDb() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS admins (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS sections (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, icon TEXT, sort_order INTEGER)`);
    db.run(`CREATE TABLE IF NOT EXISTS systems (id INTEGER PRIMARY KEY AUTOINCREMENT, section_id INTEGER, title TEXT, description TEXT, url TEXT, icon TEXT, color TEXT, sort_order INTEGER, image_filename TEXT, FOREIGN KEY(section_id) REFERENCES sections(id))`);
    
    db.get("SELECT * FROM admins WHERE username = ?", ['admin'], (err, row) => {
        if (!row) {
            const hash = bcrypt.hashSync('admin123', 10);
            db.run("INSERT INTO admins (username, password) VALUES (?, ?)", ['admin', hash]);
        }
    });
  });
}

// --- RUTAS API ---

app.get('/api/backgrounds', (req, res) => {
  fs.readdir(backgroundsDir, (err, files) => {
    if (err) return res.json([]);
    const imageFiles = files.filter(file => /\.(jpg|jpeg|png|webp|gif)$/i.test(file));
    res.json(imageFiles);
  });
});

// SUBIDA DE FONDOS
app.post('/api/backgrounds/upload', (req, res) => {
    console.log("--- INTENTO DE SUBIDA ---");
    
    if (!req.files || Object.keys(req.files).length === 0) {
        console.log("Error: No files found in req.files");
        return res.status(400).json({ error: 'No se subió ningún archivo.' });
    }

    const file = req.files.background;
    console.log("Archivo recibido:", file.name);

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.name) || '.jpg';
    const filename = 'bg-' + uniqueSuffix + ext;
    const uploadPath = path.join(backgroundsDir, filename);

    file.mv(uploadPath, function(err) {
        if (err) {
            console.error("Error al mover:", err);
            return res.status(500).json({ error: err.message });
        }
        console.log("Guardado en:", uploadPath);
        res.json({ message: 'Imagen subida con éxito', filename: filename });
    });
});

app.delete('/api/backgrounds/:filename', (req, res) => {
  const filePath = path.join(backgroundsDir, req.params.filename);
  if (!filePath.startsWith(backgroundsDir)) return res.status(400).json({ error: 'Ruta inválida' });
  fs.unlink(filePath, (err) => {
    if (err) return res.status(500).json({ error: 'Error al eliminar' });
    res.json({ message: 'Eliminado' });
  });
});

app.post('/api/systems/upload-image', async (req, res) => {
    if (!req.files || !req.files.system_image) return res.status(400).json({ error: 'No file' });
    const file = req.files.system_image;
    const filename = `sys-${Date.now()}.png`;
    const outputPath = path.join(systemImagesDir, filename);
    try {
        await sharp(file.data).resize(128, 128, { fit: 'cover' }).png().toFile(outputPath);
        res.json({ message: 'OK', filename: filename });
    } catch (error) {
        console.error("Error sharp:", error);
        res.status(500).json({ error: 'Error procesando imagen' });
    }
});

// --- RESTO DE RUTAS ---
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT * FROM admins WHERE username = ?", [username], (err, user) => {
        if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: "Credenciales inválidas" });
        res.json({ message: "Login OK", user: { id: user.id, username: user.username } });
    });
});

app.get('/api/data', (req, res) => {
    db.all("SELECT * FROM sections ORDER BY sort_order ASC", [], (err, sections) => {
        if (err) return res.status(500).json({ error: err.message });
        db.all("SELECT * FROM systems ORDER BY sort_order ASC", [], (err, systems) => {
            if (err) return res.status(500).json({ error: err.message });
            const data = sections.map(sec => ({ ...sec, items: systems.filter(sys => sys.section_id === sec.id) }));
            res.json(data);
        });
    });
});

app.post('/api/sections', (req, res) => {
    const { title, icon, sort_order } = req.body;
    db.run("INSERT INTO sections (title, icon, sort_order) VALUES (?, ?, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM sections))", [title, icon], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
    });
});
app.put('/api/sections/:id', (req, res) => {
    db.run("UPDATE sections SET title = ?, icon = ? WHERE id = ?", [req.body.title, req.body.icon, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ changes: this.changes });
    });
});
app.delete('/api/sections/:id', (req, res) => {
    db.run("DELETE FROM systems WHERE section_id = ?", [req.params.id], (err) => {
        db.run("DELETE FROM sections WHERE id = ?", [req.params.id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ changes: this.changes });
        });
    });
});

app.post('/api/systems', (req, res) => {
    const { section_id, title, description, url, icon, color, image_filename } = req.body;
    db.run("INSERT INTO systems (section_id, title, description, url, icon, color, image_filename, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, 0)", 
        [section_id, title, description, url, icon, color, image_filename], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
    });
});
app.put('/api/systems/:id', (req, res) => {
    const { title, description, url, icon, color, image_filename } = req.body;
    db.run("UPDATE systems SET title=?, description=?, url=?, icon=?, color=?, image_filename=? WHERE id=?", 
        [title, description, url, icon, color, image_filename, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ changes: this.changes });
    });
});
app.delete('/api/systems/:id', (req, res) => {
    db.run("DELETE FROM systems WHERE id = ?", [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ changes: this.changes });
    });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
});