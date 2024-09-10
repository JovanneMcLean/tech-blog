const path = require('path');
const express = require('express');
const session = require('express-session');
const exphbs = require('express-handlebars');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const routes = require('./controllers');
const sequelize = require('./config/connection');
const helpers = require('./utils/helpers');

// Create the Handlebars engine with helpers
const hbs = exphbs.create({ helpers });

// Define the session configuration
const sess = {
    secret: process.env.DB_SECRET || 'default-secret-key', // Use a default key if env variable is not set
    cookie: { maxAge: 1000 * 60 * 30 }, // Set cookie max age to match session expiration
    resave: false,
    saveUninitialized: true,
    store: new SequelizeStore({
        db: sequelize,
        checkExpirationInterval: 1000 * 60 * 10, // Check expiration every 10 minutes
        expiration: 1000 * 60 * 30 // Session expiration after 30 minutes
    })
};

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Set up Handlebars engine and view directory
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// Middleware
app.use(session(sess));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(routes);

// Sync Sequelize models and start the server
sequelize.sync({ force: false }).then(() => {
    app.listen(PORT, () => {
        console.log(`App listening on port ${PORT}!`);
    });
});
