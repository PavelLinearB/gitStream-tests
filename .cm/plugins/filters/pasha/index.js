module.exports = (text) => {
const fs = require('fs');
const path = require('path');

const currentDirectory = __dirname;
console.log("PLUGIN!!");
// console.log(process.cwd());
// console.log(currentDirectory);
// fs.readdir(currentDirectory, (err, files) => {
//     if (err) {
//         console.error('Error reading the directory:', err);
//         return "None!" ;
//     }

//     files.forEach(file => {
//         console.log(file);
//     });
// });
  return "YES!" ;
}
