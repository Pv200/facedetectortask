# Create models directory if it doesn't exist
$modelsDir = "public\models"
New-Item -ItemType Directory -Force -Path $modelsDir

# Download tiny face detector model
$urls = @(
    "https://raw.githubusercontent.com/vladmandic/face-api/master/model/tiny_face_detector_model-weights_manifest.json",
    "https://raw.githubusercontent.com/vladmandic/face-api/master/model/tiny_face_detector_model-shard1",
    "https://raw.githubusercontent.com/vladmandic/face-api/master/model/face_landmark_68_model-weights_manifest.json",
    "https://raw.githubusercontent.com/vladmandic/face-api/master/model/face_landmark_68_model-shard1"
)

foreach ($url in $urls) {
    $fileName = Split-Path $url -Leaf
    $outputPath = Join-Path $modelsDir $fileName
    Write-Host "Downloading $fileName..."
    Invoke-WebRequest -Uri $url -OutFile $outputPath
}

Write-Host "All models downloaded successfully!"