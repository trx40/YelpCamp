const camp = JSON.parse(campground)
mapboxgl.accessToken = 'pk.eyJ1IjoidGVqYXMtbSIsImEiOiJjbGJnanoydXUwY2ZsM3ZvMzg2aG56b3ZkIn0.Z1h3Q5p0lcee3XvQFDHqUg';
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v12', // style URL
    center: camp.geometry.coordinates, // starting position [lng, lat]
    zoom: 10, // starting zoom
});
const marker = new mapboxgl.Marker()
    .setLngLat(camp.geometry.coordinates)
    .addTo(map);