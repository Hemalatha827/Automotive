const GLOBAL = require('../GLOBAL_VARS.json');
const queryBuilderUtils = require('../utilities/zincQueryBuilder');
const whatsAppCardsService = require('../service/search/whatsAppCardsService');
const whatsConnector = require('../connections/whatsAppConnector');


/*
    Search for cars and trigger whatsApp cards Template
*/
exports.whatsApp = async (req, res) => {
    const postData = req.body;

    var PAGE_START = Number(postData.start);
    let sortFields = [];
    postData["data"].forEach(function (e) {
        if (e.query !== '-') {
            sortFields.push(e.query);
        }
    });

    const elasticData = await queryBuilderUtils.getElasticData(PAGE_START, GLOBAL.SEARCH.MAX_WHATSAPP_PAGE_SIZE, postData.data, GLOBAL.SERVER.ZS_INDEX, [], sortFields);
    const data = elasticData.hits.hits;
    let dataTotalCount = Number(elasticData.hits.total.value);

    let response = {};
    try {
        if (dataTotalCount > 0) {
            const templateData = whatsAppCardsService.createSearchWhatsAppGallery(data, postData["user-id"]);

            const whatsAppRes = await whatsConnector.sendWhatsAppTemplate(templateData);

            const carsFound = dataTotalCount - (PAGE_START + GLOBAL.SEARCH.MAX_WHATSAPP_PAGE_SIZE);

            response = {
                "message_status": whatsAppRes.messages[0].message_status,
                "next_page": dataTotalCount > (PAGE_START + GLOBAL.SEARCH.MAX_WHATSAPP_PAGE_SIZE),
                "no_of_cars_found": carsFound
            }
        } else {
            response = {
                "message_status": "no-data-found",
                "next_page": false
            }
        }
    } catch (e) {
        console.log(e)
        response = {
            "message_status": "error",
            "next_page": false
        };
    }

    res.json(response);
};



