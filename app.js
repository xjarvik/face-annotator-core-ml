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
    else if(!args[1]){
        console.log("Error: You must specify a label.")
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
            var obj = {
                image: fileName,
                annotations: []
            }
            const img = fs.readFileSync(args[0] + fileName)
            const predictions = await model.estimateFaces(await pixels(img), false)
            if(predictions.length > 0){
                annotatedImages++
                process.stdout.write("\rAnnotated " + annotatedImages + " images...")
            }
            for(let i = 0; i < predictions.length; i++){
                const start = predictions[i].topLeft
                const end = predictions[i].bottomRight
                const size = [end[0] - start[0], end[1] - start[1]]
                obj.annotations.push({
                    label: args[1],
                    coordinates: {
                        x: start[0] + (size[0] / 2),
                        y: start[1] + (size[1] / 2),
                        width: size[0],
                        height: size[1]
                    }
                })
            }
            array.push(obj)
        }
    }

    console.log("\nCreating JSON file...")

    if(fs.existsSync(args[0] + "annotations.json")){
        var count = 1
        do{
            count++
        }
        while(fs.existsSync(args[0] + "annotations" + count + ".json"))
        fs.writeFileSync(args[0] + "annotations" + count + ".json", JSON.stringify(array))
    }
    else{
        fs.writeFileSync(args[0] + "annotations.json", JSON.stringify(array))
    }

    console.log("Done.")
}

app()