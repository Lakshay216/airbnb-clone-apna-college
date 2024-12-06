	mapboxgl.accessToken = mapToken;
  console.log(mapToken);
    const map = new mapboxgl.Map({
        container: 'map', // container ID
        center: listing.geometry.coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
        zoom: 9 // starting zoom
    });
    // console.log(coordinates)

    const marker1 = new mapboxgl.Marker()
        .setLngLat(listing.geometry.coordinates)
        .setPopup(
          new mapboxgl.Popup({offset:25}).setHTML(
            "<h4>Exact location provided after booking</h4>"
          )
        )
        .addTo(map);