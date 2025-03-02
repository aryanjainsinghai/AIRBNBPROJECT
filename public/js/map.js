document.addEventListener("DOMContentLoaded", function () {
    // Get coordinates from the data attribute of the map div
    const mapDiv = document.getElementById("map");
    const coordinates = JSON.parse(mapDiv.getAttribute("data-geometry")).coordinates;
    const locationName = mapDiv.getAttribute("data-location");

    console.log("Raw Coordinates from MongoDB:", coordinates);
    console.log("Location Name:", locationName);

    // Validate coordinates
    if (!Array.isArray(coordinates) || coordinates.length < 2) {
        console.warn("Invalid coordinates, using default (Mumbai).");
        coordinates = [19.0760, 72.8777]; // Default: Mumbai (Latitude, Longitude)
    }

    // Extract coordinates (MongoDB now stores as [latitude, longitude])
    const [latitude, longitude] = coordinates;

    console.log("Final Map Coordinates (Leaflet format):", latitude, longitude);

    // Initialize Leaflet map
    const map = L.map("map").setView([latitude, longitude], 10);

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    // Add a marker
    L.marker([latitude, longitude])
        .addTo(map)
        .bindPopup(`<b>Listing Location</b><br>${locationName}`)
        .openPopup();
});
