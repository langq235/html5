/*
* ����html5�Ķ���˹������Ϸ
* todo : ���ÿ���Ϊֱ������ �� �ո�/�� ����
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
* ��������
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
* ��Ϸ������
* �ƶ�������
* ����ɫ����ʽ����
*/

var Tetris = function(){
    this.stageSet = {
        width : 10, //�������
        height : 20, //�������
        pix : 20, //���Ӵ�С
        speed : 300, //���ʱ��
        mainPos : { //��canvas�е���ʵ����ʼλ��
            x : 0,
            y : 0
        },
        speedMin : 50,
        speedMax : 300,
        speedFreq : 50,
        score : 0
    }; //��������
    this.gameSwitch = null; //����
    this.stage = []; //����ʵ�� �� x * y ������ �� �洢�Ƿ��и��ӵı��
    this.shapeArray = []; //��״����
    this.isNeedNewShape = true; //�ж��Ƿ���Ҫ��������״
    this.curShape = null;
    this.isAbleContinue = true;//��Ϸ�Ƿ��ܹ�����
    this.isUserControleAble = false;//�Ƿ������û�����
};

Tetris.prototype = {
    init : function(isRestart){//��ʼ��
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
    step : function(userPos){//ÿ����Ĳ���
        var _self = this;
        var pos = {"x":0,"y":1};
        o.extend(pos,userPos);
        /*
        if( !_self.isAbleContinue){//�Ƿ��ܹ���������
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
        if( checkTouch == "bottom" ){ //�жϵ�ǰ״̬�Ƿ���Ҫ������һ״̬
            _self.isNeedNewShape = true;
            _self.setData();
            var checkEliminate =_self.checkEliminate();
            if (checkEliminate.length > 0 ){
                _self.eliminate(checkEliminate); 
            }
        }else if( checkTouch == "over" ){//��Ϸ����
            _self.gameover();
            return false;
        }else if( checkTouch == "side" ){
            //donothing
        }else{
            _self.setPos(pos);
        }
        _self.drawStage();//���Ƴ���
        _self.onStep();
    },
    setPos : function(pos){
        var _self = this;
        _self.curShape.pos.x += pos.x;
        _self.curShape.pos.y += pos.y;
    },
    start : function(isRestart){ //��Ϸ��ʼ
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
    pause : function(){//��ͣ
        var _self = this;
        clearInterval(_self.gameSwitch);
        _self.isUserControleAble = false;
    },
    stop : function(){//ֹͣ
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
    moveShape : function(pos){//�ƶ�����
        var _self = this;
        _self.step(pos);
    },
    createShape : function(opt){//�����ſ�
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
    eliminate : function(line){//����
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
    checkEliminate : function(){//����Ƿ���Ҫ����
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
    checkTouch : function(pos){//����Ƿ���� , ����Ƿ���
        //���Σ����һ�У�������һ��������
        var _self = this;
        if( _self.curShape ){
            for( var i=0, j=_self.curShape.dataShape.length ; i<j ; i++){
                var x = _self.curShape.dataShape[i][0] +_self.curShape.pos.x ; 
                var y = _self.curShape.dataShape[i][1]+_self.curShape.pos.y ;
                if( ( typeof(_self.stage[x+pos.x])=="undefined" || _self.stage[x+pos.x][y+pos.y] ) && pos.x != 0  ){
                    return "side";
                }
                
                if( ( typeof(_self.stage[x+pos.x])=="undefined" || _self.stage[x+pos.x][y+pos.y] ) && pos.x ==0 && pos.y ==0 ){
                    //���ɱ���
                    return true;
                }
                if( typeof(_self.stage[x+pos.x][y+pos.y]) == "undefined" || _self.stage[x+pos.x][y+pos.y] ){//���׻��ж�������
                    if( y==0 ){//��һ�У�������
                        return "over";
                    }
                    return "bottom";
                }
            }
        }
        return false;
    },
    drawStage : function(){//���Ƴ���
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
        //����
        /*
        ctx.beginPath();
        ctx.moveTo(x*pix , y*pix);
        ctx.lineTo((x+1)*pix , y*pix);
        ctx.lineTo((x+1)*pix , (y+1)*pix);
        ctx.lineTo( x*pix , (y+1)*pix);
        ctx.lineTo( x*pix , y*pix);
        ctx.stroke();
        */
        //ͼ��
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
    setData : function(shape){ //�������� ��û��
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












//�⺯��

function g(o){
    return document.getElementById(o);
}