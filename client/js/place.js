// //item
let link = window.location.pathname.split("/");
let id = link[2];

const getItem = async (id) => {
  try {
    const res = await fetch(`/place/${id}`, {
      credentials: "include",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    renderMap(data.key);
  } catch (e) {
    console.log(e);
  }
};

const deleteItem = () => {
  if (window.confirm("Are you sure you want to delete this place ?")) {
    fetch(`/place/${id}/delete`, {
      credentials: "include",
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          window.location.href = "/";
        }
      })
      .catch((err) => console.log(err));
  }
};

const createReview = async () => {
  try {
    let link = window.location.pathname.split("/");
    let id = link[2];
    const oldData = {};
    for (let v of Object.values(formInput)) {
      oldData[v.name] = v.value;
    }
    let newData = Object.assign({}, oldData, { id: link[2] });

    const res = await fetch(`/place/${id}/create/comment`, {
      credentials: "include",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newData),
    });
    const data = await res.json();
    if (data.success) {
      formReset();
      window.location.href = `/place/${link[2]}`;
    }
  } catch (e) {
    console.log(e);
  }
};

const deleteReview = (commentId, rate) => {
  let data = {
    placeId: id,
    commentId,
    rate,
  };
  if (window.confirm("Are you sure you want to delete this comment ?")) {
    fetch(`/place/${id}/comment/delete`, {
      credentials: "include",
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          window.location.href = `/place/${id}`;
        }
      })
      .catch((err) => console.log(err));
  }
};

const renderMap = (key) => {
  const pos = document
    .getElementById("map")
    .attributes["pos"].nodeValue.split(",");

  mapboxgl.accessToken = key;
  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v11",
    center: pos,
    zoom: 11,
  });
  new mapboxgl.Marker().setLngLat(pos).addTo(map);
};

//rate
const rateInput = document.querySelector("input[name='rate']");
const rateFilled = document.querySelector(".rate_input.change_input .filled");

if (rateInput) {
  rateInput.addEventListener("click", (e) => {
    rateFilled.style.width = `${e.target.value * 20}%`;
  });
}

getItem(link[2]);
