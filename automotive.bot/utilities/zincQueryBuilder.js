const GLOBAL = require('../GLOBAL_VARS.json');
const zinc = require("../connections/zincConnector");

exports.getElasticCustomAggsDataWithCriteria = function (searchData, aggField, index) {
    const query = queryBuilder(searchData);

    var payload = {
        "size": 0,
        "query": query,
        "aggs": aggField
    };

    const response = zinc.zincSelect(payload, index)

    if (response.getResponseCode() == 200) {
        return JSON.parse(response.getContentText());
    }
}

exports.findAllQrOptions = async function (userQuery) {
    var field = userQuery['agg_field'];
    const type = userQuery['agg_field_type'];
    let aggField = (type === "match_phrase" || type === "term") ? `${field}.keyword` : field;

    var elasticData = await getElasticAggsDataWithCriteria(userQuery.data, aggField, GLOBAL.SERVER.ZS_INDEX);
    var dataArray = elasticData.aggregations.text.buckets;


    var distinctQuickSearchData = [];

    //reverse-map the range values for quick replies
    if (type === "range") {
        const sheet = SpreadsheetApp.getActive().getSheetByName(field);
        const rangeData = sheet.getDataRange().getValues();
        for (let i = 0; i < dataArray.length; i++) {
            distinctQuickSearchData.push(getRangeBasedOnValue(rangeData, dataArray[i].key, "A"));
        }

        //remove duplicates
        distinctQuickSearchData = [...new Set(distinctQuickSearchData)];

        let distinctQuickSearchOrderData = {};
        distinctQuickSearchData.forEach(function (data) {
            distinctQuickSearchOrderData[data] = getRowNumByCellValue(rangeData, data)
        });

        distinctQuickSearchData.sort((a, b) => distinctQuickSearchOrderData[a] - distinctQuickSearchOrderData[b]);

    } else {
        if (type === 'match') {
            distinctQuickSearchData = dataArray.map(obj => obj.key_as_string);
            distinctQuickSearchData.sort()
        } else {
            distinctQuickSearchData = dataArray.map(obj => obj.key);
        }
        //distinctQuickSearchData.sort();
    }

    return distinctQuickSearchData;
}

function getElasticAggsDataWithCriteria(searchData, aggField, index) {
    const query = queryBuilder(searchData);

    var payload = {
        "from": 0,
        "size": 0,
        "query": query,
        "aggs": {
            "text": {
                "terms": {
                    "field": aggField
                }
            }
        }
    };

    return zinc.zincSelect(payload, index);
}

exports.getElasticAggsData = function (aggField, index) {
    var payload = {
        "from": 0,
        "size": 0,
        "aggs": {
            "text": {
                "terms": {
                    "field": aggField
                }
            }
        }
    };

    return zinc.zincSelect(payload, index)

}

exports.insertIntoZs = function (data, index, docId) {
    const response = zinc.zincUpdate(data, index, docId)

    if (response.getResponseCode() == 200) {
        return JSON.parse(response.getContentText());
    }
}

exports.removeDocFromZs = function (index, docId) {
    const response = zinc.zincRemove(index, docId)

    if (response.getResponseCode() == 200) {
        return JSON.parse(response.getContentText());
    }
}


exports.getElasticData = function (start, size, searchData, index, fetchFields, sortFields) {

    const query = queryBuilder(searchData);
    if (fetchFields === undefined || fetchFields === null) {
        fetchFields = [];
    }

    if (sortFields === undefined || sortFields === null) {
        sortFields = ["Id"];
    } else {
        sortFields.push("Id");
    }

    var payload = {
        "from": start,
        "size": size,
        "query": query,
        "_source": fetchFields,
        "sort": sortFields
    };

    return zinc.zincSelect(payload, index);

}


function queryBuilder(searchData) {
    var searchCriteria = [];
    var query = {
        "bool": {
            "must": searchCriteria
        }
    };

    for (const e of searchData) {
        const filter = e["query"];
        const filterType = e["type"];
        const filterValue = e["value"];
        if (filterValue !== "-" && filterValue !== "") {
            searchCriteria.push(buildSubQuery(filter, filterType, filterValue));
        }
    }

    if (searchCriteria.length == 0) {
        var query = {
            "match_all": {}
        }
    }

    return query;
}

function buildPostCodeQuery() {
    var query = {
        "bool": {
            "should": []
        }
    }
}

function buildSubQuery(filter, filterType, filterValue) {
    var subQuery;

    if (filterType == 'range') {
        //Re-map the range values

        var filterRange = getBounds(filterValue, filter);
        const filterVal1 = filterRange['lowerbound'];
        const filterVal2 = filterRange['upperbound'];


        const rValue = {
            "gte": filterVal1,
            "lte": filterVal2
        };

        subQuery = {
            [filter]: rValue
        }
    } else if (filterType == 'term') {
        filter = filter + ".keyword";
        subQuery = {
            [filter]: filterValue
        }
    } else if (filterType == 'match' || filterType == 'match_phrase') {
        subQuery = {
            [filter]: filterValue
        }
    }

    return {
        [filterType]: subQuery
    };
}

function getBounds(inputKey, field) {
    const rangeMapper = {
        "price": [
            { key: "Under £20K", lowerbound: 0, upperbound: 20000 },
            { key: "£20K to £60K", lowerbound: 20000, upperbound: 60000 },
            { key: "£60K to £100K", lowerbound: 60000, upperbound: 100000 },
            { key: "More than £100K", lowerbound: 100000, upperbound: 1000000000 },
            // Add more entries as needed
        ]
    };

    const dataStructure = rangeMapper[field];
    const entry = dataStructure.find(item => item.key === inputKey);

    if (entry) {
        return {
            lowerbound: entry.lowerbound,
            upperbound: entry.upperbound,
        };
    } else {
        return null; // Key not found
    }
}