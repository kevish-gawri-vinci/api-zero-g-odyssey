const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
// eslint-disable-next-line import/no-extraneous-dependencies
const swaggerJsDoc = require('swagger-jsdoc');
// eslint-disable-next-line import/no-extraneous-dependencies
const swaggerUi = require('swagger-ui-express');

const usersRouter = require('./routes/users');
const authsRouter = require('./routes/auths');

const app = express();

// Swagger configuration
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Mon API',
      version: '1.0.0',
      description: 'Documentation de mon API',
    },
    servers: [
      { url: 'http://localhost:3000' },
      { url: 'https://kevish-gawri-vinci.github.io/Zero-G-Odyssey' },
      { url: 'https://kevish-gawri-vinci.github.io' },
      { url: 'https://zero-g-odyssey.azurewebsites.net' },
    ],
  },
  apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

app.use(helmet());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const corsOptions = {
  origin: ['http://localhost:8080', 'https://kevish-gawri-vinci.github.io/Zero-G-Odyssey', 'https://kevish-gawri-vinci.github.io'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Use of swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use('/users', usersRouter);
app.use('/auths', authsRouter);

module.exports = app;
