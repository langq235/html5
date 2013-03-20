/*
 * rose.js
 * 动画实现原理，将全部动画帧送入队列，由同一的动画控制器按频率播放
*/
var Pos = function(x,y){
    this.x = x;
    this.y = y;
};
var Rose = function(option){
    var _self = this;
    _self.isReady = false ; //是否配置完成
    _self.progress = 0 ; //进度
    _self.max = 100 ; //总数
    _self.option = {
        "images" : {
            "flowers" : ["images/rose1.png","images/rose2.png","images/rose3.png"],
            "leaf" : ["images/leaf1.png","images/leaf2.png","images/leaf3.png"],
            "limb" : ["limb1.png"]
        },
        "limbColor" : ["#c18f3a" , "#000000"],
        "ctx" : $("#canvas")[0].getContext('2d'),
        "ctx2" : $("#canvas2")[0].getContext('2d'),
        "canvas2" : $("#canvas2")
    };
    _self.images = {};//存储图片
    _self.ctx = null;
    _self.movieBox = [];//存储动画帧
    _self.freq = 30; //控制刷新率
    _self.curOrder = 0; //生成了多少玫瑰
    _self.roseInfos = [];//所有玫瑰的信息
    _self.init(option);
};

Rose.prototype = {
    //初始化 - 配置场景，读取图片
    init : function(option){
        var _self = this;
        var imageCount = 0;
        var imageRead = 0;
        $.extend(_self.option , option);
        _self.ctx = _self.option.ctx;
        _self.ctx2 = _self.option.ctx2;
        _self.canvas2 = _self.option.canvas2;
        $.each(_self.option.images,function(k,v){
            _self.images[k] = {};
            for(var i=0,j=v.length ; i<j ; i++){
                imageCount++;
                _self.images[k][i] = new Image();
                _self.images[k][i].onload = function(){
                    imageRead++;
                };
                _self.images[k][i].src = v[i];
            }
        });
        var si = setInterval(function(){ //判断是否全部加在完成
            if(imageCount==imageRead){//ready
                _self.makeRose();
                clearInterval(si)
            }
        },10);
        _self.progressControl();
    },
    makeRose : function(){//在场景中生成玫瑰
        var _self = this;
        _self.makeOneRose({ //暂时不传参数，以后改为自动，依旧不需要参数
        });
    },
    //生成一朵玫瑰
    makeOneRose : function(option){
        var _self = this;
        var topPos = _self._makeLimb();
        _self._makeFlower(_self.roseInfos[_self.curOrder].pos);
        //_self._makeFlower({"x":100,"y":100});
    },
    //生成枝干
    _makeLimb : function(pos,color,width,height,minWidth,maxWidth){//起始点，颜色，宽度，高度,宽度变化范围
        //固定一个起始点用于测试
        var pos = new Pos(300,500);
        var color = "#c18f3a";
        var _self = this;
        var ctx = _self.ctx;
    },
    //备份
    __makeLimb : function(pos,color,width,height,minWidth,maxWidth){//起始点，颜色，宽度，高度,宽度变化范围
        //固定一个起始点用于测试
        var pos = new Pos(300,500);
        var color = "#c18f3a";
        var width = 8;
        var height = 200;
        var minWidth = 3;
        var maxWidth = 8;
        
        var step = 4;
        
        var _self = this;
        var ctx = _self.ctx;
        ctx.lineWidth = width;
        ctx.strokeStyle = color;
        for(var i = 0; i<height/step ; i++){
            _self.movieBox.push(function(){
                ctx.beginPath();
                ctx.moveTo(pos.x , pos.y);
                pos.y -= step;
                var xIncrease = 0;
                var xIncrease = Math.random() * 10;
                if(xIncrease > 9){
                    xIncrease = 1;
                }else if(xIncrease < 1){
                    xIncrease = -1;
                }else {
                    xIncrease = 0;
                }
                if(ctx.lineWidth + xIncrease>maxWidth || ctx.lineWidth + xIncrease<minWidth){
                    
                }else{
                    ctx.lineWidth = ctx.lineWidth + xIncrease;
                }
                ctx.lineTo(pos.x,pos.y);
                ctx.stroke();
                ctx.closePath();
            });
        }
        _self.roseInfos[_self.curOrder] = {};
        _self.roseInfos[_self.curOrder].pos = pos;
    },
    //生成叶子
    _makeLeaf : function(pos,color,face,size){
    },
    //生成花朵
    _makeFlower : function(pos,color,size){
        //var pos = new Pos(100,100);
        var width = 154;
        var height = 144;
        
        var _self = this;
        var ctx = _self.ctx;
        var ctx2 = _self.ctx2;
        var canvas2 = _self.canvas2;
        _self.movieBox.push(function(){
            canvas2.css({"display":""});
        });
        
        var afterWidth= 0;
        var afterHeight= 0;
        var steps = 10;
        for(var i = 0; i<steps ; i++){
            _self.movieBox.push(function(){
                    ctx2.clearRect(0,0,500,500);
                    afterWidth = afterWidth +width/steps;
                    afterHeight = afterHeight +height/steps;
                    ctx2.drawImage(_self.images["flowers"][2],pos.x-afterWidth/2,pos.y-afterHeight/2+10-height/2 , afterWidth, afterHeight);
            });
        }
        _self.movieBox.push(function(){
            ctx.drawImage(_self.option.canvas2[0],0,0,500,500);
            ctx2.clearRect(0,0,500,500);
            canvas2.css({"display":"none"});
        });
    },
    //生成过程控制
    progressControl : function(){
        var _self = this;
        var si = setInterval(function(){
            if(_self.movieBox.length > 0){
                _self.movieBox.shift()();
            }
        },_self.freq);
    }
};

var rose = new Rose({});
