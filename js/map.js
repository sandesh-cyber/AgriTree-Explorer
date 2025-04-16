// Map Page JavaScript

// Initialize map when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initMap();
});

// Initialize Leaflet map
function initMap() {
    const mapDisplay = document.getElementById('map-display');
    if (!mapDisplay) return;

    // Initialize the map
    const map = L.map('map-display').setView([20, 0], 2);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Initialize markers layer
    const markersLayer = L.layerGroup().addTo(map);

    // Add sample markers for demonstration
    const samplePlants = [
        {
            name: "Neem Tree",
            type: "beneficial",
            position: [20.5937, 78.9629],
            description: "Natural pesticide and medicinal plant"
        },
        {
            name: "Bamboo",
            type: "beneficial",
            position: [35.8617, 104.1954],
            description: "Fast-growing sustainable resource"
        },
        {
            name: "Japanese Knotweed",
            type: "harmful",
            position: [36.2048, 138.2529],
            description: "Invasive species, can damage infrastructure"
        }
    ];

    // Add markers to the map
    samplePlants.forEach(plant => {
        const marker = L.marker(plant.position, {
            icon: getMarkerIcon(plant.type)
        });

        marker.bindPopup(`
            <div class="map-popup">
                <h3>${plant.name}</h3>
                <p>${plant.description}</p>
                <button onclick="showPlantDetails('${plant.name}')" class="popup-btn">View Details</button>
            </div>
        `);

        marker.addTo(markersLayer);
    });

    // Filter controls
    const plantTypeSelect = document.getElementById('plant-type');
    const climateZoneSelect = document.getElementById('climate-zone');

    // Add event listeners to filters
    plantTypeSelect.addEventListener('change', updateMarkers);
    climateZoneSelect.addEventListener('change', updateMarkers);

    function updateMarkers() {
        const plantType = plantTypeSelect.value;
        const climateZone = climateZoneSelect.value;

        // Clear existing markers
        markersLayer.clearLayers();

        // Filter and add markers based on selection
        samplePlants.forEach(plant => {
            if ((!plantType || plant.type === plantType)) {
                const marker = L.marker(plant.position, {
                    icon: getMarkerIcon(plant.type)
                });

                marker.bindPopup(`
                    <div class="map-popup">
                        <h3>${plant.name}</h3>
                        <p>${plant.description}</p>
                        <button onclick="showPlantDetails('${plant.name}')" class="popup-btn">View Details</button>
                    </div>
                `);

                marker.addTo(markersLayer);
            }
        });
    }
}

// Custom marker icons
function getMarkerIcon(type) {
    const iconColor = type === 'beneficial' ? '#2ecc71' : '#e74c3c';
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${iconColor}"></div>`,
        iconSize: [20, 20]
    });
}

// Show plant details
function showPlantDetails(plantName) {
    // This function will be implemented when we have the backend ready
    console.log(`Showing details for ${plantName}`);
    alert(`Details for ${plantName} will be available soon!`);
}
