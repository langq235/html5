/*
* 基于html5的连连看游戏
* todo : 路径算法优化 ， 消除线条的动画 ， 关卡 ， 重新开始 ， 重列 ， 提示 ，声音 ， 是否有剩余可消除
* 剩余 ， 连续
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

var checkObjEq = function(o1,o2){
    var mark = true;
    for(var o in o1){
        if(o1[o] == o2[o]){
        }else{
            mark = false;
        }
    }
    for(var o in o2){
        if(o1[o] == o2[o]){
        }else{
            mark = false;
        }
    }
    return mark;
}

var ctx = g('canvas').getContext('2d');
var ctx2 = g('canvas2').getContext('2d');
var ctxWidth = g('canvas').width;
var ctxHeight = g('canvas').height;
var canvas = g('canvas');

/*
function Square(){ //格子
    this.pattern = null; //图形、颜色
    this.pos = {
        "x" : 0,
        "y" : 0
    };
}

Square.prototype = {
};
*/

function Stage(){ //场景： 布局
    this.lastIcon = null;
}

Stage.prototype = {
    types : {
        "default" : {
            "width" : 10,
            "height" : 10,
            "allowedIcon" : ["1","2","3","4","5","6","7","8","9","a","b"],//可以使用的图形
            "pattern" : "1111111111          1111111111          1111111111          1111111111          11111111111111111111",
            "squares" : 60
        }
    },
    getTypepattern : function(type){
        type = type || "default";
        return this.types[type].squares;
    },
    init : function (_typeName){
        var _self = this;
        var typeName = _typeName || "default";
        var data = [];
        var pointer = 0;
        //字符串转换为数组  x*y 的二维数组，暂时用一位字母数字表示，对应的有响应的图片，
        //支持62个图形，后期可修改
        /*
        1111111111
                     
        1111111111
                     
        1111111111
        
        */
        var str = _self["types"][typeName].pattern;
        var allowedIcon = _self["types"][typeName].allowedIcon;
        var allowedIconLength = allowedIcon.length;
        
        /* 逐个安排图表算法
        for(var i = 0 , j = _self["types"][typeName].width ; i < j ; i++){ //width , y
            data[i] = [];
            for(var k = 0 , m = _self["types"][typeName].height ; k < m ; k++){ //height , x
                var isIcon = str.substring(pointer, pointer+1);
                if(isIcon!=" "){//填充图形
                    if( _self.lastIcon !=null ){ //确保两两一致
                        
                        data[i][k] = _self.lastIcon;
                        _self.lastIcon = null;
                    }else{
                        data[i][k] = _self["types"][typeName].allowedIcon[Math.floor(Math.random()*allowedIconLength)];
                        _self.lastIcon = data[i][k];
                    }
                }else{
                    data[i][k] = " ";
                }
                pointer++;
                //data[i][k] = str.substring(pointer, ++pointer);
            }
        }
        */
        /*
        * 判断有多少个图，len ， 随机一个小于len的数字 ， 用正则取这个位置的图形，并绘制到stage中，并标记为空，直到绘制完
        */
        var mark = [];
        for(var i = 0 , j = _self["types"][typeName].width ; i < j ; i++){ //width , y
            data[i] = [];
            for(var k = 0 , m = _self["types"][typeName].height ; k < m ; k++){ //height , x
                var isIcon = str.substring(pointer, pointer+1);
                if(isIcon!=" "){//填充图形
                    mark.push([i,k]);
                }else{
                    data[i][k] = " ";
                }
                pointer++;
                //data[i][k] = str.substring(pointer, ++pointer);
            }
        }
        while(mark.length>0 ){
            var len= mark.length;
            var n = Math.floor(Math.random()*len);
            var w = mark[n];
            if( _self.lastIcon !=null ){ //确保两两一致
                data[w[0]][w[1]] = _self.lastIcon;
                _self.lastIcon = null;
            }else{
                data[w[0]][w[1]] = _self["types"][typeName].allowedIcon[Math.floor(Math.random()*allowedIconLength)];
                _self.lastIcon = data[w[0]][w[1]];
            }
            mark = removeArrayElement(mark,n);
        }
        return data;
    }
};
function removeArrayElement( array , n ){
    var newArray = [];
    for(var i = 0 , j = array.length ; i < j ; i++){
        if( i==n ){
            continue;
        }else{
            newArray.push(array[i]);
        }
    }
    return newArray;
}
var stage = new Stage();

