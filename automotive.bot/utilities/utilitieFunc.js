const GLOBAL = require('../GLOBAL_VARS.json');

module.exports = {

    createCUFActions(...data) {

        const actions = [];

        for (const currentValue of data) {
            const operation = currentValue[0];
            if (operation == GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SEND_FLOW) {
                actions.push({
                    "action": GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SEND_FLOW,
                    "flow_id": currentValue[1]
                });
            } else if (operation == GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.ADD_TAG) {
                actions.push({
                    "action": GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.ADD_TAG,
                    "tag_name": currentValue[1]
                });
            } else if (operation == GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.REMOVE_TAG) {
                actions.push({
                    "action": GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.REMOVE_TAG,
                    "tag_name": currentValue[1]
                });
            } else if (operation == GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF) {
                actions.push({
                    "action": GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF,
                    "field_name": currentValue[1],
                    "value": currentValue[2]
                });
            } else if (operation == GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.REMOVE_CUF) {
                actions.push({
                    "action": GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.REMOVE_CUF,
                    "field_name": currentValue[1]
                });
            }

        }
        return actions;
    },

    calculateTotalIndices(array) {
        if (array.length <= 8) {
            return 1;
        } else {
            return Math.ceil(array.length / 7);
        }
    },

    processArray(array, index) {
        if (array.length <= 8) {
            return array;
        }

        const startIndex = (index - 1) * 7;
        const endIndex = startIndex + 7;

        return array.slice(startIndex, endIndex);
    },


    /**
    * @param {string} title
    * @param {number} flowId
    * @param {string[]} arg
    */
    setFlowIdAndCufInQuickReply(title, flowId, ...arg) {
        let actions = [];
        arg.forEach(function (currentValue) {
            actions.push({
                "action": "set_field_value",
                "field_name": currentValue[0],
                "value": currentValue[1]
            });
        });

        actions.push(
            {
                "action": "send_flow",
                "flow_id": flowId //same flow called again just by updating the pageIndex
            }
        );

        var quickReplies = JSON.stringify({
            "actions": actions
        });

        var quickReply = {
            "content_type": "text",
            "title": title,
            "payload": quickReplies
        };
        return quickReply;
    },


    /**
    * @param {string} title
    * @param {number} flowId
    * @param {string[]} arg
    */
    setFlowIdAndCufInButtons(title, flowId, ...arg) {
        let actions = [];
        arg.forEach(function (currentValue) {
            actions.push({
                "action": "set_field_value",
                "field_name": currentValue[0],
                "value": currentValue[1]
            });
        });

        actions.push(
            {
                "action": "send_flow",
                "flow_id": flowId //same flow called again just by updating the pageIndex
            }
        );

        var buttton = {
            "type": "postback",
            "title": title,
            "payload": JSON.stringify({ "actions": actions })
        };
        return buttton;
    },

    /**
    * @param {string} title
    * @param {number} flowId
    * @param {string[]} arg
    */
    setFlowIdAndTagInButtons(title, flowId, ...arg) {
        let actions = [];
        arg.forEach(function (currentValue) {
            actions.push({
                "action": currentValue[0] == "add" ? "add_tag" : "remove_tag",
                "tag_name": currentValue[1]
            });
        });

        actions.push(
            {
                "action": "send_flow",
                "flow_id": flowId //same flow called again just by updating the pageIndex
            }
        );

        var buttton = {
            "type": "postback",
            "title": title,
            "payload": JSON.stringify({ "actions": actions })
        };
        return buttton;
    },



    createQuickReply(data, title) {
        var actions = {
            "action": []
        };

        data.forEach(function (currentValue) {
            actions.action.push(currentValue);
        });

        var quickReply = {
            "content_type": "text",
            "title": title,
            "payload": JSON.stringify(actions)
        };
        return quickReply;
    },


    getRowDataBasedOnKey(data, searchColumn, searchValue) {
        let targetValue;
        const header = data[0];

        // Iterate over the rows and find the matching value in the search column
        for (let i = 1; i < data.length; i++) {
            if (String(data[i][header.indexOf(searchColumn)]) == String(searchValue)) {
                targetValue = data[i];
                break;
            }
        }

        var targetData = {};
        if (targetValue != null)
            targetValue.forEach((element, index) => {
                targetData[header[index]] = element;
            });

        return targetData;
    },

    getRangeBasedOnValue(data, searchValue, searchType) {

        // Iterate over the rows and find the matching value in the search column
        for (let i = 1; i < data.length; i++) {
            const lowerBound = data[i][1];
            const upperBound = data[i][2];
            const type = data[i][3];

            if (type === searchType) {
                if (lowerBound !== '-' && upperBound !== '-') {
                    if (searchValue >= lowerBound && searchValue <= upperBound) {
                        return data[i][0];
                    }
                } else if (lowerBound === '-') {
                    if (searchValue <= upperBound) {
                        return data[i][0];
                    }
                } else if (upperBound === '-') {
                    if (searchValue >= lowerBound) {
                        return data[i][0];
                    }
                }
            }
        }

    },

    getRowNumByCellValue(values, searchValue) {

        for (let rowIndex = 0; rowIndex < values.length; rowIndex++) {
            const row = values[rowIndex];
            const columnIndex = row.indexOf(searchValue);
            if (columnIndex !== -1) {
                const rowNum = rowIndex + 1; // Adding 1 because row index is 0-based, but row numbers are 1-based in Sheets
                return rowNum; // If you want to use this value further, you can return it from the function
            }
        }

        Logger.log(`'${searchValue}' not found in the sheet.`);
        return null; // If the value is not found, you can return null or any other value indicating that it's not present in the sheet.
    },

    generateUniqueSixDigitID() {
        const timestamp = Date.now().toString(); // Get the current timestamp
        const randomPart = Math.floor(Math.random() * 900000) + 100000; // Random 6-digit number
        const uniqueID = timestamp.slice(-6) + randomPart.toString();
        return uniqueID.slice(0, 6); // Ensure it's exactly 6 digits long
    },

    getCurrentDateInDDMMYYYY() {
        const currentDate = new Date();
        const day = String(currentDate.getDate()).padStart(2, '0');
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const year = currentDate.getFullYear();

        return `${day}.${month}.${year}`;
    },


    getUnixTimestamp30MinutesFromNow() {
        const currentDate = new Date();
        const futureDate = new Date(currentDate.getTime() + 30 * 60 * 1000); // Adding 30 minutes in milliseconds
        const unixTimestamp = Math.floor(futureDate.getTime() / 1000); // Convert to Unix timestamp (seconds)

        return unixTimestamp;
    },

    getUnixTimestamp1HourFromNow() {
        const currentDate = new Date();
        const futureDate = new Date(currentDate.getTime() + 60 * 60 * 1000); // Adding 1 hour in milliseconds
        const unixTimestamp = Math.floor(futureDate.getTime() / 1000); // Convert to Unix timestamp (seconds)

        return unixTimestamp;
    },

    getNext5Months() {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const currentMonth = new Date().getMonth(); // Get the current month (0 - January, 1 - February, etc.)
        const next5Months = [];

        for (let i = 0; i <= 4; i++) {
            const nextMonthIndex = (currentMonth + i) % 12;
            next5Months.push(months[nextMonthIndex]);
        }

        return next5Months;
    },

    removeEmojis(inputString) {
        return inputString.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{1FAB0}-\u{1FABF}\u{2B50}\u{23F3}\u{1F004}-\u{1F0CF}\u{1F170}-\u{1F251}\u{2B05}\u{2194}\u{25AA}\u{2B05}\u{2194}\u{25AA}\u{FE0F}\u{203C}\u{2049}\u{2122}\u{2031}\u{2757}\u{2048}\u{2047}\u{2764}\u{FE0F}\u{27A1}]/ug, '');
    },

    removeCommas(inputString) {
        return inputString.replace(/,/g, ''); // The 'g' flag ensures global replacement for all occurrences of commas.
    },

    truncateString(str, maxLength) {
        str = str.length > maxLength ? str.slice(0, maxLength - 3) + '...' : str;
        return str;
    }
};

