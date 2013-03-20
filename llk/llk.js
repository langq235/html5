/*
* ����html5����������Ϸ
* todo : ·���㷨�Ż� �� ���������Ķ��� �� �ؿ� �� ���¿�ʼ �� ���� �� ��ʾ ������ �� �Ƿ���ʣ�������
* ʣ�� �� ����
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
function Square(){ //����
    this.pattern = null; //ͼ�Ρ���ɫ
    this.pos = {
        "x" : 0,
        "y" : 0
    };
}

Square.prototype = {
};
*/

function Stage(){ //������ ����
    this.lastIcon = null;
}

Stage.prototype = {
    types : {
        "default" : {
            "width" : 10,
            "height" : 10,
            "allowedIcon" : ["1","2","3","4","5","6","7","8","9","a","b"],//����ʹ�õ�ͼ��
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
        //�ַ���ת��Ϊ����  x*y �Ķ�ά���飬��ʱ��һλ��ĸ���ֱ�ʾ����Ӧ������Ӧ��ͼƬ��
        //֧��62��ͼ�Σ����ڿ��޸�
        /*
        1111111111
                     
        1111111111
                     
        1111111111
        
        */
        var str = _self["types"][typeName].pattern;
        var allowedIcon = _self["types"][typeName].allowedIcon;
        var allowedIconLength = allowedIcon.length;
        
        /* �������ͼ���㷨
        for(var i = 0 , j = _self["types"][typeName].width ; i < j ; i++){ //width , y
            data[i] = [];
            for(var k = 0 , m = _self["types"][typeName].height ; k < m ; k++){ //height , x
                var isIcon = str.substring(pointer, pointer+1);
                if(isIcon!=" "){//���ͼ��
                    if( _self.lastIcon !=null ){ //ȷ������һ��
                        
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
        * �ж��ж��ٸ�ͼ��len �� ���һ��С��len������ �� ������ȡ���λ�õ�ͼ�Σ������Ƶ�stage�У������Ϊ�գ�ֱ��������
        */
        var mark = [];
        for(var i = 0 , j = _self["types"][typeName].width ; i < j ; i++){ //width , y
            data[i] = [];
            for(var k = 0 , m = _self["types"][typeName].height ; k < m ; k++){ //height , x
                var isIcon = str.substring(pointer, pointer+1);
                if(isIcon!=" "){//���ͼ��
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
            if( _self.lastIcon !=null ){ //ȷ������һ��
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
        "offset" : { //stage�е���ʾλ��ƫ����
            "x":0,
            "y":0
        }
    };
    this.checkLoadedFreq = 10; //�������Ƿ���ϵļ��
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
        "icon" : { //װ�ؼ�����ϵ����
        },
        "iconLoaded" : 0
    }; //��Ҫ��� �� ͼƬ
    this.compomentBaseUrl = './pattern/';
    this.curSquare = null;
    this.path = []; // ��¼����·��
}

Llk.prototype = {
    loadCompoment : function(){ // ����ͼƬ(��Ҫ���)
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
            //todo ����չʧ���¼��������в���ͼƬ�޷�����
        }
        _self.compoment.iconLength = iconLength;
    },
    checkLoadCompoment : function(){ //����Ҫ����Ƿ�������
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
    createStage : function(option){//��Ҫ��д��Ҫ�ĵ�ͼ
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
            
            //��ȡ�����λ��
            e = window.event || e;
            var posX = e.clientX - canvasOffsetX;
            var posY = e.clientY - canvasOffsetY;
            
            //��������ȷ���������
            var x = Math.floor( posX / pix );
            var y = Math.floor( posY / pix );
            var square = {"x":x,"y":y};
            if( typeof(_self.stage[y]) == "undefined" || typeof(_self.stage[y][x]) == "undefined" ){
                //������Χ
                return false;
            }
            if( _self.curSquare != null ){ //�ڶ��ε��
                if( checkObjEq(square,_self.curSquare) ){//����Լ�
                    _self.drawUnselect(_self.curSquare);
                    _self.curSquare = null;
                }else{//�������
                    if(  _self.stage[y][x] == " " ){//���
                        //donothing
                    }else{ //�����ĳ��ͼ
                        _self.path = [];
                        var eliminate = _self.checkEliminate(_self.curSquare.x,_self.curSquare.y,square.x,square.y);
                        if( !eliminate ){ //���û�������������curSquare
                            _self.drawUnselect(_self.curSquare);
                            _self.curSquare = square;
                            _self.drawSelect(square);
                        }else{//����������Ϊnull
                            _self.eliminate(_self.curSquare.x,_self.curSquare.y,square.x,square.y);
                            _self.drawPath( _self.curSquare.x,_self.curSquare.y );
                            _self.curSquare = null;
                        }
                    }
                }
            }else{ //��һ�ε��
                if(  _self.stage[y][x] == " " ){//���
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
    checkEliminate : function( x1,y1 , x2,y2 ){ //�Ƿ��������
        var _self = this;
        if ( _self.stage[y1][x1] == _self.stage[y2][x2] ){
            //��ʽ����
            _self.checking = true;
            var result = _self.checkEliminateCore(  x1 , y1 , x2 , y2 , 0 , null );
            //_self.drawPath( x1,y1 );
            //_self.path = [];
            return result;
        }
        return false;
    },
    checkEliminateCore : function( x1 , y1 , x2 , y2 , turnTimes/* ת����� */ ,curDir/* ��ǰ���� */ ){ //�ڵ��ú��ֶ����÷�����
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
            if(curDir == null){//δ�˶�
                newDir = i;//0
            }
            
            if( curDir != newDir ){//����ͬ�����ù��������һ
                newTurnTimes++;
            }else{
            }
            
            if( newTurnTimes>3 ){//�սǳ���2��
                _self.path.pop();
                continue;
            }
            var x = x1+dir[i].x;
            var y = y1+dir[i].y;
            //_self.drawSquare(x,y,"a");//�����ã����·��
            
            if(x==x2 && y ==y2){//�ҵ���
                return true;
            }else if(typeof(_self.stage[y])=="undefined" || typeof(_self.stage[y][x])=="undefined" ){//������
                _self.path.pop();
                continue;
            }else if( _self.stage[y][x] == " " ){//�հ�
                if (_self.checkEliminateCore( x1+dir[i].x , y1+dir[i].y , x2, y2 ,newTurnTimes , newDir )){
                    return true;
                }else{
                    _self.path.pop();
                    continue;
                }
            }else{//����ͬ_self.stage[y][x]!=_self.stage[y2][x2]
                _self.path.pop();
                continue;
            }
        }
        return false;//Ĭ�Ͻ��
    },
    checkClear : function(){ //�Ƿ����
        var _self = this;
        if ( _self.squareLeft == 0 ){
            _self.gameClear();
        }else{
            return false;
        }
    },
    gameClear : function(){ //ȫ������ �� ��Ϸ����
        var _self = this;
        _self.isUserControleAble = false;
    },
    drawSelect : function( square ){ //ѡ��ĳ��ͼ�� , todo
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
        //���
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
    drawBackground : function(){ //���Ʊ���
    },
    drawPath : function(sx,sy){ //��ʼλ��
        var _self = this;
        var pix = _self.option.pix;
        var path = _self.path; //����·��
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








//�⺯��

function g(o){
    return document.getElementById(o);
}