function Llk(){
    this.stage = null;
    this.loaded = false;
    this.option = {
        "type" : "default",
        "pix" : 37,
        "offset" : { //stage中的显示位置偏移量
            "x":0,
            "y":0
        }
    };
    this.checkLoadedFreq = 10; //检查加载是否完毕的间隔
    this.isUserControleAble = false;
    this.compoment = {
        "iconUrl" : {
            "1" :"1.png",
            "2" :"2.png",
            "3" :"3.png",
            "4" :"4.png",
            "5" :"5.png",
            "6" :"6.png",
            "7" :"7.png",
            "8" :"8.png",
            "9" :"9.png",
            "a" :"a.png",
            "b" :"b.png",
            "c" :"c.png",
            "d" :"d.png"
        },
        "icon" : { //装载加载完毕的组件
        },
        "iconLoaded" : 0
    }; //必要组件 ： 图片
    this.compomentBaseUrl = './pattern/';
    this.curSquare = null;
    this.path = []; // 记录消除路径
}

Llk.prototype = {
    loadCompoment : function(){ // 加载图片(必要组件)
        var _self = this;
        var iconLength = 0;
        for ( var name in _self.compoment.iconUrl ){
            iconLength++;
            var imageUrl = _self.compomentBaseUrl + _self.compoment.iconUrl[name];
            var image = new Image();
            image.src = imageUrl;
            image.setAttribute("data",name)
            image.onload = function(){
                var name = this.getAttribute("data");
                _self.compoment.icon[name] = this;
                _self.compoment.iconLoaded++;
            }
            //todo 可扩展失败事件，处理当有部分图片无法加载
        }
        _self.compoment.iconLength = iconLength;
    },
    checkLoadCompoment : function(){ //检查必要组件是否加载完毕
        var _self = this;
        var iconLength = _self.compoment.iconLength;
        if( _self.compoment.iconLoaded ==  iconLength){
            return true;
        }
        return false;
    },
    init : function(){
        var _self = this;
        _self.loadCompoment();
        
        var si = setInterval(function(){
            if(_self.checkLoadCompoment()){
                clearInterval(si);
                _self.createStage(_self.option);
                _self.bindUserAction();
                _self.start();
            }
        },_self.checkLoadedFreq);
    },
    createStage : function(option){//需要填写需要的地图
        var _self = this;
        o.extend(option , {
            "type" : "default"
        });
        _self.stage = stage.init(option.type);
        _self.drawStage();
        _self.squareLeft = stage.getTypepattern(option.type);
    },
    start : function(){
        var _self = this;
        _self.isUserControleAble = true;
    },
    bindUserAction : function(){
        var _self = this;
        var pix = _self.option.pix;
        var canvasOffsetX = canvas.offsetLeft;
        var canvasOffsetY = canvas.offsetTop;
        canvas.onmousedown = function(e){
            if( !_self.isUserControleAble ){
                return;
            }
            
            //获取鼠标点击位置
            e = window.event || e;
            var posX = e.clientX - canvasOffsetX;
            var posY = e.clientY - canvasOffsetY;
            
            //根据坐标确定点击对象
            var x = Math.floor( posX / pix );
            var y = Math.floor( posY / pix );
            var square = {"x":x,"y":y};
            if( typeof(_self.stage[y]) == "undefined" || typeof(_self.stage[y][x]) == "undefined" ){
                //超出范围
                return false;
            }
            if( _self.curSquare != null ){ //第二次点击
                if( checkObjEq(square,_self.curSquare) ){//点击自己
                    _self.drawUnselect(_self.curSquare);
                    _self.curSquare = null;
                }else{//点击其他
                    if(  _self.stage[y][x] == " " ){//点空
                        //donothing
                    }else{ //点击到某个图
                        _self.path = [];
                        var eliminate = _self.checkEliminate(_self.curSquare.x,_self.curSquare.y,square.x,square.y);
                        if( !eliminate ){ //如果没有消除，则更换curSquare
                            _self.drawUnselect(_self.curSquare);
                            _self.curSquare = square;
                            _self.drawSelect(square);
                        }else{//消除则设置为null
                            _self.eliminate(_self.curSquare.x,_self.curSquare.y,square.x,square.y);
                            _self.drawPath( _self.curSquare.x,_self.curSquare.y );
                            _self.curSquare = null;
                        }
                    }
                }
            }else{ //第一次点击
                if(  _self.stage[y][x] == " " ){//点空
                    //donothing
                }else{
                    _self.curSquare = square;
                    _self.drawSelect(square);
                }
            }
            
            return false;
        };
    },
    eliminate : function(x1,y1,x2,y2){
        var _self = this;
        _self.stage[y1][x1] = " ";
        _self.stage[y2][x2] = " ";
        _self.drawStage();
        _self.squareLeft -= 2;
        _self.checkClear();
        return true;
    },
    checkEliminate : function( x1,y1 , x2,y2 ){ //是否可以消除
        var _self = this;
        if ( _self.stage[y1][x1] == _self.stage[y2][x2] ){
            //正式查找
            _self.checking = true;
            var result = _self.checkEliminateCore(  x1 , y1 , x2 , y2 , 0 , null );
            //_self.drawPath( x1,y1 );
            //_self.path = [];
            return result;
        }
        return false;
    },
    checkEliminateCore : function( x1 , y1 , x2 , y2 , turnTimes/* 转弯次数 */ ,curDir/* 当前方向 */ ){ //在调用后手动重置方向标记
        var _self = this;
        var dir = [
            {"x":0,"y":-1},//up
            {"x":1,"y":0},//right
            {"x":0,"y":1},//down
            {"x":-1,"y":0}//left
        ];
        for(var i = 0,j=4; i<j ; i++){
            _self.path.push(i);
            var newTurnTimes = turnTimes , 
                newDir = i;
            if(curDir == null){//未运动
                newDir = i;//0
            }
            
            if( curDir != newDir ){//方向不同，设置拐弯次数加一
                newTurnTimes++;
            }else{
            }
            
            if( newTurnTimes>3 ){//拐角超过2次
                _self.path.pop();
                continue;
            }
            var x = x1+dir[i].x;
            var y = y1+dir[i].y;
            //_self.drawSquare(x,y,"a");//测试用，标记路径
            
            if(x==x2 && y ==y2){//找到了
                return true;
            }else if(typeof(_self.stage[y])=="undefined" || typeof(_self.stage[y][x])=="undefined" ){//出界了
                _self.path.pop();
                continue;
            }else if( _self.stage[y][x] == " " ){//空白
                if (_self.checkEliminateCore( x1+dir[i].x , y1+dir[i].y , x2, y2 ,newTurnTimes , newDir )){
                    return true;
                }else{
                    _self.path.pop();
                    continue;
                }
            }else{//不相同_self.stage[y][x]!=_self.stage[y2][x2]
                _self.path.pop();
                continue;
            }
        }
        return false;//默认结果
    },
    checkClear : function(){ //是否结束
        var _self = this;
        if ( _self.squareLeft == 0 ){
            _self.gameClear();
        }else{
            return false;
        }
    },
    gameClear : function(){ //全部消除 ， 游戏结束
        var _self = this;
        _self.isUserControleAble = false;
    },
    drawSelect : function( square ){ //选择某个图形 , todo
        var _self = this;
        var pix = _self.option.pix;
        ctx.beginPath();
        var x = square.x,
            y = square.y;
        ctx.moveTo(pix * x , pix*y);
        ctx.lineTo(pix * x + pix -1, pix*y -1);
        ctx.lineTo(pix * x + pix -1 , pix*y +pix -1);
        ctx.lineTo(pix * x  , pix*y+pix );
        ctx.stroke();
    },
    drawUnselect : function( square ){
        var _self = this;
        var x = square.x,
            y = square.y;
        var pattern = _self.stage[y][x];
        _self.drawSquare(x,y,pattern);
    },
    drawStage : function(){
        var _self = this;
        //清空
        ctx.clearRect(0,0,ctxWidth,ctxHeight);
        for(var y = 0, j = _self.stage.length; y<j ; y++){
            for(var x = 0, j = _self.stage[y].length; x<j ; x++){
                if(_self.stage[y][x] != " "){
                    _self.drawSquare(x,y,_self.stage[y][x]);
                }
            }
        }
    },
    drawSquare : function(x,y,pattern){
        var _self = this;
        var pix = _self.option.pix;
        var image = _self.compoment.icon[pattern];
        ctx.clearRect(x*pix,y*pix,pix,pix);
        ctx.drawImage(image,x*pix,y*pix,pix,pix);
    },
    drawBackground : function(){ //绘制背景
    },
    drawPath : function(sx,sy){ //起始位置
        var _self = this;
        var pix = _self.option.pix;
        var path = _self.path; //绘制路径
        if(path.length <=1 ){
            return;
        }
        var dir = [
            {"x":0,"y":-1},//up
            {"x":1,"y":0},//right
            {"x":0,"y":1},//down
            {"x":-1,"y":0}//left
        ];
        ctx.beginPath();
        var x = ( sx + 0.5 )*pix;
        var y = ( sy + 0.5 )*pix;
        ctx.moveTo(x,y);
        for(var i = 0 , j = path.length ; i<j ; i++){
            sx += dir[path[i]].x;
            sy += dir[path[i]].y;
            x = ( sx + 0.5 )*pix;
            y = ( sy + 0.5 )*pix;
            ctx.lineTo(x,y);
        }
        ctx.stroke();
    }
};
var llk = new Llk();
llk.init();








//库函数

function g(o){
    return document.getElementById(o);
}