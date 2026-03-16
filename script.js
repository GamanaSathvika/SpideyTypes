window.onload = reset;

const resetBtn = document.querySelector('.reset-btn');
const inputBox = document.querySelector('.input-box');
const speed = document.querySelector('.txt-speed');
const time = document.querySelector('.txt-counter');

resetBtn.addEventListener("click", reset);

let num;
let i=0;
let wc=0,cwc=0, wwc=0;
let userWord="";
let timestarted=false;
let seconds=0;
let timer=null;

function start(){
  inputBox.addEventListener("keydown", function(event){
    if(event.key !== " " && timestarted==false){
      timestarted=true;
      timer = setInterval(function() {
       seconds++;
    }, 1000);
    }
    else if(event.key == " "){
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
  Believe in your ability to learn.`
  ];
function reset(){
  num = Math.floor(Math.random() * paras.length);
  const Para = document.querySelector('.para');
  Para.textContent=paras[num];
  wc=0, cwc=0, wwc=0, i=0, userWord="";
  seconds=0;
  inputBox.value = "";
  timestarted = false;
  clearInterval(timer);
  updatespeed();
  start();

}

function Test(event){
  let words = paras[num].trim().split(/\s+/);
  if(event.key == " "){
    if(userWord===words[i]){
      wc++;
      cwc++;
      updatespeed();
    }
    else{
      wwc++;
      wc++;
    }
    inputBox.value=""
    i++;
    userWord="";
  } 
  else{
    userWord+=event.key;
  }
}
function updatespeed(){
  if(seconds > 0){
    speed.textContent = `${Math.floor((cwc / seconds) * 60)
    } WPM`;
  }
  else{
    speed.textContent = "0 WPM";
  }
}