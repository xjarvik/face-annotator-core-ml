const tf = require("@tensorflow/tfjs")
const fs = require("fs")
const readline = require("readline")
const array = []
const blazeface = require("@tensorflow-models/blazeface")
const pixels = require("image-pixels")

const askQuestion = function(query){
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })

    return new Promise(resolve => rl.question(query, ans => {
        rl.close()
        resolve(ans)
    }))
}

// Values for concat:
// 0: Ask user if they want to concatenate with existing file. (default)
// 1: Concatenate with existing file.
// 2: Do not concatenate with existing file.
module.exports = async function(path, label, concat){
    if(!path){
        console.log("Error: You must specify a folder.")
        process.exit(0)
    }
    else if(!label){
        console.log("Error: You must specify a label.")
        process.exit(0)
    }
    else if(path.charAt(path.length - 1) != "/"){
        path = path.concat("/")
    }
    
    const dir = await fs.promises.opendir(path)
    var annotatedImages = 0

    console.log("Loading BlazeFace...\n")
    const model = await blazeface.load()

    for await(const dirent of dir){
        const fileName = dirent.name
        if(fileName.endsWith(".jpg") || fileName.endsWith(".png")){
            var obj = {
                image: fileName,
                annotations: []
            }
            const img = fs.readFileSync(path + fileName)
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
                    label: label,
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

    if(fs.existsSync(path + "annotations.json")){
        const createAnnotationFileNr = function(){
            var count = 1
            do{
                count++
            }
            while(fs.existsSync(path + "annotations" + count + ".json"))
            fs.writeFileSync(path + "annotations" + count + ".json", JSON.stringify(array))
        }

        const existing = JSON.parse(fs.readFileSync(path + "annotations.json"))

        if(Array.isArray(existing)){
            if(!concat){
                var answer = ""
                do{
                    answer = await askQuestion("A file named annotations.json already exists in this folder.\nDo you want to append the annotations to this file? (y/n)\nIf you answer no, a new file will be created.\n")
                }
                while(answer != "Y" && answer != "y" && answer != "N" && answer != "n")
                if(answer == "Y" || answer == "y"){
                    fs.writeFileSync(path + "annotations.json", JSON.stringify(existing.concat(array)))
                }
                else{
                    createAnnotationFileNr()
                }
            }
            else if(concat == 1){
                fs.writeFileSync(path + "annotations.json", JSON.stringify(existing.concat(array)))
            }
            else{
                createAnnotationFileNr()
            }
        }
        else{
            createAnnotationFileNr()
        }
    }
    else{
        fs.writeFileSync(path + "annotations.json", JSON.stringify(array))
    }

    console.log("Done.")
}