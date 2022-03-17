const formBtn = document.querySelectorAll(".form_box .btn_submit");
const formInput = document.querySelectorAll(
  ".form_box input, .form_box textarea"
);
const listBox = document.querySelector(".section_list .list_box");
const nav = document.querySelector("nav");

//form-reset
const formReset = () => {
  formInput.forEach((input) => {
    input.value = "";
  });
};

//getData
const getData = () => {
  if (window.location.pathname !== "/") {
    return true;
  }
  fetch("/", {
    credentials: "include",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => {
      let theData = data.data;
      let collection = {
        features: [],
      };
      theData.map((place) => {
        let obj = {
          geometry: place.geometry,
          properties: {
            id: place._id,
            img: place.img,
            rate: place.rate,
            name: place.name,
          },
        };
        collection.features.push(obj);
      });
      setMap(collection, data.mapToken);
    })
    .catch((err) => console.log(err));
};

//map
const setMap = (collection, key) => {
  mapboxgl.accessToken = key;
  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v11",
    center: [151.20776, -33.86854],
    zoom: 3,
  });
  map.addControl(new mapboxgl.NavigationControl());
  map.on("load", () => {
    map.addSource("placelist", {
      type: "geojson",
      data: collection,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50,
    });
    map.addLayer({
      id: "clusters",
      type: "circle",
      source: "placelist",
      filter: ["has", "point_count"],
      paint: {
        "circle-color": [
          "step",
          ["get", "point_count"],
          "#ee3976",
          100,
          "#e02765",
          750,
          "#da1154",
        ],
        "circle-radius": ["step", ["get", "point_count"], 20, 100, 30, 750, 40],
      },
    });
    map.addLayer({
      id: "cluster-count",
      type: "symbol",
      source: "placelist",
      filter: ["has", "point_count"],
      layout: {
        "text-field": "{point_count_abbreviated}",
        "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
        "text-size": 12,
      },
    });
    map.addLayer({
      id: "unclustered-point",
      type: "circle",
      source: "placelist",
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-color": "#da1154",
        "circle-radius": 4,
        "circle-stroke-width": 2,
        "circle-stroke-color": "#e9bccb",
      },
    });
    map.on("click", "clusters", (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ["clusters"],
      });
      const clusterId = features[0].properties.cluster_id;
      map
        .getSource("placelist")
        .getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;
          map.easeTo({
            center: features[0].geometry.coordinates,
            zoom: zoom,
          });
        });
    });
    map.on("click", "unclustered-point", (e) => {
      const coordinates = e.features[0].geometry.coordinates.slice();
      const name = e.features[0].properties.name;
      const rate = e.features[0].properties.rate;
      const img = e.features[0].properties.img;
      const id = e.features[0].properties.id;
      new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(
          `<a href='/place/${id}'><img src='${img}'/><br><h2>${name}</h2></a>`
        )
        .addTo(map);
    });
    map.on("mouseenter", "clusters", () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "clusters", () => {
      map.getCanvas().style.cursor = "";
    });
  });
};

getData();
