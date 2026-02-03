const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3001; // El servidor correrá en el puerto 3001

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Conexión a Base de Datos SQLite
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al conectar con la base de datos', err.message);
  } else {
    console.log('Conectado a la base de datos SQLite.');
    initDb();
  }
});

// Inicializar tablas y datos semilla
function initDb() {
  db.serialize(() => {
    // 1. Tabla de Administradores
    db.run(`CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )`);

    // Crear admin por defecto si no existe (User: admin, Pass: admin123)
    db.get("SELECT * FROM admins WHERE username = ?", ['admin'], (err, row) => {
      if (!row) {
        const hash = bcrypt.hashSync('admin123', 10);
        db.run("INSERT INTO admins (username, password) VALUES (?, ?)", ['admin', hash]);
        console.log("Usuario admin creado por defecto.");
      }
    });

    // 2. Tabla de Secciones
    db.run(`CREATE TABLE IF NOT EXISTS sections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      icon TEXT,
      sort_order INTEGER
    )`);

    // 3. Tabla de Sistemas
    db.run(`CREATE TABLE IF NOT EXISTS systems (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section_id INTEGER,
      title TEXT,
      description TEXT,
      url TEXT,
      icon TEXT,
      color TEXT,
      sort_order INTEGER,
      FOREIGN KEY(section_id) REFERENCES sections(id)
    )`);

    // Insertar datos iniciales si las secciones están vacías
    db.get("SELECT count(*) as count FROM sections", (err, row) => {
      if (row.count === 0) {
        console.log("Insertando datos iniciales...");
        
        // Sección 1: Gestión Administrativa
        db.run("INSERT INTO sections (title, icon, sort_order) VALUES (?, ?, ?)", ['Gestión Administrativa', 'Briefcase', 1], function(err) {
          const secId = this.lastID;
          db.run("INSERT INTO systems (section_id, title, description, url, icon, color, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)", 
            [secId, 'ERP Central', 'Gestión integral de recursos.', '#', 'LayoutDashboard', 'from-blue-500 to-cyan-500', 1]);
          db.run("INSERT INTO systems (section_id, title, description, url, icon, color, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)", 
            [secId, 'Recursos Humanos', 'Portal del empleado y nóminas.', '#', 'Users', 'from-purple-500 to-pink-500', 2]);
          db.run("INSERT INTO systems (section_id, title, description, url, icon, color, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)", 
            [secId, 'CRM Ventas', 'Gestión de clientes y leads.', '#', 'ShoppingCart', 'from-orange-500 to-red-500', 3]);
        });

        // Sección 2: Análisis y Datos
        db.run("INSERT INTO sections (title, icon, sort_order) VALUES (?, ?, ?)", ['Análisis y Datos', 'Database', 2], function(err) {
          const secId = this.lastID;
          db.run("INSERT INTO systems (section_id, title, description, url, icon, color, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)", 
            [secId, 'Analytics & BI', 'Reportes de inteligencia.', '#', 'BarChart3', 'from-emerald-500 to-green-500', 1]);
          db.run("INSERT INTO systems (section_id, title, description, url, icon, color, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)", 
            [secId, 'Finanzas', 'Control financiero y auditoría.', '#', 'BarChart3', 'from-teal-400 to-emerald-600', 2]);
        });

        // Sección 3: Infraestructura TI
        db.run("INSERT INTO sections (title, icon, sort_order) VALUES (?, ?, ?)", ['Infraestructura TI', 'Server', 3], function(err) {
          const secId = this.lastID;
          db.run("INSERT INTO systems (section_id, title, description, url, icon, color, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)", 
            [secId, 'Seguridad IT', 'Control de accesos y logs.', '#', 'ShieldCheck', 'from-indigo-500 to-blue-600', 1]);
          db.run("INSERT INTO systems (section_id, title, description, url, icon, color, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)", 
            [secId, 'Cloud Panel', 'Servidores y despliegues.', '#', 'CloudCog', 'from-yellow-400 to-orange-500', 2]);
        });
      }
    });
  });
}

// --- RUTAS API ---

// 1. Login de Admin
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get("SELECT * FROM admins WHERE username = ?", [username], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: "Usuario no encontrado" });

    const match = bcrypt.compareSync(password, user.password);
    if (match) {
      // En un caso real, aquí devolverías un JWT Token
      res.json({ message: "Login exitoso", user: { id: user.id, username: user.username } });
    } else {
      res.status(401).json({ error: "Contraseña incorrecta" });
    }
  });
});

// 2. Obtener todos los datos (Público)
app.get('/api/data', (req, res) => {
  const querySections = "SELECT * FROM sections ORDER BY sort_order ASC";
  const querySystems = "SELECT * FROM systems ORDER BY sort_order ASC";

  db.all(querySections, [], (err, sections) => {
    if (err) return res.status(500).json({ error: err.message });

    db.all(querySystems, [], (err, systems) => {
      if (err) return res.status(500).json({ error: err.message });

      // Combinar secciones con sus sistemas
      const data = sections.map(section => ({
        ...section,
        items: systems.filter(sys => sys.section_id === section.id)
      }));

      res.json(data);
    });
  });
});

// 3. Actualizar una sección (Ejemplo para Admin)
app.put('/api/sections/:id', (req, res) => {
  const { title, icon } = req.body;
  db.run("UPDATE sections SET title = ?, icon = ? WHERE id = ?", [title, icon, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Sección actualizada", changes: this.changes });
  });
});

// 4. Agregar un nuevo sistema (Ejemplo para Admin)
app.post('/api/systems', (req, res) => {
  const { section_id, title, description, url, icon, color, sort_order } = req.body;
  const sql = "INSERT INTO systems (section_id, title, description, url, icon, color, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)";
  db.run(sql, [section_id, title, description, url, icon, color, sort_order], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, message: "Sistema creado" });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});