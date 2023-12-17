const express = require('express');
const { register, login } = require('../models/users');

const router = express.Router();

/**
 * @swagger
 * /auths/register:
 *   post:
 *     summary: Enregistre un nouvel utilisateur
 *     tags: [Utilisateurs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - birthdate
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               birthdate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Utilisateur créé avec succès
 *       400:
 *         description: Données manquantes ou invalides
 *       409:
 *         description: Conflit, l'utilisateur existe déjà
 */
/* Register a user */
router.post('/register', async (req, res) => {
  const username = req?.body?.username?.length !== 0 ? req.body.username : undefined;
  const password = req?.body?.password?.length !== 0 ? req.body.password : undefined;
  const birthdate = req?.body?.birthdate?.length !== 0 ? req.body.birthdate : undefined;

  if (!username || !password || !birthdate) return res.sendStatus(400);

  const authenticatedUser = await register(username, password, birthdate);

  if (!authenticatedUser) return res.sendStatus(409);

  return res.json(authenticatedUser);
});
/* Login a user */
/**
 * @swagger
 * /auths/login:
 *   post:
 *     summary: Connecte un utilisateur
 *     tags: [Utilisateurs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Connexion réussie
 *       400:
 *         description: Données manquantes ou invalides
 *       401:
 *         description: Non autorisé, informations d'identification invalides
 */
router.post('/login', async (req, res) => {
  const username = req?.body?.username?.length !== 0 ? req.body.username : undefined;
  const password = req?.body?.password?.length !== 0 ? req.body.password : undefined;

  if (!username || !password) return res.sendStatus(400); // 400 Bad Reques

  const authenticatedUser = await login(username, password);

  if (!authenticatedUser) return res.sendStatus(401); // 401 Unauthorized

  return res.json(authenticatedUser);
});

module.exports = router;
