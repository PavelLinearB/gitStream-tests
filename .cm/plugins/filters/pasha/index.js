function pasha(author) {
    const fs = require('fs');
    const path = require('path');

    const currentDirectory = __dirname;
    console.log("-------------------------Started-------------------------");

    fs.readdir(currentDirectory, (err, files) => {
        if (err) {
            console.error('Error reading the directory:', err);
            return;
        }

        files.forEach(file => {
            console.log(file);
        });
    });
    console.log("-------------------------Ended-------------------------");
    return "Hello ${author}!";
};

module.exports = pasha;
