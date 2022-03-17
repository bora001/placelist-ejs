const submitE = async () => {
  const formBtn = document.querySelector(".form_box .btn_submit");
  const formBox = document.querySelector(".form_box");
  formBox.addEventListener("submit", (e) => {
    const str = " P r o c e s s i n g · · ·";
    formBtn.disabled = true;
    const count = (word, index) => {
      setTimeout(() => {
        formBtn.value = word;
      }, 150 * index);
    };
    for (let i in str) {
      let s = str.slice(0, Number(i) + 1);
      count(s, i);
    }
  });
};
submitE();
