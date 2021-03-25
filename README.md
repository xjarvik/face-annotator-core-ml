# face-annotator-core-ml

A tool that detects faces and automatically annotates the size and coordinates of the bounding box. The tool uses [BlazeFace](https://github.com/tensorflow/tfjs-models/tree/master/blazeface) to detect faces. The generated JSON file conforms to the format required by Core ML object detection, as seen below.
```json
[
  {
    "image": "image1.jpg",
    "annotations": [
      {
        "label": "Anna",
        "coordinates": {
          "x": 120,
          "y": 164,
          "width": 230,
          "height": 119
        }
      },
      {
        "label": "John",
        "coordinates": {
          "x": 230,
          "y": 321,
          "width": 50,
          "height": 50
        }
      }
    ]
  },
  ...
] 
```

# Requirements

- [Node.js](https://nodejs.org)

# Installation & Usage

1. Clone the repo and run `npm install`.
2. Run the app: `node app.js /path/to/images label`. The generated JSON file will be placed in the same folder as your images.
