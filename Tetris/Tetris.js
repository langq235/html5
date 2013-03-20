/*
* 基于html5的俄罗斯方块游戏
* todo : 设置控制为直接下落 ， 空格/下 交换
*/

var o = {};
o.extend = function(){
    var target = arguments[0] || {},
        i = 1,
        length = arguments.length;
    
    
    if( i === length ){
        target = this;
        --i;
    }
    
    var src = arguments[i];
    for( var name in src ){
        target[name] = src[name];
    }
    return target;
}

var ctx = g('canvas').getContext('2d');
var ctx2 = g('canvas2').getContext('2d');
var ctxWidth = g('canvas').width;
var ctxHeight = g('canvas').height;



/**************************  **************************
* 方块设置
* a:      b:      c:      d:        e:       f:       g:
  **      *        *      *         *        *         *
  **      *        *      **       ***       *        **
          **      **       *                 *        *
                                             *
*/
var shapeDefine = {
    //"a":[ [0,0] , [0,1] , [0,2] , [0,3] ]
    "a" : [ [0,0] , [1,0] , [0,1] , [1,1] ],
    "b" : [ [0,0] , [0,1] , [0,2] , [1,2] ],
    "c" : [ [1,0] , [1,1] , [0,2] , [1,2] ],
    "d" : [ [0,0] , [0,1] , [1,1] , [1,2] ],
    "e" : [ [1,0] , [0,1] , [1,1] , [2,1] ],
    "f" : [ [0,0] , [0,1] , [0,2] , [0,3] ],
    "g" : [ [1,0] , [0,1] , [1,1] , [0,2] ]
};
var shapeLength = 7;
var Shape = function(option){
    this.option = {
        pos : {
            "x" : 0,
            "y" : 0
        }
    };
    o.extend(this.option , option);
    //this.type = option.type;
    //this.color = option.color;
    //this.pos = {};
};

Shape.prototype = {
    create : function(){
        var _self = this;
        var type = null;
        if(typeof(_self.option.type)!="undefined"){
            type = _self.option.type;
        }else{
            var i = parseInt(Math.random() * shapeLength);
            type = String.fromCharCode(97+i);
        }
        _self.dataShape = shapeDefine[type];
        
        if( typeof(_self.option.pos)!="undefined" ){
            pos = _self.option.pos;
        }else{
            var pos = {"x":0,"y":0};
        }
        _self.pos = pos;
    }
};


/****************************************************
* 游戏控制器
* 移动，开关
* 背景色由样式控制
*/

var Tetris = function(){
    this.stageSet = {
        width : 10, //横向格子
        height : 20, //竖向格子
        pix : 20, //格子大小
        speed : 300, //间隔时间
        mainPos : { //在canvas中的真实的起始位置
            x : 0,
            y : 0
        },
        speedMin : 50,
        speedMax : 300,
        speedFreq : 50,
        score : 0
    }; //场景设置
    this.gameSwitch = null; //开关
    this.stage = []; //场景实体 ， x * y 的数组 ， 存储是否有格子的标记
    this.shapeArray = []; //形状队列
    this.isNeedNewShape = true; //判断是否需要创建新形状
    this.curShape = null;
    this.isAbleContinue = true;//游戏是否能够继续
    this.isUserControleAble = false;//是否允许用户操作
};

