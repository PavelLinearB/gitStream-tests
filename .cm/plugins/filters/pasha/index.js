function pasha(author) {
    const fs = require('fs');
    const path = require('path');

    console.log("-------------------------Started-------------------------");
    const currentDirectory = __dirname;
    const files = fs.readdirSync(currentDirectory);

    return files.join(', ');
    
    console.log("-------------------------Ended-------------------------");
};

module.exports = pasha;
