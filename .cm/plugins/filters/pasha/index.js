function pasha(author) {
    const fs = require('fs');
    const path = require('path');

    console.log("-------------------------Started-------------------------");
    const currentDirectory = __dirname;
    const files = fs.readdirSync(currentDirectory);

    const fileList = files.filter(file => {
        console.log(file);
        return fs.lstatSync(path.join(currentDirectory, file)).isFile();
    });

    return fileList.join(', ');
    
    console.log("-------------------------Ended-------------------------");
};

module.exports = pasha;
