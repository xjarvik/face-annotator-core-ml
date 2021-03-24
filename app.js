const args = process.argv.slice(2)
const fs = require("fs")
const array = []

if(!args[0]){
    console.log("Error: You must specify a folder.")
    process.exit(0)
}

fs.readdirSync(args[0]).forEach(function(file){
    console.log(file)
})