const express = require('express');
const router = express.Router();
const googleSheetController = require('../controllers/googleSheetController');


router.post('/sheet', googleSheetController.googleSheetAction);

module.exports = router;