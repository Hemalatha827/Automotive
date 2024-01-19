const GLOBAL = require('../GLOBAL_VARS.json');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

module.exports = {
  extractFileIdFromUrl(originalUrl) {
    const urlObject = new URL(originalUrl);
    return urlObject.pathname.split('/')[3];
  },

  generateNewUrl(fileId) {
    return GLOBAL.GOOGLE_DRIVE_DOWNLOAD_URL + fileId;
  },

  async downloadFile(url, destination) {
    try {
      const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
      });

      const fileName = this.getFileNameFromHeaders(response.headers);
      const sanitizedFileName = this.sanitizeFileName(fileName);
      const filePath = path.join(destination, sanitizedFileName);

      await this.pipeResponseToFile(response, filePath);

      console.log('File downloaded successfully:', filePath);
      return filePath;
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  },

  getFileNameFromHeaders(headers) {
    const dispositionHeader = headers['content-disposition'];

    if (dispositionHeader) {
      const matches = dispositionHeader.match(/filename\*=UTF-8''([^;\r\n]+)/);

      if (matches && matches[1]) {
        return matches[1];
      }
    }

    return 'downloaded-file';
  },

  sanitizeFileName(fileName) {
    return fileName.replace(/[^a-zA-Z0-9.]/g, '_');
  },

  async pipeResponseToFile(response, filePath) {
    return new Promise((resolve, reject) => {
      const fileStream = fs.createWriteStream(filePath);
      response.data.pipe(fileStream);
      fileStream.on('finish', resolve);
      fileStream.on('error', reject);
    });
  },

  processCsvFile(csvFilePath, callback) {
    const jsonData = [];

    if (fs.existsSync(csvFilePath)) {
      const existingContent = fs.readFileSync(csvFilePath, 'utf-8');
      const contentWithHeader = 'Name,PhoneNumber\n' + existingContent;
      fs.writeFileSync(csvFilePath, contentWithHeader, 'utf-8');
    }

    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        jsonData.push({ Name: row.Name, PhoneNumber: row.PhoneNumber });
      })
      .on('end', () => {
        callback(null, jsonData);
      })
      .on('error', (error) => {
        callback(error, null);
      });
  },

  async deleteCsvFile(csvFilePath, callback) {
    fs.unlink(csvFilePath, (deleteError) => {
      if (deleteError) {
        console.error('Error deleting CSV file:', deleteError);
        if (callback) {
          callback(deleteError, null);
        }
      } else {
        console.log('CSV file deleted successfully.');
        if (callback) {
          callback(null);
        }
      }
    });
  },

  

  async main() {
    const originalUrl = 'https://drive.google.com/file/d/1fB4AhLAGkU_DaZFixWe8-b6g00bYuur5/view?usp=sharing';
    const fileId = this.extractFileIdFromUrl(originalUrl);
    const newUrl = this.generateNewUrl(fileId);

    console.log("The URL is: " + newUrl);

    const fileUrl = newUrl;
    const destinationFolder = './';

    try {
      const downloadedFilePath = await this.downloadFile(fileUrl, destinationFolder);
      console.log('Stored file path:', downloadedFilePath);

      await this.processCsvFile(downloadedFilePath, (error, jsonData) => {
        if (error) {
          console.error('Error processing CSV file:', error);
        } else {
          console.log('CSV file processed successfully:', jsonData);
        }
      });
    } catch (error) {
      console.error('Error:', error);
    }
  }
};

// Uncomment the line below to run the `main` function
// module.exports.main();
