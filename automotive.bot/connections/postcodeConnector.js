
const GLOBAL = require('../GLOBAL_VARS.json');
const fetch = require('isomorphic-fetch');

exports.getNearestPostcode = function (postcode) {
    const url = 'https://api.postcodes.io/postcodes/' + postcode + '/nearest?widesearch=5km&limit=50';
    const options = {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    };

    // Attempting some risky operation
    return fetch(url, options)
        .then(response => response.json());

}
