var canvas1 = document.getElementById("canvasNebulas");
canvas1.width = document.body.offsetWidth;
canvas1.height = document.body.offsetHeight;
var ctx = canvas1.getContext("2d");
window.onresize = function () {
  canvas1.width = document.body.offsetWidth;
  canvas1.height = document.body.offsetHeight;
}
//声明变量记录小球的最小半径和最大半径
var min = 1,
  max = 2;
//首选定义构造函数,生成小球对象
function Ball() {
  this.centerX = randomNumber(max, canvas1.width - max);
  this.centerY = randomNumber(max, canvas1.height - max);
  this.radius = randomNumber(min, max);
  this.color = randomColor();
  //水平方向的速度
  var speed1 = randomNumber(0.1, 1);
  this.speedX = randomNumber(0, 1) == 0 ? -speed1 : speed1;
  //竖直方向的速度
  var speed2 = randomNumber(0.1, 1);
  this.speedY = randomNumber(0, 1) == 0 ? -speed2 : speed2;
}
//添加绘制小球的方法
Ball.prototype.draw = function () {
  ctx.beginPath();
  ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2, false);
  ctx.closePath();
  ctx.fillStyle = this.color;
  ctx.fill();
}
//给小球添加鼠移动的事件
Ball.prototype.move = function () {
  this.centerX += this.speedX;
  this.centerY += this.speedY;
}
//定义一个空数组,存放一定距离内，连线的小球
var areaB = [];
//定义一个变量,用来存储范围
var areaRadius = 100;
//写一个函数
//写一个鼠标移入的事件,求一开始的位置
var mouseX = 500;
var mouseY = 300;

var delayMove = null
$("#canvasNebulas").on("mousemove", function (e) {
  var even = e || event;

  //获取鼠标的坐标点
  clearTimeout(delayMove)
  delayMove = setTimeout(function () {
    mouseX = even.pageX - $("#canvasNebulas").offset().left;
    mouseY = even.pageY - $("#canvasNebulas").offset().top;
  }, 100)

});
//小球与小球之间的连线
function areaBallLine() {
  //在一定区域内绘制一个大圆球
  for (var i = 0; i < areaB.length; i++) {
    for (var j = 0; j < areaB.length; j++) {
      var disX = Math.abs(areaB[i].centerX - areaB[j].centerX);
      var disY = Math.abs(areaB[i].centerY - areaB[j].centerY);
      if (Math.sqrt(disX * disX + disY * disY) < 60) {
        //开始绘制线段
        ctx.beginPath();
        ctx.moveTo(areaB[i].centerX, areaB[i].centerY);
        ctx.lineTo(areaB[j].centerX, areaB[j].centerY);
        ctx.closePath();
        ctx.strokeStyle = randomColor();
        ctx.stroke();
      }
    }
  }
}
//生成随机数的函数
function randomNumber(x, y) {
  return Math.floor(Math.random() * (y - x + 1) + x);
}
//生成随机颜色的函数
function randomColor() {
  var red = randomNumber(0, 255);
  var green = randomNumber(0, 255);
  var blue = randomNumber(0, 255);
  return "rgb(" + red + "," + green + "," + blue + ")";
}


window.requestAnimFrame = (function () {
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60);
    };
})();

//生成小球对象
var count = 800;
var balls = [];
for (var i = 0; i < count; i++) {
  var ball = new Ball();
  balls.push(ball);
}
// var timer = setInterval(, 100);
//写一个方法,检测小球和canvas1画布碰撞的时候,将速度变成相反的
function adjustballCanvas() {
  for (var i = 0; i < balls.length; i++) {
    //首先判断水平方向的
    if (balls[i].centerX < balls[i].radius || balls[i].centerX > (canvas1.width - balls[i].radius)) {
      balls[i].speedX *= -1;
    }
    if (balls[i].centerY < balls[i].radius || balls[i].centerY > (canvas1.height - balls[i].radius)) {
      balls[i].speedY *= -1;
    }
  }
}


function start() {
  //下面是小球移动的函数
  function startMove() {
    ctx.clearRect(0, 0, 1500, 1200);
    for (var i = 0; i < balls.length; i++) {
      balls[i].draw();
      balls[i].move();
    }
    adjustballCanvas();
  }
  startMove();
  for (var i = 0; i < balls.length; i++) {
    //算出鼠标和小球中心之间的距离
    var subX = Math.abs(mouseX - balls[i].centerX);
    var subY = Math.abs(mouseY - balls[i].centerY);
    //判断鼠标点到小球中心的距离
    if (Math.sqrt(subX * subX + subY * subY) < areaRadius) {
      areaB.push(balls[i]);
    }
    if (mouseX < areaRadius) {
      mouseX = areaRadius;
    } else if (mouseY < areaRadius) {
      mouseY = areaRadius;
    } else if (mouseX > canvas1.width - areaRadius) {
      mouseX = canvas1.width - areaRadius;
    } else if (mouseY > canvas1.height - areaRadius) {
      mouseY = canvas1.height - areaRadius;
    }
  }
  areaBallLine();
  areaB = [];
}

function run() {
  window.requestAnimFrame(run);
  start()
}

run()
