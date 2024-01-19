const GLOBAL = require('../../GLOBAL_VARS.json');
const utils = require('../../utilities/utilitieFunc');
exports.createSearchWhatsAppGallery = function (data, userId) {
    var cards = [];

    data.forEach((item, index) => {
        const cardBodyDesc = item._source["manufacturer"].trim() + " - " + utils.truncateString(item._source["model"].trim(), 50) + "(" + item._source["fuel_type"] + "-" + item._source["transmission"] + ") | 🏷️" + GLOBAL.SEARCH.CURRENCY_SYMBOL + item._source["price"].toLocaleString(GLOBAL.SEARCH.CURRENCY_LOCAL_DENOMINATION, { style: 'decimal', useGrouping: true, minimumFractionDigits: 0 });
        var card = {
            "card_index": index,
            "components": [
                {
                    "type": "HEADER",
                    "parameters": [
                        {
                            "type": "IMAGE",
                            "image": {
                                "link": item._source["image_url"]
                            }
                        }
                    ]
                },
                {
                    "type": "BODY",
                    "parameters": [
                        {
                            "type": "TEXT",
                            "text": cardBodyDesc
                        }
                    ]
                },
                {
                    "type": "BUTTON",
                    "sub_type": "QUICK_REPLY",
                    "index": "0",
                    "parameters": [
                        {
                            "type": "PAYLOAD",
                            "payload": JSON.stringify({
                                "actions": utils.createCUFActions(
                                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "car_id", item._source["id"]],
                                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "car_manufacturer", item._source["manufacturer"]],
                                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "car_model", item._source["model"]],
                                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "car_description", item._source["derivative"]],
                                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "car_fuel_type", item._source["fuel_type"]],
                                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "car_price", GLOBAL.SEARCH.CURRENCY_SYMBOL + item._source["price"].toLocaleString(GLOBAL.SEARCH.CURRENCY_LOCAL_DENOMINATION, { style: 'decimal', useGrouping: true, minimumFractionDigits: 0 })],
                                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "car_style", item._source["bodystyle"]],
                                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "car_seats", item._source["no_seats"]],
                                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "car_no_of_doors", item._source["no_doors"]],
                                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "car_transmission", item._source["transmission"]],
                                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "car_image", item._source["image_url"]],
                                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "car_mpg", item._source["mpg_combined"]],
                                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "car_range", item._source["range_combined"]],
                                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SEND_FLOW, "1698482616545"]
                                )
                            })

                        }
                    ]
                },
                {
                    "type": "BUTTON",
                    "sub_type": "QUICK_REPLY",
                    "index": "1",
                    "parameters": [
                        {
                            "type": "PAYLOAD",
                            "payload": JSON.stringify({
                                "actions": utils.createCUFActions(
                                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "car_id", item._source["id"]],
                                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "car_manufacturer", item._source["manufacturer"]],
                                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "car_model", item._source["model"]],
                                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "car_fuel_type", item._source["fuel_type"]],
                                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "car_price", item._source["price"]],
                                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SEND_FLOW, "1701020190145"]
                                )
                            })

                        }
                    ]
                }
            ]
        };

        cards.push(card);
    });

    let response = {};
    if (cards) {
        response = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": userId,
            "type": "template",
            "template": {
                "name": "auto_2btn_" + cards.length + "cards_with_var",
                "language": {
                    "code": "en_GB"
                },
                "components": [
                    {
                        "type": "CAROUSEL",
                        "cards": cards
                    }
                ]
            }
        };
    }


    return response;
}