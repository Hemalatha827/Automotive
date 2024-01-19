
const GLOBAL = require('../GLOBAL_VARS.json');
const fetch = require('isomorphic-fetch');

exports.sendWhatsAppTemplate = function (data) {
    const url = 'https://graph.facebook.com/' + GLOBAL.WHATSAPP_CONFIG.API_VERSION + '/' + GLOBAL.WHATSAPP_CONFIG.PHONE_NUMBER_ID + '/messages';
    const options = {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + GLOBAL.WHATSAPP_CONFIG.AUTH_TOKEN
        }
    };
    // Attempting some risky operation
    return fetch(url, options)
        .then(response => response.json());

}
