const thumbnail = () => {
  const fileBtn = document.getElementById("input_img");
  const preImg = document.querySelector(".section_new .pre_img");
  let img = document.createElement("img");

  if (preImg.childElementCount !== 0) {
    fileBtn.addEventListener("click", (event) => {
      preImg.removeChild();
    });
  }

  fileBtn.addEventListener("change", (event) => {
    var reader = new FileReader();
    reader.onload = function (event) {
      img.setAttribute("src", event.target.result);
      preImg.appendChild(img);
    };

    if (preImg.hasChildNodes) {
      reader.readAsDataURL(event.target.files[0]);
    }
  });
};
thumbnail();
