// Initialize AOS
document.addEventListener('DOMContentLoaded', () => {
    AOS.init({
        duration: 1000,
        once: true,
        offset: 100
    });
    initializeTheme();
    initializeNavigation();
    initializeFloatingLeaves();
    initializePlantRecognition();
});

// Theme Management
function initializeTheme() {
    const themeToggle = document.querySelector('.theme-toggle');
    const body = document.body;
    const icon = themeToggle.querySelector('i');
    
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        icon.classList.toggle('fa-moon');
        icon.classList.toggle('fa-sun');
    });
}

// Navigation
function initializeNavigation() {
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.style.background = 'var(--background-color)';
            navbar.style.boxShadow = '0 2px 10px var(--shadow-color)';
        } else {
            navbar.style.background = 'solid';
            navbar.style.boxShadow = 'none';
        }
    });

    // Active link highlighting
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

// Floating Leaves Animation
function initializeFloatingLeaves() {
    const container = document.querySelector('.floating-leaves');
    const leafCount = 20;
    
    for (let i = 0; i < leafCount; i++) {
        createLeaf(container);
    }
}

function createLeaf(container) {
    const leaf = document.createElement('i');
    leaf.className = 'fas fa-leaf';
    leaf.style.left = Math.random() * 100 + 'vw';
    leaf.style.animationDuration = (Math.random() * 3 + 2) + 's';
    leaf.style.opacity = Math.random() * 0.3;
    leaf.style.fontSize = (Math.random() * 10 + 5) + 'px';
    container.appendChild(leaf);
}

