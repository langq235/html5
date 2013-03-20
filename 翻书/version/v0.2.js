//------------------------//
//- 基础方法 -/
//------------------------//


//- 得到两点之间的距离 -/
function getDist(px1, py1, px2, py2) {
    x = px2 - px1;
    y = py2 - py1;
    hyp = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    return hyp;
}

//-得到两点之间的角度 -/
function getAngle(px1, py1, px2, py2) {
    x = px2 - px1;
    y = py2 - py1;

    hyp = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));

    cos = x / hyp;
    rad = Math.acos(cos);
    //如果你看不懂，就去问你的数学老师
    deg = 180 / (Math.PI / rad);
    //是的，我们通过cos得到了一个角度“rad”，不过是以弧度为单位的
    //因此，我们需要再进一步把它转换成我们所需要的标准的角度
    if (y < 0) {
        deg = -deg;
    } else if ((y == 0) && (x < 0)) {
        deg = 180;
    }
    return deg;
}

 //用D1和F来找到其他的点
function getD234(){
  len = _getDist( pfx, pfy, _root.stage.d1._x,_root.stage.d1._y);
  len1 = len/2;
  len2 = (pfx - _root.stage.d1._x)/2;

  _root.stage.d2._x = pfx - len1*len1/len2;
  _root.stage.d2._y = pfy;

  len2 = (pfy - _root.stage.d1._y)/2;
  len3 = len1*len1/len2;

  _root.stage.d3._x = pfx;
  _root.stage.d3._y = pfy - len3;

  // 检查D4是否和D3在同一个位置
  if (_root.stage.d3._y < pey){
    ptx = pex - (pfx - _root.stage.d2._x)*(pey - _root.stage.d3._y)/len3;
    pty = pey;

    len = _root.getDist(_root.stage.d3._x, _root.stage.d3._y, ptx, pty);
    len1 = (pex - ptx)*(pey - _root.stage.d3._y)/len;

    len2 = len1*len1/(pex - ptx);
    _root.stage.d4._x = pex - len2*2;

    len2 = len1*len1/(pey - _root.stage.d3._y);
    _root.stage.d4._y = pey - len2*2;

    _root.stage.d3._x = ptx;
    _root.stage.d3._y = pty;

  } else {
    _root.stage.d4._x = _root.stage.d3._x;
    _root.stage.d4._y = _root.stage.d3._y;
  }
}
//- 指针，用于控制书 -/
var pointer = {};

