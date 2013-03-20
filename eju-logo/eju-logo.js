(function(){
var bgImage = null; //背景图

var canvas=$("#canvas");
var ctx = null;
try{
    ctx = document.getElementById('canvas').getContext('2d');  
}catch(e){
    return;
}
ctx = document.getElementById('canvas').getContext('2d');
var stageWidth = canvas.width();
var stageHeight= canvas.height();

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
    var si = setInterval(function(){
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
    /*
    for (var j=0;j<times;j++){ // draw individual dots  
        ctx.rotate(Math.PI*2/(times));  //将园分成若干份
        ctx.beginPath();  
        ctx.arc(0,20,5,0,Math.PI*2,true);  
        ctx.fill();  
    }
    */
    //ctx.restore();  
} 

function drawBackground(){
    //ctx.drawImage(bgImage,-26,-25,stageWidth,stageHeight);
}

function init(){
    bgImage = new Image();
    bgImage.onload = function(){
        drawBackground();
        drawMovie();
    };
    bgImage.src = "eju-logo.png";
}
init();
})();