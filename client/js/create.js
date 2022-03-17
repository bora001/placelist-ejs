const createForm = async () => {
  console.log("createForm!-client");
  // const submitBtn = document.querySelector(".btn_submit");
  // const form = document.querySelector(".form_new");
  // const formData = new FormData(form);
  // form.addEventListener("submit", (e) => {
  //   const str = "Upload.......";
  //   submitBtn.disable = true;
  //   const count = (word, index) => {
  //     setTimeout(() => {
  //       submitBtn.value = word;
  //     }, 150 * index);
  //   };
  //   for (let i in str) {
  //     let s = str.slice(0, Number(i) + 1);
  //     count(s, i);
  //   }
  // });
  // const res = await fetch("/create", {
  //   method: "POST",
  //   body: formData,
  // });
  // const data = await res.json();
  // if (data.success) {
  //   formReset();
  //   window.location.href = "/";
  // }
};

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
