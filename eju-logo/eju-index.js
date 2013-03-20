/*
 * eju html5 logo 旋转
 * 作者: hongliang1
 * 日期: 2012-2-9
*/


(function(){

//标记是否加载必须组件完成（图片）
var setupReady = false;

//htmlset
var container = $(".eju_header_main"); //logo位置
container.css({"position":"relative"});//设置必要样式
var logo = container.find("h1"); //logo dom


var canvas=$('<canvas id="canvas" width="192" height="50"></canvas>');  
canvas.appendTo(container);

var bgImage = null; //背景图
var ctx = null; //canvas
try{
    ctx = canvas[0].getContext('2d');  
}catch(e){
    return;
}
//ctx = canvas[0].getContext('2d');
var stageWidth = canvas.width();
var stageHeight= canvas.height();

var si = null;

function drawMovie() {
    ctx.save(); 
    ctx.fillStyle = 'rgb('+(51)+','+(204)+',255)';  
    
    
    var times = 60;  //旋转一周需要次数
    var time = 2 ; //旋转一周需要时间,单位：秒
    var freq = time * 1000 / times ; //旋转间隔
    
    
    var curTimes = 0;
    var firstRound = true ;
    ctx.translate(26,25); //设置圆心
    
    var lastTime = curTimes; //优化旋转时，记录上次旋转的角度
    
    var startTime = new Date();
    si = setInterval(function(){
        ctx.rotate(-1 * Math.PI*2/(times) * (lastTime));
        ctx.clearRect(-26,-25,stageWidth,stageHeight);
        drawBackground();
        ctx.rotate(Math.PI*2/(times) * (curTimes+1));  //将园分成若干份
        lastTime = curTimes+1;
        ctx.beginPath();  
        ctx.arc(0,22,4,0,Math.PI*2,true);  
        ctx.fill(); 
        if(curTimes == times){
            curTimes = 1;
        } else{
            //curTimes++;
            //优化滚动
            var curTime = new Date();
            var diff = curTime - startTime;
            if( diff / freq > 2){
                if(curTimes + diff / freq > times){
                    curTimes = 1;
                }else{
                    curTimes += Math.floor(diff / freq);
                }
            }else{
                curTimes++;
            }
            startTime = curTime;
        }
    },freq);
} 


function stopDraw(){
    ctx.restore();
    ctx.clearRect(0,0,stageWidth,stageHeight);
    clearInterval(si);
}

function drawBackground(){
    //ctx.drawImage(bgImage,-26,-25,stageWidth,stageHeight);
}

function init(){
    bgImage = new Image();
    bgImage.onload = function(){
        setupReady = true;
        domEventBind();
        //drawBackground();
        //drawMovie();
    };
    bgImage.src = "eju-logo.png";
}


// dom event bind
function domEventBind(){
    canvas.css({"position":"absolute","left":0,"top":0,"display":""});
    canvas.bind("mouseover",function(){
        drawMovie();
        return false;
    });
    canvas.bind("mouseout",function(){
        stopDraw();
        return false;
    });
    canvas.bind("click",function(){
        location.href = "/";
    });
}


init();
})();