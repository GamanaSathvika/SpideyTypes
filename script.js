window.onload = function(){
  reset();
  start();
};

const resetBtn = document.querySelector('.reset-btn');
const inputBox = document.querySelector('.input-box');
const speed = document.querySelector('.txt-speed');
const times = document.querySelectorAll(".select-time");
const counter= document.querySelector(".txt-counter");
const dispSpeed = document.querySelector(".speed-txt-disp");
const dispRawSpeed = document.querySelector(".rawspeed-disp");
const dispAccuracy = document.querySelector(".accuracy-disp");
const dispCC = document.querySelector(".cc-disp");
const dispWC = document.querySelector(".wc-disp");

resetBtn.addEventListener("click", reset);

let num;
let i=0;
let wc=0, cwc=0, wwc=0;
let userWord="";
let timestarted=false;
let seconds=0;
let timer=null;


times.forEach(time=>{
  time.addEventListener("click", ()=>{
    times.forEach(t=>t.classList.remove("selected"));
    time.classList.add("selected");
    counter.textContent = time.textContent;
  });
});

function start(){
  inputBox.addEventListener("keydown", function(event){
    if(!timestarted && event.key.length === 1){
      timestarted=true;
      timer = setInterval(function() {
        seconds++;
        counter.textContent = `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;
      }, 1000);
    }
    
    if(event.key === " "){
      event.preventDefault();
    }
    
    Test(event);
  });
}

let paras = [
  `The quick brown fox jumps over the lazy dog.
  Practice every day to improve your typing speed.`,

  `Coding becomes easier when you understand the logic.
  Patience and consistency are the keys to learning.`,
  
  `A small step taken daily creates big progress.
  Focus on accuracy before chasing speed.`,
  
  `Learning to type faster can save a lot of time.
  Keep your fingers on the home row keys.`,
  
  `Great programmers are made through practice.
  Debugging teaches more than writing code.`,
  
  `Technology is changing the world every day.
  Curiosity keeps the mind sharp and active.`,
  
  `The internet connects people across the globe.
  Knowledge is only a few clicks away.`,
  
  `Reading improves vocabulary and thinking skills.
  Writing helps express ideas clearly.`,
  
  `Consistency beats motivation in the long run.
  Build habits that support your goals.`,
  
  `Every challenge is an opportunity to grow.
  Believe in your ability to learn.`];

function reset(){
  num = Math.floor(Math.random() * paras.length);
  const Para = document.querySelector('.para');
  Para.textContent = paras[num];
  wc=0;
  cwc=0;
  wwc=0;
  i=0;
  userWord="";
  seconds=0;
  timestarted=false;
  clearInterval(timer);
  inputBox.value = "";
  updatespeed();
  
  const selected = document.querySelector(".select-time.selected");
  if(selected) counter.textContent = selected.textContent;
  else counter.textContent = "1:00";  // fallback
}

function Test(event){
  let words = paras[num].trim().split(/\s+/);
  
  let maxtime = 60;
  const selected = document.querySelector(".select-time.selected");
  if(selected && selected.textContent.includes(":")) {
    let parts = selected.textContent.split(":");
    maxtime = (parseInt(parts[0]) || 0) * 60 + (parseInt(parts[1]) || 0);
  } else if(selected) {
    maxtime = parseInt(selected.textContent) * 60 || 60;
  }

  if(seconds >= maxtime){
    clearInterval(timer);
    if(userWord.trim() !== ""){
      wc++;
      if(userWord === words[i]) cwc++;
      else wwc++;
    }
    
    dispSpeed.textContent    = `${Math.floor((cwc / seconds) * 60)} WPM`;
    dispRawSpeed.textContent = `${Math.floor((wc  / seconds) * 60)} WPM`;
    dispAccuracy.textContent = seconds > 0 ? `${Math.floor((cwc / wc) * 100)}%` : "100%";
    dispCC.textContent = `${cwc}`;
    dispWC.textContent = `${wwc}`;
    return;
  }

  if(event.key === " "){
    let typed = userWord.trim();
    
    if(typed === words[i]){
      wc++;
      cwc++;
      updatespeed();
    }
    else{
      wwc++;
      wc++;
    }

    inputBox.value = "";
    i++;
    userWord = "";
    
    if(i >= words.length){
      clearInterval(timer);
      dispSpeed.textContent    = `${Math.floor((cwc / seconds) * 60)} WPM`;
      dispRawSpeed.textContent = `${Math.floor((wc  / seconds) * 60)} WPM`;
      dispAccuracy.textContent = seconds > 0 ? `${Math.floor((cwc / wc) * 100)}%` : "100%";
      dispCC.textContent = `${cwc}`;
      dispWC.textContent = `${wc}`;
    }
  }
  else if(event.key.length === 1){
    userWord += event.key;
  }
}

function updatespeed(){
  if(seconds > 0){
    speed.textContent = `${Math.floor((cwc / seconds) * 60)} WPM`;
  }
  else{
    speed.textContent = "0 WPM";
  }
}