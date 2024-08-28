module.exports = (text) => {
const fs = require('fs');
const path = require('path');

const currentDirectory = __dirname;

fs.readdir(currentDirectory, (err, files) => {
    if (err) {
        console.error('Error reading the directory:', err);
        return;
    }

    files.forEach(file => {
        console.log(file);
    });
});
}
