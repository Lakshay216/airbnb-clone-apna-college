if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoose = require('mongoose');

const User = require('./models/user.js');
const expressError = require('./utils/expressError.js');
const listingRoutes = require('./routes/listing-route.js');
const reviewRoutes = require('./routes/review-route.js');
const userRoutes = require('./routes/user-route.js');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

const sessionOptions = {
    secret: process.env.SECRET || 'test-only-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'lax',
    },
};

// Tests use Express's temporary memory store. Other environments use MongoDB.
if (process.env.NODE_ENV !== 'test') {
    if (!process.env.ATLASDB_URL || !process.env.SECRET) {
        throw new Error('ATLASDB_URL and SECRET must be set');
    }

    const store = MongoStore.create({
        mongoUrl: process.env.ATLASDB_URL,
        crypto: { secret: process.env.SECRET },
        touchAfter: 24 * 3600,
    });

    store.on('error', (err) => {
        console.error('Mongo session store error:', err.message);
    });

    sessionOptions.store = store;
}

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.message = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.curruser = req.user;
    next();
});

// These small counters are exposed in Prometheus text format at /metrics.
let requestCount = 0;
let serverErrorCount = 0;

app.use((req, res, next) => {
    requestCount += 1;
    res.on('finish', () => {
        if (res.statusCode >= 500) {
            serverErrorCount += 1;
        }
    });
    next();
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', uptime: Math.floor(process.uptime()) });
});

app.get('/ready', (req, res) => {
    const databaseConnected = mongoose.connection.readyState === 1;
    res.status(databaseConnected ? 200 : 503).json({
        status: databaseConnected ? 'ready' : 'not ready',
        database: databaseConnected ? 'connected' : 'disconnected',
    });
});

app.get('/metrics', (req, res) => {
    const metrics = [
        '# HELP airbnb_http_requests_total Total HTTP requests received.',
        '# TYPE airbnb_http_requests_total counter',
        `airbnb_http_requests_total ${requestCount}`,
        '# HELP airbnb_http_server_errors_total Total HTTP 5xx responses.',
        '# TYPE airbnb_http_server_errors_total counter',
        `airbnb_http_server_errors_total ${serverErrorCount}`,
    ].join('\n');

    res.type('text/plain').send(`${metrics}\n`);
});

app.get('/', (req, res) => {
    res.redirect('/listings');
});

app.use('/listings', listingRoutes);
app.use('/listings/:id/reviews', reviewRoutes);
app.use('/', userRoutes);

app.all('*', (req, res, next) => {
    next(new expressError(404, 'PAGE NOT FOUND!'));
});

app.use((err, req, res, next) => {
    const { status = 500, message = 'Something went wrong!!' } = err;
    if (status >= 500) {
        console.error(err);
    }
    const showStack = process.env.NODE_ENV === 'development';
    res.status(status).render('listings/error.ejs', { message, err, showStack });
});

module.exports = app;
