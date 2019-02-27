const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const knex = require('knex');
const knexConfig = require('./knexfile.js');

const db = knex(knexConfig.development);

const server = express();

const secret = 'We apologize for the inconvenience';

server.use(helmet());
server.use(express.json());
server.use(cors());

server.get('/api/users', restricted, (req, res) => {
    db('users')
        .then(users => {
            res.status(200).json({ users })
        })
        .catch()
});

// ******* REGISTER ********
server.post('/api/register', (req, res) => {
    const user = req.body;
    if(user.username && user.password){
        const hash = bcrypt.hashSync(user.password, 10);
        user.password = hash;
        db('users')
            .insert(user)
            .then(id => {
                db('users')
                    .where('id', id[0])
                    .select('id', 'username', 'department')
                    .first()
                    .then(user => {
                        res.status(201).json({ user })
                    })
                    .catch(err => {
                        res.status(500).json({ error: 'Could not retrieve user' })
                    })
            })
            .catch(err => {
                res.status(500).json({ error: 'Could not add user' })
            })
    } else {
        res.status(400).json({ error: 'Username and password required' })
    }
});

// ****** LOGIN *********
function generateToken(user){
    const payload = {
        subject: user.id,
        username: user.username,
    }

    const options = {
        expiresIn: '1d'
    }

    return jwt.sign(payload, secret, options);
}

server.post('/api/login', (req, res) => {
    let { username, password } = req.body;

    db('users')
        .where({ username })
        .first()
        .then(user => {
            if (user && bcrypt.compareSync(password, user.password)) {
              const token = generateToken(user);
              res
                .status(200)
                .json({ message: `Welcome ${user.username}!, have a token...`, token });
            } else {
              res.status(401).json({ message: 'Invalid Credentials' });
            }
          })
          .catch(error => {
            res.status(500).json(error);
          });
});

function restricted(req, res, next) {
    const token = req.headers.authorization;
    token ? 
    jwt.verify(token, secret, (err, decodedToken) => {
        err ?
        res.status(401).json({ error: 'No touchy' })
        : next();
    })
    : res.status(401).json({ you: 'Shall not pass!' })
}

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`));