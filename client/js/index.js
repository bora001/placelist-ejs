const formBtn = document.querySelectorAll(".form_box .btn_submit");
const formInput = document.querySelectorAll(
  ".form_box input, .form_box textarea"
);
const listBox = document.querySelector(".section_list .list_box");
const nav = document.querySelector("nav");
w3.includeHTML();

const loginCheck = async () => {
  const res = await fetch("/auth", {
    credentials: "include",
    method: "POST",
    headers: {
      "Content-Tpe": "application/json",
    },
  });
  const data = await res.json();
  const loginSet = document.querySelectorAll("nav .menu .login_box");
  if (loginSet && data) {
    loginSet.forEach((set) => {
      if (set.classList.contains(`login_${data.login}`)) {
        set.classList.remove("off");
      }
    });
  }
};

const logoutE = async () => {
  try {
    const res = await fetch("/logout", {
      // credentials: "include",
      method: "POST",
    });
    const data = await res.json();
    window.location.href = "/";
  } catch (e) {
    console.log(e);
  }
};
//form-reset
const formReset = () => {
  formInput.forEach((input) => {
    input.value = "";
  });
};

//formSubmit
const formSubmit = () => {
  formBtn.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      // inputValidCheck();
      const inputArray = Array.from(formInput);
      if (inputArray.every((input) => input.validity.valid)) {
        switch (e.target.value) {
          case "Register":
            registerForm();
            break;
          case "Login":
            loginForm();
            break;
          case "Create New PlaceList":
            createForm();
            break;
          case "Leave a Review":
            createReview();
            break;

          default:
            break;
        }
      }
    });
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

const userCheck = async (userId, commentId) => {
  try {
    let link = window.location.pathname.split("/");
    let id = link[2];
    let reviewDel = document.querySelector(
      ".section_place .review_box .del_review"
    );
    let data = { userId };
    const res = await fetch(`/place/${id}/comment`, {
      credentials: "include",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!result.success) {
      reviewDel.classList.add("off");
    }
    reviewDel.addEventListener("click", (e) => {
      let rate = e.target.attributes["data-rate"].value;
      "index", result;
      deleteReview(commentId, result.id, rate);
    });
  } catch (e) {
    console.log(e);
  }
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

//rate
const rateInput = document.querySelector("input[name='rate']");
const rateFilled = document.querySelector(".rate_input .filled");

if (rateInput) {
  rateInput.addEventListener("click", (e) => {
    rateFilled.style.width = `${e.target.value * 20}%`;
  });
}

setTimeout(() => {
  loginCheck();
}, 100);
getData();
formSubmit();
