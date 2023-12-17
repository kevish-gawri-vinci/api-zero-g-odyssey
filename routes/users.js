const express = require('express');
const {
  readOneUserFromUsername,
  updateUserData,
  jsonDbPath,
  defaultUsers,
  readAllUsers,
  checkUserSkin,
  updateCurrentSkin,
  purchaseSkin,
  getAllSkins,
  getCurrentSkin,
  getBalance,
  addStars,
} = require('../models/users');
const { authorize } = require('../utils/auths');
const { parse } = require('../utils/json');

const router = express.Router();
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Liste tous les utilisateurs
 *     tags: [Utilisateurs]
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 */
/* GET users listing. */
router.get('/', (req, res) => {
  const users = readAllUsers();
  res.json(users);
});
/**
 * @swagger
 * /users/get-skins:
 *   get:
 *     summary: Récupère tous les skins avec leurs prix
 *     tags: [Skins]
 *     responses:
 *       200:
 *         description: Liste des skins
 */
/* Get all skins with prices */
router.get('/get-skins', (req, res) => {
  const skins = getAllSkins();
  res.json(skins);
});
/**
 * @swagger
 * /users/current-skin/{username}:
 *   get:
 *     summary: Obtient le skin actuel d'un utilisateur
 *     tags: [Skins]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Skin actuel de l'utilisateur
 */
router.get('/current-skin/:username', (req, res) => {
  const skin = getCurrentSkin(req.params.username);
  res.json(skin);
});
/**
 * @swagger
 * /users/get-balance/{username}:
 *   get:
 *     summary: Obtient le solde de l'utilisateur
 *     tags: [Utilisateurs]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Solde de l'utilisateur
 */
router.get('/get-balance/:username', (req, res) => {
  const balance = getBalance(req.params.username);
  res.json(balance);
});
/**
 * @swagger
 * /users/update-score:
 *   patch:
 *     summary: Met à jour le score de l'utilisateur
 *     tags: [Utilisateurs]
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Token d'authentification JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newScore:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Score mis à jour
 *       404:
 *         description: Utilisateur non trouvé
 */
// eslint-disable-next-line consistent-return
router.patch('/update-score', authorize, async (req, res) => {
  const { newScore } = req.body;
  const { username } = req.user; // Récupérer le nom d'utilisateur du middleware 'authorize'

  const user = readOneUserFromUsername(username);
  if (!user) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }

  if (newScore > user.bestscore) {
    user.bestscore = newScore;
    await updateUserData(user);
    res.json({ success: true, message: 'Score mis à jour' });
  } else {
    res.json({ success: false, message: 'Le nouveau score n est pas plus élevé' });
  }
});
/**
 * @swagger
 * /users/add-stars:
 *   patch:
 *     summary: Ajoute des étoiles au solde de l'utilisateur
 *     tags: [Utilisateurs]
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Token d'authentification JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stars:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Étoiles ajoutées au solde
 *       404:
 *         description: Utilisateur non trouvé
 */
// eslint-disable-next-line consistent-return
router.patch('/add-stars', authorize, async (req, res) => {
  const { stars } = req.body;
  const { username } = req.user;
  const user = readOneUserFromUsername(username);
  if (!user) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }
  console.log(stars, 'In router');
  const response = await addStars(username, stars);
  res.json(response);
});
/**
 * @swagger
 * /users/classement:
 *   get:
 *     summary: Affiche le classement des utilisateurs par score
 *     tags: [Utilisateurs]
 *     responses:
 *       200:
 *         description: Classement des utilisateurs
 */
router.get('/classement', (req, res) => {
  const usersleaderboard = parse(jsonDbPath, defaultUsers);
  usersleaderboard.sort((a, b) => b.score - a.score);
  res.json(usersleaderboard.map((user) => ({ username: user.username, score: user.score })));
});
/**
 * @swagger
 * /users/unlock-skin:
 *   patch:
 *     summary: Débloque un skin pour l'utilisateur
 *     tags: [Skins]
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Token d'authentification JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               skinName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Résultat du déblocage du skin
 */
router.patch('/unlock-skin', authorize, async (req, res) => {
  const { skinName } = req.body;
  const { username } = req.user;

  const result = await purchaseSkin(username, skinName);
  res.json(result);
});
/**
 * @swagger
 * /users/check-skin/{username}/{skinName}:
 *   get:
 *     summary: Vérifie si un utilisateur a débloqué un skin spécifique
 *     tags: [Skins]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: skinName
 *         required: true
 *         schema:
 *           type: string
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Token d'authentification JWT
 *     responses:
 *       200:
 *         description: Statut du skin pour l'utilisateur
 *       404:
 *         description: Utilisateur ou skin non trouvé
 */
// eslint-disable-next-line consistent-return
router.get('/check-skin/:username/:skinName', authorize, (req, res) => {
  const { username, skinName } = req.params;

  const skinStatus = checkUserSkin(username, skinName);
  if (skinStatus === null) {
    return res.status(404).json({ message: 'Utilisateur ou skin non trouvé' });
  }

  res.json({ skinName, isUnlocked: skinStatus });
});
/**
 * @swagger
 * /users/change-current-skin:
 *   patch:
 *     summary: Change le skin actuel de l'utilisateur
 *     tags: [Skins]
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Token d'authentification JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               skinNumber:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Skin actuel modifié
 */
router.patch('/change-current-skin', authorize, async (req, res) => {
  const { skinNumber } = req.body;
  const { username } = req.user; // Récupéré du token JWT

  const result = await updateCurrentSkin(username, skinNumber);
  res.json(result);
});

module.exports = router;
