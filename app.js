const args = process.argv.slice(2)
const path = args[0]
const label = args[1]
const annotate = require("./annotate")

annotate(path, label)