Tetris.prototype = {
    init : function(isRestart){//初始化
        var _self = this;
        _self.initCanvas();
        _self.initCanvas2();
        _self.curShape = null;
        _self.stageSet.score = 0;
        
        for( var i = 0,j=_self.stageSet.width; i<j ; i++ ){//x
            _self.stage[i] = [];
            for( var m = 0,n=_self.stageSet.height; m<n ; m++ ){//y
                _self.stage[i][m] = false;
            }
        }
        //_self.createShape();
        _self.shapeArray.push(_self.createShape());
        _self.showNextShape();
        if(typeof(isRestart)!="undefined"){
            _self.start(true);
        }else{
            _self.start();
        }
    },
    initCanvas : function(){
        var _self = this;
        g('canvas').width = _self.stageSet.width * _self.stageSet.pix ;
        g('canvas').height = _self.stageSet.height * _self.stageSet.pix ;
        ctxWidth = g('canvas').width;
        ctxHeight = g('canvas').height;
    },
    initCanvas2 : function(){
        var _self = this;
        g('canvas2').width = 3 * _self.stageSet.pix ;
        g('canvas2').height = 4 * _self.stageSet.pix ;
    },
    step : function(userPos){//每间隔的操作
        var _self = this;
        var pos = {"x":0,"y":1};
        o.extend(pos,userPos);
        /*
        if( !_self.isAbleContinue){//是否能够继续进行
            _self.gameover();
            return false;
        }
        */
        _self.showNextShape();
        if( _self.isNeedNewShape ){
            _self.curShape = _self.shapeArray.shift();
            _self.shapeArray.push(_self.createShape());
            _self.isNeedNewShape = false;
        }
        var checkTouch = _self.checkTouch(pos);
        if( checkTouch == "bottom" ){ //判断当前状态是否需要进入下一状态
            _self.isNeedNewShape = true;
            _self.setData();
            var checkEliminate =_self.checkEliminate();
            if (checkEliminate.length > 0 ){
                _self.eliminate(checkEliminate); 
            }
        }else if( checkTouch == "over" ){//游戏结束
            _self.gameover();
            return false;
        }else if( checkTouch == "side" ){
            //donothing
        }else{
            _self.setPos(pos);
        }
        _self.drawStage();//绘制场景
        _self.onStep();
    },
    setPos : function(pos){
        var _self = this;
        _self.curShape.pos.x += pos.x;
        _self.curShape.pos.y += pos.y;
    },
    start : function(isRestart){ //游戏开始
        var _self = this;
        if(typeof(isRestart)=="undefined"){
            _self.shapeArray.push(_self.createShape());
            _self.bindUserAction();
        }
        _self.gameSwitch = setInterval( function(){
            _self.step();
        },_self.stageSet.speed );
        _self.isUserControleAble = true;
    },
    pause : function(){//暂停
        var _self = this;
        clearInterval(_self.gameSwitch);
        _self.isUserControleAble = false;
    },
    stop : function(){//停止
        var _self = this;
        clearInterval(_self.gameSwitch);
        _self.isUserControleAble = false;
    },
    speedDown : function(){
        var _self = this;
        if(_self.stageSet.speed < _self.stageSet.speedMax){
            _self.stageSet.speed += _self.stageSet.speedFreq;
        }
        clearInterval(_self.gameSwitch);
        _self.gameSwitch = setInterval( function(){
            _self.step();
        },_self.stageSet.speed );
    },
    speedUp: function(){
        var _self = this;
        if(_self.stageSet.speed > _self.stageSet.speedMin){
            _self.stageSet.speed -= _self.stageSet.speedFreq;
        }
        clearInterval(_self.gameSwitch);
        _self.gameSwitch = setInterval( function(){
            _self.step();
        },_self.stageSet.speed );
    },
    gameover : function(){
        var _self = this;
        _self.stop();
        _self.onGameover();
    },
    moveShape : function(pos){//移动方块
        var _self = this;
        _self.step(pos);
    },
    createShape : function(opt){//创建放开
        var option = {
            pos : {
                "x" : 5,
                "y" : 0
            }
        };
        o.extend(option,opt);
        var shape = new Shape(option);
        shape.create();
        return shape;
    },
    eliminate : function(line){//消除
        var _self = this;
        for(var i = 0,j=line.length ; i<j ; i++){
            for( var m = 0,n=_self.stageSet.width; m<n ; m++ ){//x
                for( var o = line[i] , p = 1; o>p ; o--){
                    _self.stage[m][o] = _self.stage[m][o-1];
                }
            }
        }
        _self.stageSet.score += line.length;
    },
    checkEliminate : function(){//检查是否需要消除
        var _self = this;
        var line = [];
        for( var m = 0,n=_self.stageSet.height; m<n ; m++ ){//y
            var mark = 1;
            for( var i = 0,j=_self.stageSet.width; i<j ; i++ ){//x
                if(!_self.stage[i][m]){
                    mark = 0;
                    break;
                }
            }
            if( mark ){
                line.push(m);
            }
        }
        return line;
    },
    checkTouch : function(pos){//检查是否落地 , 检查是否存活
        //情形：最后一行，或下面一行有物体
        var _self = this;
        if( _self.curShape ){
            for( var i=0, j=_self.curShape.dataShape.length ; i<j ; i++){
                var x = _self.curShape.dataShape[i][0] +_self.curShape.pos.x ; 
                var y = _self.curShape.dataShape[i][1]+_self.curShape.pos.y ;
                if( ( typeof(_self.stage[x+pos.x])=="undefined" || _self.stage[x+pos.x][y+pos.y] ) && pos.x != 0  ){
                    return "side";
                }
                
                if( ( typeof(_self.stage[x+pos.x])=="undefined" || _self.stage[x+pos.x][y+pos.y] ) && pos.x ==0 && pos.y ==0 ){
                    //不可变形
                    return true;
                }
                if( typeof(_self.stage[x+pos.x][y+pos.y]) == "undefined" || _self.stage[x+pos.x][y+pos.y] ){//触底或有东西存在
                    if( y==0 ){//第一行，即结束
                        return "over";
                    }
                    return "bottom";
                }
            }
        }
        return false;
    },
    drawStage : function(){//绘制场景
        var _self = this;
        var pix = _self.stageSet.pix;
        ctx.clearRect(0,0,ctxWidth,ctxHeight);
        
        for( var i = 0,j=_self.stageSet.width; i<j ; i++ ){//x
            for( var m = 0,n=_self.stageSet.height; m<n ; m++ ){//y
                if(_self.stage[i][m]){
                    _self.drawPoint(i,m);
                }
            }
        }
        
        //[ [0,0] , [1,0] , [0,1] , [1,1] ]
        if( _self.curShape ){
            for( var i=0, j=_self.curShape.dataShape.length ; i<j ; i++){
                _self.drawPoint(_self.curShape.dataShape[i][0]+_self.curShape.pos.x , _self.curShape.dataShape[i][1]+_self.curShape.pos.y);
            }
        }
    },
    drawPoint : function(x,y,context){
        var _self = this;
        var pix = _self.stageSet.pix;
        var _ctx = ctx;
        if(typeof(context)!="undefined"){
            _ctx = context;
        }
        //线型
        /*
        ctx.beginPath();
        ctx.moveTo(x*pix , y*pix);
        ctx.lineTo((x+1)*pix , y*pix);
        ctx.lineTo((x+1)*pix , (y+1)*pix);
        ctx.lineTo( x*pix , (y+1)*pix);
        ctx.lineTo( x*pix , y*pix);
        ctx.stroke();
        */
        //图形
        //ctx.fillRect(x*pix , y*pix,x*pix , (y+1)*pix);
        _ctx.fillRect(x*pix,y*pix,pix,pix);
    },
    showNextShape : function(){
        var _self = this;
        ctx2.clearRect(0,0,g('canvas').width,g('canvas').width);
        if( _self.shapeArray.length >= 1 ){
            for( var i=0, j=_self.shapeArray[0].dataShape.length ; i<j ; i++){
                _self.drawPoint(_self.shapeArray[0].dataShape[i][0], _self.shapeArray[0].dataShape[i][1],ctx2);
            }
        }
    },
    setData : function(shape){ //设置数据 ，没用
        var _self = this;
        for( var i=0, j=_self.curShape.dataShape.length ; i<j ; i++){
            var x = _self.curShape.dataShape[i][0] +_self.curShape.pos.x ; 
            var y = _self.curShape.dataShape[i][1]+_self.curShape.pos.y ;
            _self.stage[x][y] = true;
        }
    },
    bindUserAction : function(){
        var _self = this,
            w = window,
            d = document;
        d.onkeydown = function(e){
            if(!_self.isUserControleAble){
                return;
            }
            var code = e.keyCode;
            switch (code){
                case 37://left
                _self.moveShape({"x":-1,"y":0});
                break;
                
                case 38:
                _self.changeShape();
                break;
                
                case 39:
                _self.moveShape({"x":+1,"y":0});
                break;
                
                case 40:
                _self.moveShape({"x":0,"y":1});
                break;
            }
            return false;
        };
    },
    changeShape : function(){
        var _self = this;
        var d = _self.curShape.dataShape;
        _self.curShape.dataShape = [ [ 3-d[0][1] , d[0][0] ], [ 3-d[1][1] , d[1][0] ], [ 3-d[2][1] , d[2][0] ], [ 3-d[3][1] , d[3][0] ] ];
        var result = _self.checkTouch({"x":0,"y":0});
        if(result == "bottom" || result == "side" || result == "over" || result){
            _self.curShape.dataShape = d;
            return false;
        }
        _self.step({"x":0,"y":0});
    },
    unbindUserAction : function(){
    },
    onStep : function(){
    },
    onGameover : function(){
    }
};












//库函数

function g(o){
    return document.getElementById(o);
}