// Plant Recognition
function initializePlantRecognition() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const previewImage = document.getElementById('previewImage');
    const uploadPrompt = document.getElementById('uploadPrompt');
    const progressMessage = document.getElementById('progressMessage');
    const errorMessage = document.getElementById('errorMessage');
    const plantInfo = document.getElementById('plantInfo');

    if (!dropZone || !fileInput) return;

    // Event Listeners
    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);

    // Handle file selection
    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) handleFile(file);
    }

    // Handle drag and drop
    function handleDragOver(event) {
        event.preventDefault();
        dropZone.classList.add('dragging');
    }

    function handleDragLeave(event) {
        event.preventDefault();
        dropZone.classList.remove('dragging');
    }

    function handleDrop(event) {
        event.preventDefault();
        dropZone.classList.remove('dragging');
        
        const file = event.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleFile(file);
        }
    }

    // Process the uploaded file
    function handleFile(file) {
        // Show preview
        const reader = new FileReader();
        reader.onloadend = () => {
            previewImage.src = reader.result;
            previewImage.hidden = false;
            uploadPrompt.hidden = true;
        };
        reader.readAsDataURL(file);

        // Start identification process
        identifyPlant(file);
    }

    // Plant identification function
    async function identifyPlant(file) {
        setLoading(true);
        clearError();
        hidePlantInfo();

        try {
            const base64String = await fileToBase64(file);
            updateProgress('Initializing plant identification...');
            
            const API_KEY = "AIzaSyCa9niqHzPT1_c1aUGjjRGqPCFMl-1h5tQ";
            const API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent";
            
            updateProgress('Analyzing image...');

            const response = await fetch(`${API_URL}?key=${API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: generatePrompt() },
                            {
                                inlineData: {
                                    mimeType: "image/jpeg",
                                    data: base64String.split(',')[1]
                                }
                            }
                        ]
                    }]
                })
            });

            if (!response.ok) {
                throw new Error('Failed to identify plant. Please try again.');
            }

            const data = await response.json();
            if (!data.candidates?.[0]?.content?.parts) {
                throw new Error('Invalid response from plant identification service');
            }

            const result = data.candidates[0].content.parts[0].text;
            const jsonMatch = result.match(/\{[\s\S]*\}/);
            
            if (!jsonMatch) {
                throw new Error('Please, Add correct image of plant');
            }
            
            const plantData = JSON.parse(jsonMatch[0]);
            displayPlantInfo(plantData);
        } catch (error) {
            console.error('Error:', error);
            showError(error.message || 'Failed to identify plant. Please try again.');
        } finally {
            setLoading(false);
            updateProgress('');
        }
    }

    // Helper functions
    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    function setLoading(isLoading) {
        dropZone.style.opacity = isLoading ? '0.5' : '1';
        dropZone.style.pointerEvents = isLoading ? 'none' : 'auto';
    }

    function updateProgress(message) {
        progressMessage.textContent = message;
        progressMessage.hidden = !message;
    }

    function showError(message) {
        errorMessage.querySelector('p').textContent = message;
        errorMessage.hidden = false;
    }

    function clearError() {
        errorMessage.hidden = true;
    }

    function hidePlantInfo() {
        plantInfo.hidden = true;
    }

    function displayPlantInfo(info) {
        const usesHtml = Object.entries(info.uses)
            .map(([key, value]) => `
                <div class="use-item">
                    <h4>${key.charAt(0).toUpperCase() + key.slice(1)}</h4>
                    <p>${value}</p>
                </div>
            `).join('');

        const harmfulEffectsHtml = Object.entries(info.harmful_effects)
            .map(([key, value]) => `
                <div class="harmful-effect-item">
                    <h4>${key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</h4>
                    <p>${value}</p>
                </div>
            `).join('');

        plantInfo.innerHTML = `
            <div class="plant-info-header">
                <h2>${info.common_name}</h2>
                <p class="scientific-name"><em>${info.scientific_name}</em></p>
            </div>
            
            <div class="plant-info-grid">
                <div class="info-section">
                    <h3>Basic Information</h3>
                    <p><strong>Family:</strong> ${info.family}</p>
                    <p><strong>Type:</strong> ${info.plant_type}</p>
                    <p><strong>Description:</strong> ${info.description}</p>
                </div>

                <div class="info-section">
                    <h3>Physical Characteristics</h3>
                    <p><strong>Leaf Structure:</strong> ${info.leaf_structure}</p>
                    <p><strong>Flower Details:</strong> ${info.flower_details}</p>
                    <p><strong>Fruit Type:</strong> ${info.fruit_type}</p>
                    <p><strong>Growth Habit:</strong> ${info.growth_habit}</p>
                </div>

                <div class="info-section">
                    <h3>Habitat & Distribution</h3>
                    <p><strong>Native Region:</strong> ${info.native_region}</p>
                    <p><strong>Distribution:</strong> ${info.distribution}</p>
                    <p><strong>Habitat:</strong> ${info.habitat}</p>
                </div>

                <div class="info-section">
                    <h3>Growing Requirements</h3>
                    <p><strong>Soil Type:</strong> ${info.soil_type}</p>
                    <p><strong>Sunlight Needs:</strong> ${info.sunlight_needs}</p>
                    <p><strong>Water Requirements:</strong> ${info.water_requirements}</p>
                    <p><strong>Temperature Range:</strong> ${info.temperature_range}</p>
                </div>

                <div class="info-section">
                    <h3>Uses</h3>
                    <div class="uses-grid">
                        ${usesHtml}
                    </div>
                </div>

                <div class="info-section">
                    <h3>Harmful Effects</h3>
                    <div class="harmful-effects-grid">
                        ${harmfulEffectsHtml}
                    </div>
                </div>
            </div>
        `;
        plantInfo.hidden = false;
    }

       // ✅ Expose to camera.js
       window.handleUpload = handleFile;

}

function generatePrompt() {
    return `
        Analyze this plant image and provide detailed information in JSON format.
        Please provide the following details:
        {
            "id": (generate a random number between 1-1000),
            "common_name": (common name of the plant),
            "scientific_name": (scientific name),
            "kingdom": "Plantae",
            "subcategory": (plant subcategory),
            "family": (plant family),
            "description": (brief description),
            "plant_type": (type of plant),
            "leaf_structure": (description of leaves),
            "flower_details": (description of flowers if visible),
            "fruit_type": (type of fruit if applicable),
            "growth_habit": (growth pattern),
            "native_region": (origin),
            "distribution": (where it's found),
            "habitat": (preferred growing conditions),
            "soil_type": (preferred soil),
            "sunlight_needs": (sunlight requirements),
            "water_requirements": (water needs),
            "temperature_range": (optimal temperature range),
            "uses": {
                "medicinal": (medicinal uses),
                "culinary": (culinary uses),
                "industrial": (industrial applications),
                "ornamental": (ornamental value)
            },
            "harmful_effects": {
                "toxicity": (toxicity information),
                "allergic_reactions": (potential allergic reactions),
                "invasive_nature": (invasive characteristics)
            },
            "classification": {
                "kingdom": "Plantae",
                "main_category": (main plant category)
            }
        }
    `;
}

// === Camera Handler Integration ===
document.addEventListener('DOMContentLoaded', () => {
    const cameraButton = document.getElementById('cameraBtn');
    const cameraHandler = new CameraHandler(); // from camera.js

    if (cameraButton) {
        cameraButton.addEventListener('click', () => {
            cameraHandler.startCamera();
        });
    }
});


 



