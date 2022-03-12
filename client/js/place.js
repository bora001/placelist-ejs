//item
let link = window.location.pathname.split("/");
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

    renderItem(data.item, data.key);
    renderReview(data.item.review);
    deleteItem(data.writer, data.item._id);
    document.title = `Placelist - ${data.item.name}`;
  } catch (e) {
    console.log(e);
  }
};

const deleteItem = (result, id) => {
  const delBtn = document.querySelector(".section_place .del_place");
  if (result) {
    delBtn.classList.remove("off");
  }

  delBtn.addEventListener("click", () => {
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
  });
};

const renderItem = (data, key) => {
  renderMap(data.geometry.coordinates, key);
  let length = data.review.length;
  let average = (data.rate / length).toFixed(1);
  let itemBox = document.querySelector(".section_place .item_box");

  let html = `
        <div class="detail_box">
          <div class="img_box">
            <img
              src=${data.img}
              alt=""
            />
          </div>
          <div class="txt_box">
            <div class="intro_box">
              <h3>${data.name}</h3>
              <div class="rate_input">
                <p>&#9733;&#9733;&#9733;&#9733;&#9733;</p>
                <p class="filled"
                style="width: ${average * 20}%"
                >&#9733;&#9733;&#9733;&#9733;&#9733;</p>
              </div>
              <p class="current_rate">${average > 0 ? average : ""}</p>
            </div>
            <p>${data.address}</p>
          </div>
        </div>
        `;
  itemBox.insertAdjacentHTML("afterbegin", html);
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
    } else {
      alert("Please Login");
      window.location.href = "/login";
    }
  } catch (e) {
    console.log(e);
    console.log(JSON.stringify(e));
  }
};

const deleteReview = (commentId, id, rate) => {
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

const renderReview = (data) => {
  let reviewList = document.querySelector(
    ".section_place .review_box .review_list"
  );
  data.map((comment) => {
    const html = `<div class="review_item">
              <div class="rate_input">
                <p>&#9733;&#9733;&#9733;&#9733;&#9733;</p>
                <p class="filled"
                style="width: ${comment.rate * 20}%"
                >&#9733;&#9733;&#9733;&#9733;&#9733;</p>
              </div>          
              <div class="review_txt">
                <h3>${comment.username}</h3>
                <p >${comment.comment}</p>
              </div>
              <button class="del_review" data-rate=${comment.rate}>❌</button>
            </div>`;
    reviewList.insertAdjacentHTML("afterbegin", html);
    userCheck(comment.userId, comment._id);
  });
  let reviewForm = document.querySelector(
    ".section_place .review_box .review_add"
  );

  reviewForm.classList.remove("off");
};

const renderMap = (data, key) => {
  mapboxgl.accessToken = key;
  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v11",
    center: data,
    zoom: 11,
  });
  new mapboxgl.Marker().setLngLat(data).addTo(map);
};
getItem(link[2]);
