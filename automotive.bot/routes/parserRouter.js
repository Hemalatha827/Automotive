const express = require('express');
const router = express.Router();
const parseCsvFileController = require('../controllers/parseCsvFileController');


router.post('/csv', parseCsvFileController.parseCsv);


module.exports = router;