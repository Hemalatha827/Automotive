const GLOBAL = require('../GLOBAL_VARS.json');
const queryBuilderUtils = require('../utilities/zincQueryBuilder');
const utils = require('../utilities/utilitieFunc');


/*
    Search for cars and trigger whatsApp cards Template
*/
exports.quickReply = async (req, res) => {
    const postData = req.body;

    const data = await queryBuilderUtils.findAllQrOptions(postData);

    const totalPages = utils.calculateTotalIndices(data);
    const qrOptions = doPagination(data, postData["pageNo"], totalPages);

    const response = {
        "quick_reply": totalPages == 1 && qrOptions.length == 1 ? qrOptions[0] : qrOptions,
        "total_pages": totalPages,
        "options_count": qrOptions.length
    }
    res.json(response);
};

function doPagination(options, currentPage, totalPages) {

    const NEXT = "More Options⏩";
    const SKIP = "Select All✅";
    const BACK = "↩️Back";
    const RESTART = "🔁Start Again";

    options = utils.processArray(options, currentPage);

    if (currentPage > 1) {
        options.unshift(BACK);
    }
    if (totalPages > currentPage) {
        options.push(NEXT);
    }
    if (currentPage == 1 && options.length > 1) {
        options.unshift(SKIP);
        options.push(RESTART);
    }

    return options;
}



