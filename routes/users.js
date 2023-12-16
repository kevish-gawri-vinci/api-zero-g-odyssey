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

/* GET users listing. */
router.get('/', (req, res) => {
  const users = readAllUsers();
  res.json(users);
});

/* Get all skins with prices */
router.get('/get-skins', (req, res) => {
  const skins = getAllSkins();
  res.json(skins);
});

router.get('/current-skin/:username', (req, res) => {
  const skin = getCurrentSkin(req.params.username);
  res.json(skin);
});

router.get('/get-balance/:username', (req, res) => {
  const balance = getBalance(req.params.username);
  res.json(balance);
});
// eslint-disable-next-line consistent-return
router.post('/update-score', authorize, async (req, res) => {
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

// eslint-disable-next-line consistent-return
router.post('/add-stars', authorize, async (req, res) => {
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

router.get('/classement', (req, res) => {
  const usersleaderboard = parse(jsonDbPath, defaultUsers);
  usersleaderboard.sort((a, b) => b.score - a.score);
  res.json(usersleaderboard.map((user) => ({ username: user.username, score: user.score })));
});

router.post('/unlock-skin', authorize, async (req, res) => {
  const { skinName } = req.body;
  const { username } = req.user;

  const result = await purchaseSkin(username, skinName);
  res.json(result);
});

// eslint-disable-next-line consistent-return
router.get('/check-skin/:username/:skinName', authorize, (req, res) => {
  const { username, skinName } = req.params;

  const skinStatus = checkUserSkin(username, skinName);
  if (skinStatus === null) {
    return res.status(404).json({ message: 'Utilisateur ou skin non trouvé' });
  }

  res.json({ skinName, isUnlocked: skinStatus });
});

router.post('/change-current-skin', authorize, async (req, res) => {
  const { skinNumber } = req.body;
  const { username } = req.user; // Récupéré du token JWT

  const result = await updateCurrentSkin(username, skinNumber);
  res.json(result);
});

module.exports = router;
