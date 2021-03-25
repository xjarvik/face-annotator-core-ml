const tf = require("@tensorflow/tfjs")
const args = process.argv.slice(2)
const fs = require("fs")
const array = []
const blazeface = require("@tensorflow-models/blazeface")
const pixels = require("image-pixels")

const app = async function(){
    const model = await blazeface.load()

    if(!args[0]){
        console.log("Error: You must specify a folder.")
        process.exit(0)
    }
    else if(args[0].charAt(args[0].length - 1) != "/"){
        args[0] = args[0].concat("/")
    }
    
    const dir = await fs.promises.opendir(args[0])
    var annotatedImages = 0
    for await(const dirent of dir){
        const fileName = dirent.name
        if(fileName.endsWith(".jpg") || fileName.endsWith(".png")){
            const img = fs.readFileSync(args[0] + fileName)
            const predictions = await model.estimateFaces(await pixels(img), false)
            if(predictions.length > 0){
                annotatedImages++
                process.stdout.write("Annotated " + annotatedImages + " images...\r")
            }
            for(let i = 0; i < predictions.length; i++){
                const start = predictions[i].topLeft
                const end = predictions[i].bottomRight
            }
        }
    }
}

app()