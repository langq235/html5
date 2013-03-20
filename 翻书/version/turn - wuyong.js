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
    settings:{},
    pos:{
        "d0":{},
        "d1":{},
        "d2":{},
        "d3":{},
        "d4":{}
    },
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
        //在右侧绘制封面（整个平面的右1/2）
        
        _self.drawBackground();
        _self.bindPointer();
    },
    nextPage:function(){//自动下一页
    },
    prePage:function(){//自动前一页
    },
    moveingToNextPage:function(pointer){
        //绘制图书
    },
    moveingToPrePage:function(pointer){
        //绘制图书
    },
    bindPointer:function(){//触发向前、向后，并获取鼠标信息
        var _self=this;
        _self.canvas.bind("mousedown",function(e){
            if(_self.mouseDragging){
                return false;
            }
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
        _self.getPosition(e);
        _self.getD234();
        _self.drawNextPage();
        _self.draw();
    },
    //绘制canvas
    draw:function(){
        //直接在右侧绘制出4个点位，测试是否正确。
        var _self=this;
        var pos=_self.pos;
        var ctx=_self.context;
        ctx.beginPath();
        ctx.clearRect(0, 0, _self.shape.width, _self.shape.height);
        ctx.moveTo(pos.d1.x,pos.d1.y);
        ctx.lineTo(pos.d2.x,pos.d2.y);
        ctx.lineTo(pos.d3.x,pos.d3.y);
        ctx.lineTo(pos.d4.x,pos.d4.y);
        ctx.lineTo(pos.d1.x,pos.d1.y);
        ctx.stroke();
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
    //绘制左侧，右侧
    drawBackground:function(){
        var _self=this;
        _self.canvas.css("background","#333366");
        return;
        var image = new Image();
        image.src=_self.pages[0];
        image.onload=function(){
            _self.context.drawImage(image,_self.shape.width/2,0,_self.shape.width/2,_self.shape.height);
        }
    },
    //在右侧绘制下一页 角
    drawNextPage:function(curPage){
        
    },
    //在右侧绘制下下一页 角
    drawNextNextPage:function(curPage){
    },
    //获取D2，D3，D4点位
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
        
        len = _self.getDist( pfx, pfy, _self.pos.d1.x,_self.pos.d1.x);
        len1 = len/2;
        len2 = (pfx - _self.pos.d1.x)/2;
        
        _self.pos.d2.x = pfx - len1*len1/len2;
        _self.pos.d2.y = pfy;
        
        len2 = (pfy - _self.pos.d1.y)/2;
        len3 = len1*len1/len2;
        
        _self.pos.d3.x = pfx;
        _self.pos.d3.y = pfy - len3;
        
        // 检查D4是否和D3在同一个位置
        if (_self.pos.d3.y < pey){
            var ptx = pex - (pfx - _self.pos.d2.x)*(pey - _self.pos.d3.y)/len3;
            var pty = pey;
            
            len = _self.getDist(_self.pos.d3.x, _self.pos.d3.y, ptx, pty);
            len1 = (pex - ptx)*(pey - _self.pos.d3.y)/len;
            
            len2 = len1*len1/(pex - ptx);
            _self.pos.d4.x = pex - len2*2;
            
            len2 = len1*len1/(pey - _self.pos.d3.y);
            _self.pos.d4.y = pey - len2*2;
            
            _self.pos.d3.x = ptx;
            _self.pos.d3.y = pty;
        } else {
            _self.pos.d4.x = _self.pos.d3.x;
            _self.pos.d4.y = _self.pos.d3.y;
        }
    },
    getDist:function(px1, py1, px2, py2) {
        x = px2 - px1;
        y = py2 - py1;
        hyp = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        return hyp;
    }

};
book.initCanvas({
    canvas:$("#background"),
    canvasNextPage:$("#page1"),
    canvasNextNextPage:$("#page2"),
    page:10,
    pos:{
        "d0":{
            "x":500,
            "y":300
        }
    },
    stage:{
        width:1000,
        height:600
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