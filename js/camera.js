class CameraHandler {
    constructor() {
        this.stream = null;
        this.videoElement = null;
        this.canvasElement = null;
        this.modalElement = null;
        this.setupCameraModal();
    }

    setupCameraModal() {
        // Create modal elements
        this.modalElement = document.createElement('div');
        this.modalElement.className = 'camera-modal';
        this.modalElement.style.cssText = `
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            z-index: 1000;
            justify-content: center;
            align-items: center;
            flex-direction: column;
        `;

        // Create video element
        this.videoElement = document.createElement('video');
        this.videoElement.style.cssText = `
            max-width: 100%;
            max-height: 70vh;
            margin-bottom: 20px;
        `;
        this.videoElement.autoplay = true;
        this.videoElement.playsInline = true;

        // Create canvas (hidden, used for capturing)
        this.canvasElement = document.createElement('canvas');
        this.canvasElement.style.display = 'none';

        // Create capture button
        const captureButton = document.createElement('button');
        captureButton.textContent = 'Take Photo';
        captureButton.className = 'camera-capture-btn';
        captureButton.style.cssText = `
            padding: 10px 20px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin: 10px;
            font-size: 16px;
        `;

        // Create close button
        const closeButton = document.createElement('button');
        closeButton.textContent = '×';
        closeButton.className = 'camera-close-btn';
        closeButton.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            background: none;
            border: none;
            color: white;
            font-size: 30px;
            cursor: pointer;
        `;

        // Add elements to modal
        this.modalElement.appendChild(this.videoElement);
        this.modalElement.appendChild(this.canvasElement);
        this.modalElement.appendChild(captureButton);
        this.modalElement.appendChild(closeButton);
        document.body.appendChild(this.modalElement);

        // Event listeners
        captureButton.addEventListener('click', () => this.capturePhoto());
        closeButton.addEventListener('click', () => this.closeCamera());
    }

    async startCamera() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: false
            });
            this.videoElement.srcObject = this.stream;
            this.modalElement.style.display = 'flex';
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('Error accessing camera. Please make sure you have given camera permissions and try again.');
        }
    }

    capturePhoto() {
        // Set canvas dimensions to match video
        this.canvasElement.width = this.videoElement.videoWidth;
        this.canvasElement.height = this.videoElement.videoHeight;
        
        // Draw video frame to canvas
        const context = this.canvasElement.getContext('2d');
        context.drawImage(this.videoElement, 0, 0, this.canvasElement.width, this.canvasElement.height);
        
        // Convert to blob and create file
        this.canvasElement.toBlob((blob) => {
            const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
            
            // Trigger the upload handler
            if (window.handleUpload) {
                window.handleUpload(file);
            }
            
            // Close camera
            this.closeCamera();
        }, 'image/jpeg');
    }

    closeCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        this.modalElement.style.display = 'none';
    }
}

// Add some CSS to the page
const style = document.createElement('style');
style.textContent = `
    .camera-modal button:hover {
        opacity: 0.9;
    }
    .camera-capture-btn:active {
        transform: scale(0.98);
    }
`;
document.head.appendChild(style);
