const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'sterling_secret_chronicle_key_98765';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads folder exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Multer Storage Configuration for Photos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'sibling-' + uniqueSuffix + ext);
    }
});
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const mimeType = allowedTypes.test(file.mimetype);
        const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        if (mimeType && extName) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    }
});

// Database Setup
const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        createTables();
    }
});

// Create tables & Seed default database if empty
function createTables() {
    // Users Table
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    `);

    // Siblings Table
    db.run(`
        CREATE TABLE IF NOT EXISTS siblings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            nickname TEXT NOT NULL,
            birthYear INTEGER NOT NULL,
            birthOrder TEXT NOT NULL,
            age INTEGER NOT NULL,
            zodiac TEXT NOT NULL,
            zodiacIcon TEXT NOT NULL,
            role TEXT NOT NULL,
            category TEXT NOT NULL,
            quote TEXT NOT NULL,
            bio TEXT NOT NULL,
            traits TEXT NOT NULL,       -- JSON string array
            skills TEXT NOT NULL,       -- JSON key-value string
            hobbies TEXT NOT NULL,      -- JSON array of objects
            accentColor TEXT NOT NULL,
            accentColorAlt TEXT NOT NULL,
            accentColorGlow TEXT NOT NULL,
            photo TEXT                  -- Server path (e.g. /uploads/filename.png)
        )
    `, (err) => {
        if (!err) {
            seedSiblingsTable();
        }
    });
}

const defaultSiblings = [
    {
        id: 1,
        name: "Alexander Sterling",
        nickname: "Alex",
        birthYear: 1994,
        birthOrder: "1st Sibling (Eldest)",
        age: 32,
        zodiac: "Aries",
        zodiacIcon: "fa-solid fa-cloud-bolt",
        role: "Principal Architect",
        category: "builders",
        quote: "Structures should stand strong, but their impact should be gentle.",
        bio: "The natural leader of the Sterling twelve. Alexander founded an eco-friendly architectural design firm. He blends sustainable green materials with modern design, striving to create living spaces that feel like they grew naturally from the Earth.",
        traits: ["Visionary", "Organized", "Protective"],
        skills: { "Leadership": 95, "Spatial Design": 90, "Patience": 85 },
        hobbies: [
            { icon: "fa-solid fa-compass", name: "Hiking" },
            { icon: "fa-solid fa-pencil", name: "Sketching" },
            { icon: "fa-solid fa-chess", name: "Chess" }
        ],
        accentColor: "hsl(36, 100%, 55%)",
        accentColorAlt: "hsl(48, 100%, 50%)",
        accentColorGlow: "rgba(245, 158, 11, 0.25)"
    },
    {
        id: 2,
        name: "Beatrice Sterling",
        nickname: "Bea",
        birthYear: 1995,
        birthOrder: "2nd Sibling",
        age: 31,
        zodiac: "Taurus",
        zodiacIcon: "fa-solid fa-moon",
        role: "Astrophysicist & Researcher",
        category: "scholars",
        quote: "We are all made of stardust, looking back at the sky.",
        bio: "Intellectually curious since childhood, Beatrice spends her nights analyzing data from deep space telescopes. She works at a renowned observatory, publishing research on dark matter while tutoring local students in advanced mathematics.",
        traits: ["Analytical", "Grounding", "Quietly Witty"],
        skills: { "Physics & Math": 98, "Data Analysis": 92, "Stargazing": 95 },
        hobbies: [
            { icon: "fa-solid fa-binoculars", name: "Astronomy" },
            { icon: "fa-solid fa-book", name: "Sci-Fi Reading" },
            { icon: "fa-solid fa-leaf", name: "Bonsai Trees" }
        ],
        accentColor: "hsl(200, 95%, 55%)",
        accentColorAlt: "hsl(215, 90%, 50%)",
        accentColorGlow: "rgba(14, 165, 233, 0.25)"
    },
    {
        id: 3,
        name: "Charles Sterling",
        nickname: "Charlie",
        birthYear: 1997,
        birthOrder: "3rd Sibling",
        age: 29,
        zodiac: "Gemini",
        zodiacIcon: "fa-solid fa-masks-theater",
        role: "Classical Violinist & Composer",
        category: "creatives",
        quote: "Music is what feelings sound like when words fail.",
        bio: "The family's musical prodigy. Charles started playing violin at four. Today, he performs with national philharmonic orchestras and composes dramatic soundtracks for independent films in his home studio.",
        traits: ["Expressive", "Charismatic", "Free-Spirited"],
        skills: { "Violin Performance": 96, "Orchestration": 90, "Storytelling": 85 },
        hobbies: [
            { icon: "fa-solid fa-music", name: "Piano Playing" },
            { icon: "fa-solid fa-record-vinyl", name: "Vinyl Collecting" },
            { icon: "fa-solid fa-language", name: "Learning Italian" }
        ],
        accentColor: "hsl(339, 85%, 60%)",
        accentColorAlt: "hsl(320, 80%, 55%)",
        accentColorGlow: "rgba(244, 63, 94, 0.25)"
    },
    {
        id: 4,
        name: "Diana Sterling",
        nickname: "Di",
        birthYear: 1998,
        birthOrder: "4th Sibling",
        age: 28,
        zodiac: "Cancer",
        zodiacIcon: "fa-solid fa-water",
        role: "Travel & Wildlife Photographer",
        category: "adventurers",
        quote: "Capture the wilderness before it becomes just a memory.",
        bio: "A true nomad, Diana has traveled to over 40 countries, photographing endangered species. She spends weeks in rain forests, polar ice fields, and arid deserts, highlighting the beauty of creatures that cannot speak for themselves.",
        traits: ["Fearless", "Empathic", "Observant"],
        skills: { "Photography": 94, "Survival Skills": 88, "Adaptability": 95 },
        hobbies: [
            { icon: "fa-solid fa-campground", name: "Camping" },
            { icon: "fa-solid fa-route", name: "Backpacking" },
            { icon: "fa-solid fa-language", name: "Translation" }
        ],
        accentColor: "hsl(142, 70%, 45%)",
        accentColorAlt: "hsl(160, 60%, 40%)",
        accentColorGlow: "rgba(34, 197, 94, 0.25)"
    },
    {
        id: 5,
        name: "Ethan Sterling",
        nickname: "Eth",
        birthYear: 2000,
        birthOrder: "5th Sibling",
        age: 26,
        zodiac: "Leo",
        zodiacIcon: "fa-solid fa-fire",
        role: "Robotics & Software Engineer",
        category: "builders",
        quote: "If you can write the logic, you can build the reality.",
        bio: "Born at the turn of the millennium, Ethan loves everything tech. He builds automated assistance robots for medical clinics and writes open-source code libraries. He's also the designated family tech support manager.",
        traits: ["Logical", "Ambitious", "Generous"],
        skills: { "Programming (C++/JS)": 95, "Hardware Engineering": 89, "Troubleshooting": 92 },
        hobbies: [
            { icon: "fa-solid fa-microchip", name: "IoT Tinkering" },
            { icon: "fa-solid fa-gamepad", name: "Retro Console Modding" },
            { icon: "fa-solid fa-dumbbell", name: "Weightlifting" }
        ],
        accentColor: "hsl(262, 80%, 65%)",
        accentColorAlt: "hsl(280, 75%, 60%)",
        accentColorGlow: "rgba(138, 75, 241, 0.3)"
    },
    {
        id: 6,
        name: "Fiona Sterling",
        nickname: "Fifi",
        birthYear: 2001,
        birthOrder: "6th Sibling",
        age: 25,
        zodiac: "Virgo",
        zodiacIcon: "fa-solid fa-seedling",
        role: "Botanist & Farm Manager",
        category: "scholars",
        quote: "Nature never rushes, yet everything is accomplished.",
        bio: "Fiona oversees the family's community organic orchard. She conducts research on soil microbiology and organic pest control, sharing her findings through workshops that help local neighborhoods grow their own food.",
        traits: ["Detail-oriented", "Nurturing", "Calm"],
        skills: { "Plant Science": 93, "Soil Biology": 91, "Teaching": 87 },
        hobbies: [
            { icon: "fa-solid fa-mug-hot", name: "Herbal Tea Blending" },
            { icon: "fa-solid fa-brush", name: "Flower Pressing" },
            { icon: "fa-solid fa-cookie-bite", name: "Baking" }
        ],
        accentColor: "hsl(142, 70%, 45%)",
        accentColorAlt: "hsl(120, 60%, 40%)",
        accentColorGlow: "rgba(34, 197, 94, 0.25)"
    },
    {
        id: 7,
        name: "Gabriel Sterling",
        nickname: "Gabe",
        birthYear: 2003,
        birthOrder: "7th Sibling",
        age: 23,
        zodiac: "Libra",
        zodiacIcon: "fa-solid fa-scale-balanced",
        role: "Artisanal Pastry Chef",
        category: "creatives",
        quote: "Good baking requires precision, but cooking is about passion.",
        bio: "Gabriel runs a boutique sourdough bakery and cafe. Trained under French master bakers, he loves creating edible art, serving as the official pastry chef for family reunions and celebrating birthdays.",
        traits: ["Harmonious", "Creative", "Welcoming"],
        skills: { "Pastry Craft": 97, "Sourdough Science": 94, "Customer Relations": 90 },
        hobbies: [
            { icon: "fa-solid fa-mug-saucer", name: "Latte Art" },
            { icon: "fa-solid fa-guitar", name: "Acoustic Guitar" },
            { icon: "fa-solid fa-camera", name: "Food Photography" }
        ],
        accentColor: "hsl(36, 100%, 55%)",
        accentColorAlt: "hsl(20, 95%, 60%)",
        accentColorGlow: "rgba(245, 158, 11, 0.25)"
    },
    {
        id: 8,
        name: "Helena Sterling",
        nickname: "Hel",
        birthYear: 2005,
        birthOrder: "8th Sibling",
        age: 21,
        zodiac: "Scorpio",
        zodiacIcon: "fa-solid fa-spider",
        role: "Olympic Hopeful Swimmer",
        category: "adventurers",
        quote: "Success isn't given; it's earned in the quiet hours of early morning.",
        bio: "A powerhouse of stamina, Helena trains twice a day in the pool. She holds regional records in freestyle and butterfly events and coaches children's swim teams on weekends, promoting youth athletic accessibility.",
        traits: ["Intense", "Disciplined", "Loyal"],
        skills: { "Athletic Endurance": 98, "Swim Technique": 96, "Mentoring": 89 },
        hobbies: [
            { icon: "fa-solid fa-water", name: "Surfing" },
            { icon: "fa-solid fa-headphones", name: "Podcasts" },
            { icon: "fa-solid fa-route", name: "Triathlons" }
        ],
        accentColor: "hsl(200, 95%, 55%)",
        accentColorAlt: "hsl(180, 90%, 45%)",
        accentColorGlow: "rgba(14, 165, 233, 0.25)"
    },
    {
        id: 9,
        name: "Ian Sterling",
        nickname: "Ian",
        birthYear: 2006,
        birthOrder: "9th Sibling",
        age: 20,
        zodiac: "Sagittarius",
        zodiacIcon: "fa-solid fa-arrow-trend-up",
        role: "Novelist & Playwright",
        category: "scholars",
        quote: "Ink is the voice of the soul on paper.",
        bio: "Ian published his first fantasy novel at nineteen. He spends his days writing whimsical screenplays and directing community theater, with a special talent for building vast worlds and dry comedic characters.",
        traits: ["Philosophical", "Imaginative", "Humorous"],
        skills: { "Creative Writing": 94, "Play Direction": 88, "Public Speaking": 85 },
        hobbies: [
            { icon: "fa-solid fa-pen-nib", name: "Calligraphy" },
            { icon: "fa-solid fa-masks-theater", name: "Theater Acting" },
            { icon: "fa-solid fa-scroll", name: "History Research" }
        ],
        accentColor: "hsl(262, 80%, 65%)",
        accentColorAlt: "hsl(240, 75%, 60%)",
        accentColorGlow: "rgba(138, 75, 241, 0.3)"
    },
    {
        id: 10,
        name: "Julia Sterling",
        nickname: "Jules",
        birthYear: 2008,
        birthOrder: "10th Sibling",
        age: 18,
        zodiac: "Capricorn",
        zodiacIcon: "fa-solid fa-mountain",
        role: "Fashion Design Student",
        category: "creatives",
        quote: "Wearable art lets us express who we are without saying a word.",
        bio: "Currently studying apparel design, Julia constructs conceptual collections using recycled materials. Her sustainable garments have been featured in student fashion shows, emphasizing structural symmetry.",
        traits: ["Focused", "Innovative", "Expressive"],
        skills: { "Apparel Drafting": 90, "Textile Dyeing": 85, "Styling": 92 },
        hobbies: [
            { icon: "fa-solid fa-scissors", name: "Sewing" },
            { icon: "fa-solid fa-bag-shopping", name: "Thrifting" },
            { icon: "fa-solid fa-palette", name: "Watercolor Painting" }
        ],
        accentColor: "hsl(339, 85%, 60%)",
        accentColorAlt: "hsl(350, 90%, 55%)",
        accentColorGlow: "rgba(244, 63, 94, 0.25)"
    },
    {
        id: 11,
        name: "Kai Sterling",
        nickname: "Kai",
        birthYear: 2010,
        birthOrder: "11th Sibling (Twin A)",
        age: 16,
        zodiac: "Pisces",
        zodiacIcon: "fa-solid fa-fish",
        role: "High School Student & Esports Player",
        category: "builders",
        quote: "Strategy is everything. React instantly, plan five steps ahead.",
        bio: "The older of the twins. Kai is an academic prodigy who is also a competitive esports team captain. He designs custom maps and mods for strategy games and excels in competitive mathematics.",
        traits: ["Competitive", "Quick-thinking", "Supportive"],
        skills: { "Gaming Reflexes": 96, "Logic Problems": 92, "Team Coordination": 90 },
        hobbies: [
            { icon: "fa-solid fa-gamepad", name: "Competitive Gaming" },
            { icon: "fa-solid fa-keyboard", name: "Speed Typing" },
            { icon: "fa-solid fa-cubes", name: "Rubik's Cubes" }
        ],
        accentColor: "hsl(200, 95%, 55%)",
        accentColorAlt: "hsl(180, 85%, 50%)",
        accentColorGlow: "rgba(14, 165, 233, 0.25)"
    },
    {
        id: 12,
        name: "Luna Sterling",
        nickname: "Luna",
        birthYear: 2010,
        birthOrder: "12th Sibling (Twin B - Youngest)",
        age: 16,
        zodiac: "Pisces",
        zodiacIcon: "fa-solid fa-fish",
        role: "High School Student & Digital Animator",
        category: "creatives",
        quote: "Drawing allows me to bring characters in my mind to life.",
        bio: "The youngest Sterling sibling. Luna creates beautifully expressive 3D character models and short animated videos for her online channel. She often collaborates with her twin Kai, drawing avatars and assets for his game maps.",
        traits: ["Dreamy", "Empathetic", "Humorous"],
        skills: { "3D Character Modeling": 92, "2D/3D Animation": 88, "Digital Illustration": 94 },
        hobbies: [
            { icon: "fa-solid fa-pen-fancy", name: "Digital Drawing" },
            { icon: "fa-solid fa-film", name: "Anime & Animation" },
            { icon: "fa-solid fa-paw", name: "Animal Care" }
        ],
        accentColor: "hsl(262, 80%, 65%)",
        accentColorAlt: "hsl(290, 75%, 60%)",
        accentColorGlow: "rgba(138, 75, 241, 0.3)"
    }
];

function seedSiblingsTable() {
    db.get("SELECT COUNT(*) AS count FROM siblings", (err, row) => {
        if (!err && row.count === 0) {
            console.log("Seeding database with default siblings data...");
            const stmt = db.prepare(`
                INSERT INTO siblings (
                    name, nickname, birthYear, birthOrder, age, zodiac, zodiacIcon,
                    role, category, quote, bio, traits, skills, hobbies,
                    accentColor, accentColorAlt, accentColorGlow, photo
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);

            defaultSiblings.forEach((sib) => {
                stmt.run(
                    sib.name,
                    sib.nickname,
                    sib.birthYear,
                    sib.birthOrder,
                    sib.age,
                    sib.zodiac,
                    sib.zodiacIcon,
                    sib.role,
                    sib.category,
                    sib.quote,
                    sib.bio,
                    JSON.stringify(sib.traits),
                    JSON.stringify(sib.skills),
                    JSON.stringify(sib.hobbies),
                    sib.accentColor,
                    sib.accentColorAlt,
                    sib.accentColorGlow,
                    null // default has no photo, uses initials badge
                );
            });
            stmt.finalize();
            console.log("Database seeded successfully.");
        }
    });
}

