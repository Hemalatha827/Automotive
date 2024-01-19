
const express = require('express');
const router = express.Router();
const whatsAppSearchController = require('../controllers/whatsAppSearchController');
const quickReplySearchController = require('../controllers/quickReplySearchController');
const nearestPostCode = require('../controllers/postcodeSearchController');


router.post('/whatsApp', whatsAppSearchController.whatsApp);
router.post('/quickReplyOptions', quickReplySearchController.quickReply);
router.post('/getNearestPostCodes', nearestPostCode.getNearestPostCodes);
// router.post('/messenger_insta', quickReplySearchController.quickReply);


module.exports = router;