//- 书的主体 -/
var book = {
    page:10,
    pointer:pointer,
    shape:{//书的大小
        width:0,
        height:0
    },
    mouseDragging:false,
    draggingAble:true,//是否可以移动
    settings:{},
    pos:{
        "d0":{},
        "d1":{},
        "d2":{},
        "d3":{},
        "d4":{}
    },
    loadedImage:0,//加载完成的图片
    currentPage:0,//当前页码
    checkLoaded:null,//检查图片计时器
    ifLoaded:false,//检查图片是否加载完成的标记
    initCanvas:function(option){
        var _self=this;
        $.extend(_self.settings,option);
        _self.canvas=_self.settings.canvas;
        _self.canvasNextPage=_self.settings.canvasNextPage;
        _self.canvasNextNextPage=_self.settings.canvasNextNextPage;
        _self.page=_self.settings.page;//页数
        _self.pages=_self.settings.pages;//每页的图片，数组
        _self.margin=_self.settings.margin;
        _self.shape={
            width:_self.canvas.width(),
            height:_self.canvas.height()
        };
        _self.pos.d0=_self.settings.pos.d0;
        _self.context =_self.canvas[0].getContext('2d');
        _self.contextNextPage =_self.canvasNextPage[0].getContext('2d');
        _self.contextNextNextPage =_self.canvasNextNextPage[0].getContext('2d');
        
        _self.initBook();
        //在右侧绘制封面（整个平面的右1/2）
        
        
        /*
        var image = new Image();
        image.src=_self.pages[0];
        _self.backgroundImage=image;
        image.onload=function(){
            _self.drawBackground();
        }
        */
        
        //检查图片是否加载完成，可以添加读取标志，或更改为一页一页读取，预加载若干张
        var startInterval=setInterval(function(){
            if(_self.ifLoaded == true){
                //_self.drawNextNextPage();
                _self.drawCover();
                _self.bindPointer();
                clearInterval(startInterval);
            }
        },500);
    },
    nextPage:function(){//自动下一页
    },
    prePage:function(){//自动前一页
    },
    moveingToNextPage:function(pointer){
        //设置各项参数
        var _self = this;
        _self.draggingAble = false;
        _self.canvas.unbind("mousemove");
        _self.mouseDragging=false;
        _self.currentPage++;
    },
    moveingToPrePage:function(pointer){
        //设置各项参数
    },
    bindPointer:function(){//触发向前、向后，并获取鼠标信息
        var _self=this;
        _self.canvas.bind("mousedown",function(e){
            if(_self.mouseDragging){
                return false;
            }
            //在特定区域内（四个角）时激活拖拽
            _self.draggingAble = true;
            
            _self.mousedownCanvas(e);
            _self.canvas.bind("mousemove",function(f){
                _self.mouseDragging=true;
                _self.moveCanvas(f);
            });
        });
        _self.canvas.bind("mouseup",function(e){
            _self.canvas.unbind("mousemove");
            _self.mouseDragging=false;
            _self.mouseupCanvas(e);
        });
    },
    mousedownCanvas:function(e){
    },
    moveCanvas:function(e){
        var _self=this;
        /* moveingToNextPage中设置了mouseup相同的事件
        */
        if(!_self.draggingAble){
            return;
        }
        _self.getPosition(e);//获取D1坐标
        var ifNext=_self.getD234();//获取D234坐标，并判断是否移动到下一页
        var ifDraw=_self.draw();//绘制图书,并判断是否有下一页
        if(ifNext){//移动到下一页
            _self.moveingToNextPage();
        }
        if(!ifDraw){//最后一页了
            _self.lastPage();
            return false;
        }
    },
    lastPage:function(){//到达最后一页
        var _self = this;
        _self.canvas.unbind("mousemove");
        _self.mouseDragging=false;
    },
    //绘制canvas
    draw:function(){
        //直接在右侧绘制出4个点位，测试是否正确。
        var _self=this;
        
        //判断是否可以继续翻
        var ifMorePage=true;
        if(typeof(_self.pagesImage[_self.currentPage+2])=="undefined"){
            return false;
        }
        //按顺序绘制底层，上层，中层
        _self.drawNextNextPage();
        _self.drawCurrentPage();
        _self.drawNextPage();
        
        
        //直接绘制4个点位，用于检测位置是否正确
        /*
        var pos=_self.pos;
        var ctx=_self.context;
        
        ctx.beginPath();
        ctx.moveTo(pos.d1.x,pos.d1.y);
        ctx.lineTo(pos.d2.x,pos.d2.y);
        ctx.lineTo(pos.d3.x,pos.d3.y);
        ctx.lineTo(pos.d4.x,pos.d4.y);
        ctx.lineTo(pos.d1.x,pos.d1.y);
        ctx.stroke();
        */
        return true;
    },
    mouseupCanvas:function(e){
    },
    getPosition:function(e){
        var _self=this;
        var offset=_self.canvas.offset();
        var x=e.pageX-offset.left;
        var y=e.pageY-offset.top;
        _self.pos.d1.x=x;
        _self.pos.d1.y=y;
    },
    //绘制第三页
    drawNextNextPage:function(){
        var _self=this;
        /*
        _self.canvas.css("background","#333366");
        return;
        */
        // Set the book's width and height. （设置书的宽和高）
        var stageW = _self.settings.shape.width;
        var stageH = _self.settings.shape.height;
        // Set reference points' position （设置参考点的位置）
        var pax=_self.pos.d0.x - stageW/2;
        var pay=_self.pos.d0.y - stageH/2;
        
        var pbx=_self.pos.d0.x - stageW/2;
        var pby=_self.pos.d0.y + stageH/2;
        
        var pcx=_self.pos.d0.x;
        var pcy=_self.pos.d0.y - stageH/2;
        
        var pdx=_self.pos.d0.x;
        var pdy=_self.pos.d0.y + stageH/2;
        
        var pex=_self.pos.d0.x + stageW/2;
        var pey=_self.pos.d0.y - stageH/2;
        
        var pfx=_self.pos.d0.x + stageW/2;
        var pfy=_self.pos.d0.y + stageH/2;
        
        
        _self.context.clearRect(0, 0, _self.settings.stage.width, _self.settings.stage.height);
        //每页为1/2书宽，注释掉，未采用
        //_self.context.drawImage(_self.pagesImage[_self.currentPage+2],pcx,pcy,_self.settings.shape.width/2,_self.settings.shape.height);
        //每页为100%书宽
        _self.context.drawImage(_self.pagesImage[_self.currentPage+1],pax,pay,_self.settings.shape.width,_self.settings.shape.height);
    },
    //在右侧绘制下一页 角
    drawNextPage:function(curPage){
        var _self=this;
        var pos=_self.pos;
        var angle = _self.getAngle(pos.d1.x,pos.d1.y,pos.d2.x,pos.d2.y);//将下一页的角翻转的角度
        var ctxNext=_self.contextNextPage;
        // Set the book's width and height. （设置书的宽和高）
        var stageW = _self.settings.shape.width;
        var stageH = _self.settings.shape.height;
        // Set reference points' position （设置参考点的位置）
        var pax=_self.pos.d0.x - stageW/2;
        var pay=_self.pos.d0.y - stageH/2;
        var pbx=_self.pos.d0.x - stageW/2;
        var pby=_self.pos.d0.y + stageH/2;
        var pfx=_self.pos.d0.x + stageW/2;
        var pfy=_self.pos.d0.y + stageH/2;
        ctxNext.clearRect(0, 0, _self.settings.stage.width, _self.settings.stage.height);
        ctxNext.beginPath();
        ctxNext.save();
        //ctxNext.rotate(angle/90);//method 1 
        
        ctxNext.translate(pos.d0.x-(pos.d2.x-pos.d0.x),pos.d2.y);
        ctxNext.rotate(angle);
        ctxNext.translate((pos.d2.x-pos.d0.x)-pos.d0.x,-pos.d2.y);
        if(pos.d3.x == pos.d4.x && pos.d3.y == pos.d4.y){
            ctxNext.moveTo(pax,pos.d3.y);
            ctxNext.lineTo(pbx,pby);
            ctxNext.lineTo(pos.d0.x-(pos.d2.x-pos.d0.x),pos.d2.y);
            ctxNext.lineTo(pax,pos.d3.y);
        }else{
            ctxNext.moveTo(pax,pay);
            ctxNext.lineTo(pos.d0.x-(pos.d3.x-pos.d0.x),pos.d3.y);
            ctxNext.lineTo(pos.d0.x-(pos.d2.x-pos.d0.x),pos.d2.y);
            ctxNext.lineTo(pbx,pby);
        }
        ctxNext.clip();
        
        //method 2
        /*
        ctxNext.translate(pos.d0.x-(pos.d2.x-pos.d0.x),pos.d2.y);
        ctxNext.rotate(angle/90);
        ctxNext.translate((pos.d2.x-pos.d0.x)-pos.d0.x,-pos.d2.y);
        */
        //method 2
        ctxNext.drawImage(_self.pagesImage[_self.currentPage+1],pax,pax,_self.settings.shape.width,_self.settings.shape.height);
        
        //ctxNext.rotate(angle/90);
        var ctx = _self.context;
        var l=Math.cos(angle)*(pos.d0.x-(pos.d2.x-pos.d0.x)-pax);
        var t=pos.d0.x-(pos.d2.x-pos.d0.x)-pax-l;
        ctx.drawImage(_self.canvasNextPage[0],pos.d1.x-pax-t,0,_self.settings.stage.width,_self.settings.stage.height);
        ctxNext.restore();
    },
    //在右侧绘制当前页
    drawCurrentPage:function(curPage){
        var _self=this;
        var pos=_self.pos;
        var ctxNext=_self.contextNextPage;
        // Set the book's width and height. （设置书的宽和高）
        var stageW = _self.settings.shape.width;
        var stageH = _self.settings.shape.height;
        // Set reference points' position （设置参考点的位置）
        var pax=_self.pos.d0.x - stageW/2;
        var pay=_self.pos.d0.y - stageH/2;
        var pbx=_self.pos.d0.x - stageW/2;
        var pby=_self.pos.d0.y + stageH/2;
        var pex=_self.pos.d0.x + stageW/2;
        var pey=_self.pos.d0.y - stageH/2;
        
        ctxNext.clearRect(0, 0, _self.settings.stage.width, _self.settings.stage.height);
        ctxNext.beginPath();
        ctxNext.save();
        if(pos.d3.x == pos.d4.x && pos.d3.y == pos.d4.y){
            ctxNext.moveTo(pax,pay);
            ctxNext.lineTo(pex,pey);
            ctxNext.lineTo(pos.d3.x,pos.d3.y);
            ctxNext.lineTo(pos.d2.x,pos.d2.y);
            ctxNext.lineTo(pbx,pby);
            ctxNext.lineTo(pax,pay);
        }else{
            ctxNext.moveTo(pax,pay);
            ctxNext.lineTo(pos.d3.x,pos.d3.y);
            ctxNext.lineTo(pos.d2.x,pos.d2.y);
            ctxNext.lineTo(pbx,pby);
            ctxNext.lineTo(pax,pay);
        }
        ctxNext.clip();
        ctxNext.drawImage(_self.pagesImage[_self.currentPage],pax,pax,_self.settings.shape.width,_self.settings.shape.height);
        ctxNext.restore();
        
        var ctx = _self.context;
        ctx.drawImage(_self.canvasNextPage[0],0,0,_self.settings.stage.width,_self.settings.stage.height);
    },
    drawCover:function(){
        var _self=this;
        var image = new Image();
        var ctx = _self.context;
        // Set the book's width and height. （设置书的宽和高）
        var stageW = _self.settings.shape.width;
        var stageH = _self.settings.shape.height;
        // Set reference points' position （设置参考点的位置）
        var pax=_self.pos.d0.x - stageW/2;
        var pay=_self.pos.d0.y - stageH/2;
        
        ctx.drawImage(_self.pagesImage[0],pax,pax,_self.settings.shape.width,_self.settings.shape.height);
    },
    
    
    /****************************************************************************************************/
    /*                                                  算法核心                                        */
    /****************************************************************************************************/
    
    
    //获取D2，D3，D4点位，算法核心
    getD234:function(){
        var _self=this;
        // Set the book's width and height. （设置书的宽和高）
        var stageW = _self.settings.shape.width;
        var stageH = _self.settings.shape.height;
        // Set reference points' position （设置参考点的位置）
        var pax=_self.pos.d0.x - stageW/2;
        var pay=_self.pos.d0.y - stageH/2;
        
        var pbx=_self.pos.d0.x - stageW/2;
        var pby=_self.pos.d0.y + stageH/2;
        
        var pcx=_self.pos.d0.x;
        var pcy=_self.pos.d0.y - stageH/2;
        
        var pdx=_self.pos.d0.x;
        var pdy=_self.pos.d0.y + stageH/2;
        
        var pex=_self.pos.d0.x + stageW/2;
        var pey=_self.pos.d0.y - stageH/2;
        
        var pfx=_self.pos.d0.x + stageW/2;
        var pfy=_self.pos.d0.y + stageH/2;
        
        //限定D1在shape内 , 即图书的边境内
        if(_self.pos.d1.x < pax){
            _self.pos.d1.x = pax;
        }
        if(_self.pos.d1.x > pex){
            _self.pos.d1.x = pex;
        }
        if(_self.pos.d1.y < pay){
            _self.pos.d1.y = pay;
        }
        if(_self.pos.d1.y > pfy){
            _self.pos.d1.y = pfy;
        }
        
        
        //限定D1在半径内,合理的翻书可能性
        var df = pfx - pdx;
        var jk = pfy - _self.pos.d1.y;
        var dk = df -(pfx - _self.pos.d1.x);
        if(dk*dk + jk*jk > df * df){
           jk = Math.sqrt(Math.pow(df, 2) - Math.pow(dk, 2));
           _self.pos.d1.y = pfy -jk;
        }
        
        
        //获取个点位间距离
        var d1f= _self.getDist( pfx, pfy, _self.pos.d1.x,_self.pos.d1.y);
        var d1n=pfy-_self.pos.d1.y;
        var nf=pfx-_self.pos.d1.x;
        
        var fo=d1f/2;
        var d2o=fo*d1n/nf;
        
        var d2f=d2o*d1f/d1n;
        
        var sf=d2f*nf/d1n;
        var to=d1n/2;
        var tf=nf/2;
        
        //设置坐标
        _self.pos.d2.x = pfx-tf;
        _self.pos.d2.y = pfy;
        
        _self.pos.d3.x = pfx;
        _self.pos.d3.y = pfy - sf;
        
        
        _self.pos.d4.x = pfx;
        _self.pos.d4.y = pfy - sf;
        
        //d1超出下边界
        if(_self.pos.d1.y >= pfy){
            _self.pos.d2.x = (pfx-_self.pos.d1.x)/2 + _self.pos.d1.x;
            _self.pos.d2.y = pfy;
            
            _self.pos.d3.x = (pfx-_self.pos.d1.x)/2 + _self.pos.d1.x;
            _self.pos.d3.y = pey;
            
            
            _self.pos.d4.x = _self.pos.d1.x;
            _self.pos.d4.y = pey;
        }
        //d3,d4 上侧超出边界
        if (_self.pos.d3.y < pey){
            var ef = pfy - pey;
            var se = sf - ef;
            var d3e = se * d2f / sf;
            
            var sr = _self.pos.d1.y - (pfy - sf);
            var d4z = ef * sr / sf;
            var d1r = pfx - _self.pos.d1.x;
            var d1z = d4z * d1r / sr;
            
            _self.pos.d4.x = _self.pos.d1.x + d1z;
            _self.pos.d4.y = _self.pos.d1.y - d4z;
            
            
            _self.pos.d3.x = pex - d3e ;
            _self.pos.d3.y = pey ;
        }
        
        
        //d1d2 > d2f时 需要修正算法
        var d1d2=_self.getDist( _self.pos.d1.x,_self.pos.d1.y, _self.pos.d2.x,_self.pos.d2.y);
        var d2f = pfx - _self.pos.d2.x;
        if(d1d2 > d2f){
            var d1o = d1f/2 ;
            var d1q = pfx - _self.pos.d1.x;
            var qf = pfy - _self.pos.d1.y;
            var d3o = d1o * d1q /qf;
            var d3f = d1o * d1f / qf;
            
            var d2f = d3f * d1o /d3o;
            _self.pos.d2.x = pfx - d2f;
            _self.pos.d2.y = pfy;
        }
        
        
        //移动到头了
        if(_self.pos.d4.x<=pax && _self.pos.d4.y <=pay){
            return true;
        }else{
            return false;
        }
    },
    //获取两个坐标的距离
    getDist:function(px1, py1, px2, py2) {
        x = px2 - px1;
        y = py2 - py1;
        hyp = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        return hyp;
    },
    getAngle:function(px1, py1, px2, py2) {
    x = px2 - px1;
    y = py2 - py1;

    hyp = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));

    cos = x / hyp;
    rad = Math.acos(cos);
    return rad;
    deg = 180 / (Math.PI / rad);
    //是的，我们通过cos得到了一个角度“rad”，不过是以弧度为单位的
    //因此，我们需要再进一步把它转换成我们所需要的标准的角度
    if (y < 0) {
        deg = -deg;
    } else if ((y == 0) && (x < 0)) {
        deg = 180;
    }
    return deg;
    },
    //初始化每页的图片
    initBook:function(){
        var _self = this;
        var pages = _self.settings.pages;
        _self.pagesImage = [];
        for(var i = 0, j = pages.length; i<j ; i++){
            _self.pagesImage[i] = new Image();
            _self.pagesImage[i].src = pages[i];
            _self.pagesImage[i].onload=function(){
                _self.loadedImage++;
            }
        }
        _self.checkLoaded=setInterval(function(){
            if(_self.loadedImage == pages.length){
                clearInterval(_self.checkLoaded);
                _self.ifLoaded=true;
            }
        },500);
    }

};
book.initCanvas({
    canvas:$("#background"),
    canvasNextPage:$("#page1"),
    canvasNextNextPage:$("#page2"),
    pos:{
        "d0":{
            "x":600,
            "y":400
        }
    },
    stage:{
        width:1200,
        height:800
    },
    shape:{
        width:1000,
        height:600
    },
    margin:{
        "left":50,
        "top":50,
        "right":50,
        "bottom":50
    },
    pages:['1.jpg','2.jpg','3.jpg','4.jpg','5.jpg','6.jpg']
});
/*
var ctx=document.getElementById("background").getContext('2d');
var image = new Image();
image.src='1.jpg';
image.onload=function(){
    ctx.beginPath();
    ctx.moveTo(75,50);
    ctx.lineTo(100,75);
    ctx.lineTo(100,25);
    ctx.lineTo(75,50);
    ctx.clip();
    ctx.drawImage(image,0,0);
    //ctx.stroke();
}
*/