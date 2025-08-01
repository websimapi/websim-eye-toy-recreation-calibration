import { Pose } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('overlay');
const canvasCtx = canvasElement.getContext('2d');
const startButton = document.getElementById('startButton');
const uiOverlay = document.getElementById('ui-overlay');

let camera = null;
let pose = null;

// Configure pose detection
pose = new Pose({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`;
    }
});

pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    smoothSegmentation: false,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

pose.onResults(onResults);

function onResults(results) {
    // Resize canvas to match video
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
    
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    
    // Draw pose landmarks
    if (results.poseLandmarks) {
        drawConnectors(canvasCtx, results.poseLandmarks, [
            [11, 12], [12, 14], [14, 16], [16, 18], [18, 20], [20, 22], [18, 22],
            [11, 13], [13, 15], [15, 17], [17, 19], [19, 21], [17, 21],
            [11, 23], [12, 24], [23, 24], [23, 25], [24, 26], [25, 27], [26, 28],
            [27, 29], [28, 30], [29, 31], [30, 32]
        ], { color: '#00FF88', lineWidth: 4 });
        
        drawLandmarks(canvasCtx, results.poseLandmarks, {
            color: '#FF006E',
            lineWidth: 2,
            radius: 6
        });
    }
    
    canvasCtx.restore();
}

async function startCamera() {
    if (!camera) {
        camera = new Camera(videoElement, {
            onFrame: async () => {
                await pose.send({ image: videoElement });
            },
            width: 1280,
            height: 720
        });
    }
    
    try {
        await camera.start();
        videoElement.style.display = 'block';
    } catch (error) {
        console.error('Error accessing camera:', error);
        alert('Please allow camera access to use Eye Toy.');
    }
}

function startCalibration() {
    uiOverlay.classList.add('hidden');
    startCamera();
}

// Event listeners
startButton.addEventListener('click', startCalibration);

// Handle window resize
function handleResize() {
    canvasElement.style.width = '100%';
    canvasElement.style.height = '100%';
}

window.addEventListener('resize', handleResize);
handleResize();

// Check for camera permissions on load
navigator.mediaDevices.getUserMedia({ video: true })
    .then(() => {
        console.log('Camera access granted');
    })
    .catch((err) => {
        console.error('Camera access denied:', err);
        alert('Camera access is required for Eye Toy functionality.');
    });

