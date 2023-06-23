require('dotenv').config();
require('./scapper')();
const express = require('express');
const app = express()
const cors = require('cors');
const { APP_PORT } = process.env
const getCoins = require('./controllers/getCoins-controller');
const notFoundRoute = require('./controllers/notFound-controller');

// init CORS handler
app.use(cors())

// parse JSON content
app.use(express.json())

// init routes
app.use("/api/coins", getCoins)
app.use(notFoundRoute)

// launch the app
app.listen(APP_PORT, () => console.log(`App is running on Port ${APP_PORT}.`))