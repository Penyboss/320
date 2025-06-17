let percentageEl = document.querySelector('.percentage');
let percentEl = document.querySelector('.percent');
let sunIcon = document.querySelector('.bx-sun');
let moonIcon = document.querySelector('.bx-moon');


function batteryLevel() {
  navigator.getBattery().then(function (param) {
    percentageEl.style.width = param.level * 100 + '%';
    percentEl.textContent = Math.ceil(`${param.level * 100}`) + '%';
  });
  setTimeout(batteryLevel, 1000);
}

batteryLevel();

let secEl = document.querySelector('.sec');
let toggleEl = document.querySelector('.toggle');

toggleEl.onclick = function () {
  secEl.classList.toggle('dark');

  if (secEl.classList[1] === 'dark') {
    sunIcon.style.display = 'none';
    moonIcon.style.display = 'block';
  } else {
    sunIcon.style.display = 'block';
    moonIcon.style.display = 'none';
  }
};
