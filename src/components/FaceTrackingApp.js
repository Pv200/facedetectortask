'use client'

import { useEffect, useRef, useState } from 'react'
import * as tf from '@tensorflow/tfjs'
import * as blazeface from '@tensorflow-models/blazeface'

const Button = ({ children, ...props }) => (
  <button {...props} className="p-2 bg-blue-500 text-white rounded">
    {children}
  </button>
);

const Card = ({ children, className }) => (
  <div className={`p-4 border rounded ${className}`}>
    {children}
  </div>
);

export default function FaceTrackingApp() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [isRecording, setIsRecording] = useState(false)
  const [model, setModel] = useState(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])

  useEffect(() => {
    const loadModelAndStartVideo = async () => {
      await tf.ready() // Ensure TensorFlow is ready
      const loadedModel = await blazeface.load() // Load the model
      setModel(loadedModel) // Set the model state
      startVideo() // Start the video stream
    }

    loadModelAndStartVideo()

    // Cleanup function to stop video stream when component unmounts
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject
        const tracks = stream.getTracks()
        tracks.forEach((track) => track.stop()) // Stop all media tracks
        videoRef.current.srcObject = null // Nullify video source
      }
    }
  }, [])

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      })
      .catch((err) => console.error('Error starting video:', err))
  }

  const detectFaces = async () => {
    if (model && videoRef.current && canvasRef.current) {
      const predictions = await model.estimateFaces(videoRef.current, false)

      const ctx = canvasRef.current.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

        predictions.forEach((prediction) => {
          const [x1, y1] = prediction.topLeft
          const [x2, y2] = prediction.bottomRight
          const width = x2 - x1
          const height = y2 - y1

          // Draw face rectangle
          ctx.strokeStyle = '#00FF00'
          ctx.lineWidth = 2
          ctx.strokeRect(x1, y1, width, height)

          // Draw landmarks
          ctx.fillStyle = '#FF0000'
          prediction.landmarks.forEach(([x, y]) => {
            ctx.beginPath()
            ctx.arc(x, y, 3, 0, 2 * Math.PI)
            ctx.fill()
          })

          // Add text label
          ctx.font = '16px Arial'
          ctx.fillStyle = '#00FF00'
          ctx.fillText('Face Detected', x1, y1 - 5)
        })
      }
    }
  }

  const handlePlay = () => {
    const detectInterval = setInterval(detectFaces, 100)
    return () => clearInterval(detectInterval)
  }

  const startRecording = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const mediaRecorder = new MediaRecorder(videoRef.current.srcObject)
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }
      mediaRecorder.onstop = saveVideo
      mediaRecorder.start()
      mediaRecorderRef.current = mediaRecorder
      setIsRecording(true)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const saveVideo = () => {
    const blob = new Blob(chunksRef.current, { type: 'video/webm' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = 'face-tracking-video.webm'
    document.body.appendChild(a)
    a.click()
    URL.revokeObjectURL(url)
    chunksRef.current = []
  }

  return (
    <Card className="w-full max-w-3xl p-4 space-y-4">
      <h1 className="text-2xl font-bold text-center">Face Tracking App</h1>
      <div className="relative">
        <video
          ref={videoRef}
          onPlay={handlePlay}
          width="640"
          height="480"
          autoPlay
          muted
          className="rounded-lg shadow-lg"
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0"
          width="640"
          height="480"
        />
      </div>
      <div className="flex justify-center space-x-4">
        <Button onClick={isRecording ? stopRecording : startRecording}>
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </Button>
      </div>
    </Card>
  )
}
