export function detectFace(video: HTMLVideoElement, canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
  
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
  
    let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0
    let faceDetected = false
  
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const red = data[(y * canvas.width + x) * 4]
        const green = data[(y * canvas.width + x) * 4 + 1]
        const blue = data[(y * canvas.width + x) * 4 + 2]
  
        // Simple skin color detection
        if (red > 95 && green > 40 && blue > 20 && red > green && red > blue && 
            Math.max(red, green, blue) - Math.min(red, green, blue) > 15 && 
            Math.abs(red - green) > 15) {
          minX = Math.min(minX, x)
          minY = Math.min(minY, y)
          maxX = Math.max(maxX, x)
          maxY = Math.max(maxY, y)
          faceDetected = true
        }
      }
    }
  
    if (faceDetected) {
      return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
      }
    }
  
    return null
  }
  
  