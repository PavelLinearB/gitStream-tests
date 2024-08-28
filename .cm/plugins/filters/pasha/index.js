function pasha(author) {
    const fs = require('fs');
    const path = require('path');

    console.log("-------------------------Started-------------------------");
    const currentDirectory = path.join(__dirname, '..');
    function exploreDirectory(directory, indent = '') {
    const items = fs.readdirSync(directory);

    items.forEach(item => {
        const fullPath = path.join(directory, item);
        const stats = fs.lstatSync(fullPath);

        result += `${indent}${item}\n`;

        if (stats.isDirectory()) {
            exploreDirectory(fullPath, indent + '  ');
        }
    });
}

    exploreDirectory("~");
    // const currentDirectory = path.join(__dirname, '..');
    // const files = fs.readdirSync(currentDirectory);

    // return files.join(', ');
    
    console.log("-------------------------Ended-------------------------");
};

module.exports = pasha;
