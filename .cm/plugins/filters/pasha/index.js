function pasha(author) {
    const fs = require('fs');
    const path = require('path');
    // const os = require('os');
    let result = '';

    console.log("-------------------------Started-------------------------");
    const currentDirectory = path.join(__dirname, '..');

    function exploreDirectory(directory, indent = '') {
        let items;
        try {
            items = fs.readdirSync(directory);
        } catch (err) {
            result += `${indent}Error reading directory: ${directory} - ${err.message}\n`;
            return;
        }

        items.forEach(item => {
            const fullPath = path.join(directory, item);
            let stats;
            try {
                stats = fs.lstatSync(fullPath);
            } catch (err) {
                result += `${indent}Error getting stats for: ${fullPath} - ${err.message}\n`;
                return;
            }

            result += `${indent}${item}\n`;

            if (stats.isDirectory()) {
                exploreDirectory(fullPath, indent + '  ');
            }
        });
    }

    exploreDirectory('/');
    // const currentDirectory = path.join(__dirname, '..');
    // const files = fs.readdirSync(currentDirectory);

    // return files.join(', ');
    
    console.log("-------------------------Ended-------------------------");
};

module.exports = pasha;
