const fileDownloadUtils = require('../utilities/fileDownloadUtils');

exports.parseCsv = async (req, res) => {
  const postData = req.body;

  try {
    const fileId = fileDownloadUtils.extractFileIdFromUrl(postData["url"]);
    const newUrl = fileDownloadUtils.generateNewUrl(fileId);
    const downloadedFilePath = await fileDownloadUtils.downloadFile(newUrl, "./");

    const data = await new Promise((resolve, reject) => {
      fileDownloadUtils.processCsvFile(downloadedFilePath, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });

    console.log(data);
    res.json(data);

    // Now, delete the CSV file
    await fileDownloadUtils.deleteCsvFile(downloadedFilePath);
  } catch (error) {
    console.error('Error:', error);
    res.json({ "error": error.message || "An error occurred" });
  }
};
