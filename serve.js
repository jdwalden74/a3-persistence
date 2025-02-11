import express from 'express';
import path from 'path';
import { MongoClient } from 'mongodb';
import { fileURLToPath } from 'url';
import noteRouter from './routes/noteRoute.js';




const app = express()
const port = 3000

const MONGO_URI = "mongodb+srv://user:pass@cluster0.icsyi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(MONGO_URI);

let db;
let sessionUser = {username: null}

client.connect()
    .then(() => {
        console.log("Connected to MongoDB");
        db = client.db();
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });

app.use(express.json());


app.use((req, res, next) => {
    req.db = db;
    req.sessionUser = sessionUser.username;
    next();
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "login.html"))
})

app.get('/index', (req, res) => {
f
    if (!req.sessionUser) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, "clipboard.html"));
});

app.use('/notes', noteRouter);

app.post('/login', async (req, res) => {
    const { user, password } = req.body;

    try {
        let existingUser = await db.collection("users").findOne({ username: user });

        if (existingUser === null) {

            const newUser = await db.collection("users").insertOne({ username: user, password: password });
            sessionUser.username = newUser.username;

            return res.status(201).json({ message: "New user saved successfully!", username: newUser.username });
        } else {

            if (password === existingUser.password) {

                sessionUser.username = existingUser.username;
                return res.status(200).json({ message: "User logged in successfully!", username: existingUser.username });
            } else {
                return res.status(401).json({ message: "Invalid password" });
            }
        }
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: error.message });
    }
});

app.get('/session', (req, res) => {
    if (req.sessionUser) {
        res.json({ loggedIn: true, username: req.sessionUser });
    } else {
        res.json({ loggedIn: false });
    }
});

app.use(express.static(__dirname));
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})