// Authentication Middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).json({ error: 'Access token missing' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Token is invalid or expired' });
        req.user = decoded;
        next();
    });
}

// API Routes

// --- Get all siblings ---
app.get('/api/siblings', (req, res) => {
    db.all("SELECT * FROM siblings ORDER BY id ASC", (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        // Map database strings back into JSON formats
        const formatted = rows.map(row => ({
            ...row,
            traits: JSON.parse(row.traits),
            skills: JSON.parse(row.skills),
            hobbies: JSON.parse(row.hobbies)
        }));
        res.json(formatted);
    });
});

// --- Register Admin Account ---
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: 'Username already exists' });
                }
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ message: 'User registered successfully' });
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- Admin Login ---
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }

    db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(400).json({ error: 'Invalid username or password' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid username or password' });

        const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '12h' });
        res.json({ token, username: user.username });
    });
});

// --- Check Auth Status ---
app.get('/api/auth/verify', authenticateToken, (req, res) => {
    res.json({ valid: true, username: req.user.username });
});

// --- Create New Sibling (Admin) ---
app.post('/api/siblings', authenticateToken, upload.single('photo'), (req, res) => {
    try {
        const {
            name, nickname, birthYear, birthOrder, age, zodiac, zodiacIcon,
            role, category, quote, bio, traits, skills, hobbies,
            accentColor, accentColorAlt, accentColorGlow
        } = req.body;

        const photoPath = req.file ? `/uploads/${req.file.filename}` : null;

        const stmt = db.prepare(`
            INSERT INTO siblings (
                name, nickname, birthYear, birthOrder, age, zodiac, zodiacIcon,
                role, category, quote, bio, traits, skills, hobbies,
                accentColor, accentColorAlt, accentColorGlow, photo
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
            name, nickname, parseInt(birthYear), birthOrder, parseInt(age), zodiac, zodiacIcon,
            role, category, quote, bio,
            traits, skills, hobbies, // already serialized JSON strings from front-end FormData
            accentColor, accentColorAlt, accentColorGlow,
            photoPath,
            function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.status(201).json({ id: this.lastID, message: 'Sibling profile added successfully' });
            }
        );
        stmt.finalize();
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- Update Sibling (Admin) ---
app.put('/api/siblings/:id', authenticateToken, upload.single('photo'), (req, res) => {
    const siblingId = req.params.id;

    // Get current sibling to find if there is an existing photo path
    db.get("SELECT photo FROM siblings WHERE id = ?", [siblingId], (err, currentSib) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!currentSib) return res.status(404).json({ error: 'Sibling profile not found' });

        try {
            const {
                name, nickname, birthYear, birthOrder, age, zodiac, zodiacIcon,
                role, category, quote, bio, traits, skills, hobbies,
                accentColor, accentColorAlt, accentColorGlow
            } = req.body;

            let photoPath = currentSib.photo;
            if (req.file) {
                photoPath = `/uploads/${req.file.filename}`;
                // Optional: Delete old image on disk to save space
                if (currentSib.photo) {
                    const oldPath = path.join(__dirname, currentSib.photo);
                    if (fs.existsSync(oldPath)) {
                        fs.unlinkSync(oldPath);
                    }
                }
            }

            db.run(`
                UPDATE siblings SET
                    name = ?, nickname = ?, birthYear = ?, birthOrder = ?, age = ?,
                    zodiac = ?, zodiacIcon = ?, role = ?, category = ?, quote = ?,
                    bio = ?, traits = ?, skills = ?, hobbies = ?,
                    accentColor = ?, accentColorAlt = ?, accentColorGlow = ?, photo = ?
                WHERE id = ?
            `, [
                name, nickname, parseInt(birthYear), birthOrder, parseInt(age),
                zodiac, zodiacIcon, role, category, quote,
                bio, traits, skills, hobbies,
                accentColor, accentColorAlt, accentColorGlow, photoPath,
                siblingId
            ], function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'Sibling profile updated successfully' });
            });

        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });
});

// --- Delete Sibling (Admin) ---
app.delete('/api/siblings/:id', authenticateToken, (req, res) => {
    const siblingId = req.params.id;

    db.get("SELECT photo FROM siblings WHERE id = ?", [siblingId], (err, currentSib) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!currentSib) return res.status(404).json({ error: 'Sibling profile not found' });

        // Delete photo from disk if present
        if (currentSib.photo) {
            const oldPath = path.join(__dirname, currentSib.photo);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        db.run("DELETE FROM siblings WHERE id = ?", [siblingId], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Sibling profile deleted successfully' });
        });
    });
});

// --- Reset API (Admin only) ---
app.post('/api/siblings/reset', authenticateToken, (req, res) => {
    // Delete custom uploaded files
    db.all("SELECT photo FROM siblings WHERE photo IS NOT NULL", (err, rows) => {
        if (!err && rows) {
            rows.forEach(row => {
                const oldPath = path.join(__dirname, row.photo);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            });
        }

        db.serialize(() => {
            db.run("DELETE FROM siblings");
            const stmt = db.prepare(`
                INSERT INTO siblings (
                    id, name, nickname, birthYear, birthOrder, age, zodiac, zodiacIcon,
                    role, category, quote, bio, traits, skills, hobbies,
                    accentColor, accentColorAlt, accentColorGlow, photo
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);

            defaultSiblings.forEach((sib) => {
                stmt.run(
                    sib.id,
                    sib.name,
                    sib.nickname,
                    sib.birthYear,
                    sib.birthOrder,
                    sib.age,
                    sib.zodiac,
                    sib.zodiacIcon,
                    sib.role,
                    sib.category,
                    sib.quote,
                    sib.bio,
                    JSON.stringify(sib.traits),
                    JSON.stringify(sib.skills),
                    JSON.stringify(sib.hobbies),
                    sib.accentColor,
                    sib.accentColorAlt,
                    sib.accentColorGlow,
                    null
                );
            });
            stmt.finalize((err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'All sibling profiles and custom uploads have been reset to defaults.' });
            });
        });
    });
});

// Serve Static Uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve Root Frontend Static Files
app.use(express.static(path.join(__dirname, '.')));

// Fallback for Admin page
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
