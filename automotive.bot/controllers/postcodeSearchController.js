const postcodeConnector = require('../connections/postcodeConnector');


/*
    Search for cars and trigger whatsApp cards Template
*/
exports.getNearestPostCodes = async (req, res) => {
    const postData = req.body;

    const data = await postcodeConnector.getNearestPostcode(postData.postcode);

    const processedData = extractNearestPostcodes(data);
    const response = {
        "nearest_postcodes": processedData
    }
    res.json(response);
};

function extractNearestPostcodes(data) {


    if (data.status == 200) {
        // Extracting postcode and distance values
        const extractedData = data.result.map(item => {
            const { postcode, distance } = item;
            return { postcode, distance };
        });
        return extractedData;
    } else {
        return [];
    }


}



