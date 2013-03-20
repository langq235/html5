//------------------------//
//- 基础方法 -/
//------------------------//


//- 指针，用于控制书 ， 没用  -/
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
    isInHotPoint:null,//热区标记，通过那个热区激活翻页
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
    ifNext:false,//判断是否进入下一页
    //初始化画布，主初始化
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
        _self.initStage();
        //在右侧绘制封面（整个平面的右1/2）
        
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
    //初始化场景，设置pax,pay等等
    initStage:function(){
        var _self = this;
        // Set the book's width and height. （设置书的宽和高）
        var bookW = _self.settings.shape.width;
        var bookH = _self.settings.shape.height;
        // Set reference points' position （设置参考点的位置）
        var pax = _self.pos.d0.x - bookW/2;
        var pay = _self.pos.d0.y - bookH/2;
        var pbx = _self.pos.d0.x - bookW/2;
        var pby = _self.pos.d0.y + bookH/2;
        var pcx = _self.pos.d0.x;
        var pcy = _self.pos.d0.y - bookH/2;
        var pdx = _self.pos.d0.x;
        var pdy = _self.pos.d0.y + bookH/2;
        var pex = _self.pos.d0.x + bookW/2;
        var pey = _self.pos.d0.y - bookH/2;
        var pfx = _self.pos.d0.x + bookW/2;
        var pfy = _self.pos.d0.y + bookH/2;
        _self.stage = {
            "bookW":bookW,
            "bookH":bookH,
            "pax":pax,
            "pay":pay,
            "pbx":pbx,
            "pby":pby,
            "pcx":pcx,
            "pcy":pcy,
            "pdx":pdx,
            "pdy":pdy,
            "pex":pex,
            "pey":pey,
            "pfx":pfx,
            "pfy":pfy
        }
    },
    
    //以下四个方法可能都不需要了，修改moveCanvas的实现，以通用自动翻页
    //自动下一页
    nextPage:function(){
    },
    //自动前一页
    prePage:function(){
    },
    //恢复到原始 - 鼠标在右侧
    resetFromRight:function(){
        
    },
    //恢复到原始 - 鼠标在左侧
    resetFromLeft:function(){
    },
    autoChangePage:function(){//接收一个参数，判断热区来源，保留，未开发
        var _self = this; 
        var pos = _self.pos;
        var stage = _self.stage;
        var pax = stage.pax , pay = stage.pay , pbx = stage.pbx , pby = stage.pby , pcx = stage.pcx , pcy = stage.pcy,
        pdx = stage.pdx , pdy = stage.pdy , pex = stage.pex , pey = stage.pey , pfx = stage.pfx , pfy = stage.pfy;
        if(_self.isInHotPoint == 3){ //右下角激活
            if(pos.d1.x > pcx){
                _self.resetFromRight();
            }else{
                _self.nextPage();
            }
        }
    },
    //移动至下一页
    moveingToNextPage:function(pointer){
        //设置各项参数
        var _self = this;
        _self.draggingAble = false;
        _self.canvas.unbind("mousemove");
        _self.mouseDragging=false;
        _self.currentPage++;
    },
    //移动至上一页
    moveingToPrePage:function(pointer){
        //设置各项参数
    },
    checkHotPoint:function(){//判断是否在激活区域
        var _self = this; 
        var pos = _self.pos;
        var cushion = 50; //热区范围
        var stage = _self.stage;
        var pax = stage.pax , pay = stage.pay , pbx = stage.pbx , pby = stage.pby , pcx = stage.pcx , pcy = stage.pcy,
        pdx = stage.pdx , pdy = stage.pdy , pex = stage.pex , pey = stage.pey , pfx = stage.pfx , pfy = stage.pfy;
        var hotPoint = [
        [pax,pay,pax +cushion, pay +cushion],
        [pex-cushion,pey,pex , pey + cushion],
        [pbx,pby,pbx+cushion,pby-cushion],
        [pfx -cushion , pfy - cushion , pfx,pfy]
        ];
        for(var i = 0 ; i<4 ;i++){
            if(pos.d1.x > hotPoint[i][0] && pos.d1.y > hotPoint[i][1] 
                && pos.d1.x < hotPoint[i][2] && pos.d1.y < hotPoint[i][3]
            ){
                return i;
            }
        }
        return 0;
    },
    bindPointer:function(){//触发向前、向后，并获取鼠标信息
        var _self=this;
        _self.canvas.bind("mousedown",function(e){
            if(_self.mouseDragging){
                return false;
            }
            //在特定区域内（四个角）时激活拖拽
            _self.getPosition(e);//获取D1坐标
            _self.isInHotPoint= _self.checkHotPoint();
            if(_self.isInHotPoint==0){
                return false;
            }
            _self.draggingAble = true;
            
            _self.mousedownCanvas(e);
            _self.canvas.bind("mousemove",function(f){
                _self.mouseDragging=true;
                _self.moveCanvas(f);
            });
            _self.canvas.bind("mouseup",function(e){
                _self.canvas.unbind("mousemove");
                _self.mouseupCanvas(e);
                if(_self.ifNext){
                    _self.moveingToNextPage();
                    _self.mouseDragging=false;
                }else{
                    _self.autoChangePage();
                    _self.mouseDragging=false;
                }
                _self.canvas.unbind("mouseup");
            });
        });
    },
    //鼠标按下时的响应
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
        var ifNext=_self.getD234(3);//获取D234坐标，并判断是否移动到下一页
        var ifDraw=_self.draw();//绘制图书,并判断是否有下一页
        if(ifNext){//移动到下一页
            _self.ifNext=true;
            //_self.moveingToNextPage();
        }else{
            _self.ifNext=false;
        }
        if(!ifDraw){//最后一页了
            _self.lastPage();
            return false;
        }
    },
    //到达最后一页
    lastPage:function(){
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
        var pos=_self.pos;
        var ctx=_self.context;
        
        ctx.beginPath();
        ctx.moveTo(pos.d1.x,pos.d1.y);
        ctx.lineTo(pos.d2.x,pos.d2.y);
        ctx.lineTo(pos.d3.x,pos.d3.y);
        ctx.lineTo(pos.d4.x,pos.d4.y);
        ctx.lineTo(pos.d1.x,pos.d1.y);
        ctx.stroke();
        return true;
    },
    //鼠标松开时的响应
    mouseupCanvas:function(e){
    },
    //通过鼠标获取D1坐标
    getPosition:function(e){
        var _self=this;
        var offset=_self.canvas.offset();
        var x=e.pageX-offset.left;
        var y=e.pageY-offset.top;
        _self.pos.d1.x=x;
        _self.pos.d1.y=y;
    },
    //自动获取D1坐标（补全用户操作时调用）
    getPositionAuto:function(pos){
        var _self = this;
        _self.pos.d1.x=pos.x;
        _self.pos.d1.y=pos.y;
    },
    //绘制第三页
    drawNextNextPage:function(){
        var _self=this;
        var stage = _self.stage;
        
        _self.context.clearRect(0, 0, _self.settings.stage.width, _self.settings.stage.height);
        //每页为1/2书宽，注释掉，未采用
        //_self.context.drawImage(_self.pagesImage[_self.currentPage+2],pcx,pcy,_self.settings.shape.width/2,_self.settings.shape.height);
        //每页为100%书宽
        _self.context.drawImage(_self.pagesImage[_self.currentPage+1],stage.pax,stage.pay,_self.settings.shape.width,_self.settings.shape.height);
    },
    //在右侧绘制下一页 角
    drawNextPage:function(curPage){
        var _self=this;
        var nextOffset = _self.settings.nextOffset;
        var stage = _self.stage;
        var pos=_self.pos;
        var mark = 1 ; //控制角度方向
        if(pos.d1.y > stage.pfy){
            mark = -1;
        }
        var angle = mark * _self.getAngle(pos.d1.x,pos.d1.y,pos.d2.x,pos.d2.y);//将下一页的角翻转的角度
        var ctxNext=_self.contextNextPage;
        //清空
        ctxNext.clearRect(0, 0, _self.settings.stage.width + nextOffset.x, _self.settings.stage.height);
        ctxNext.beginPath();
        ctxNext.save();
        //移动重心到下一页的左侧相对于D2的位置
        ctxNext.translate(pos.d0.x-(pos.d2.x-pos.d0.x) + nextOffset.x,pos.d2.y);
        //旋转
        ctxNext.rotate(angle);
        //将重心回归0点
        ctxNext.translate((pos.d2.x-pos.d0.x)-pos.d0.x - nextOffset.x,-pos.d2.y);
        
        //D3D4重合的情况
        if(pos.d3.x == pos.d4.x && pos.d3.y == pos.d4.y){
            ctxNext.moveTo(stage.pax + nextOffset.x,pos.d3.y);
            ctxNext.lineTo(stage.pbx + nextOffset.x,stage.pby);
            ctxNext.lineTo(pos.d0.x-(pos.d2.x-pos.d0.x) + nextOffset.x,pos.d2.y);
            ctxNext.lineTo(stage.pax + nextOffset.x,pos.d3.y);
        }else{
            ctxNext.moveTo(stage.pax + nextOffset.x,stage.pay);
            ctxNext.lineTo(pos.d0.x-(pos.d3.x-pos.d0.x) + nextOffset.x,pos.d3.y);
            ctxNext.lineTo(pos.d0.x-(pos.d2.x-pos.d0.x) + nextOffset.x,pos.d2.y);
            ctxNext.lineTo(stage.pbx + nextOffset.x,stage.pby);
        }
        //剪切路径
        ctxNext.clip();
        //绘图
        ctxNext.drawImage(_self.pagesImage[_self.currentPage+1],stage.pax + nextOffset.x,stage.pay,_self.settings.shape.width,_self.settings.shape.height);
        
        //将临时图形绘制到主画布
        var ctx = _self.context;
        var l=Math.cos(angle)*(pos.d0.x-(pos.d2.x-pos.d0.x)-stage.pax);
        var t=pos.d0.x-(pos.d2.x-pos.d0.x)-stage.pax-l;
        ctx.drawImage(_self.canvasNextPage[0],pos.d1.x-stage.pax-t - nextOffset.x,0,_self.settings.stage.width + nextOffset.x,_self.settings.stage.height);
        ctxNext.restore();
    },
    //在右侧绘制当前页
    drawCurrentPage:function(curPage){
        var _self=this;
        var nextOffset = _self.settings.nextOffset;
        var stage = _self.stage;
        var pos=_self.pos;
        var ctxNext=_self.contextNextPage;
        
        ctxNext.clearRect(0, 0, _self.settings.stage.width + nextOffset.x, _self.settings.stage.height);
        ctxNext.beginPath();
        ctxNext.save();
        if(pos.d3.x == pos.d4.x && pos.d3.y == pos.d4.y){
            ctxNext.moveTo(stage.pax + nextOffset.x,stage.pay);
            ctxNext.lineTo(stage.pex + nextOffset.x,stage.pey);
            ctxNext.lineTo(pos.d3.x + nextOffset.x,pos.d3.y);
            ctxNext.lineTo(pos.d2.x + nextOffset.x,pos.d2.y);
            ctxNext.lineTo(stage.pbx + nextOffset.x,stage.pby);
            ctxNext.lineTo(stage.pax + nextOffset.x,stage.pay);
        }else{
            ctxNext.moveTo(stage.pax + nextOffset.x,stage.pay);
            ctxNext.lineTo(pos.d3.x + nextOffset.x,pos.d3.y);
            ctxNext.lineTo(pos.d2.x + nextOffset.x,pos.d2.y);
            ctxNext.lineTo(stage.pbx + nextOffset.x,stage.pby);
            ctxNext.lineTo(stage.pax + nextOffset.x,stage.pay);
        }
        ctxNext.clip();
        ctxNext.drawImage(_self.pagesImage[_self.currentPage],stage.pax + nextOffset.x,stage.pay,_self.settings.shape.width,_self.settings.shape.height);
        ctxNext.restore();
        
        var ctx = _self.context;
        ctx.drawImage(_self.canvasNextPage[0],-nextOffset.x,0,_self.settings.stage.width + nextOffset.x,_self.settings.stage.height);
    },
    drawCover:function(){
        var _self=this;
        var image = new Image();
        var ctx = _self.context;
        var stage = _self.stage;
        
        ctx.drawImage(_self.pagesImage[0],stage.pax,stage.pax,_self.settings.shape.width,_self.settings.shape.height);
    },
    
    
    /****************************************************************************************************/
    /*                                                  算法核心                                        */
    /****************************************************************************************************/
    
    
    //获取D2，D3，D4点位，算法核心
    //参数：1/2/3/4 , 左上，右上，右下，左下。 传递一个标记，采用不同方式移动页面
    //todo : 边界限定 ， 以及判定顺序
    getD234:function(p){
        var _self=this;
        var stage = _self.stage;
        var pax = stage.pax , pay = stage.pay , pbx = stage.pbx , pby = stage.pby , pcx = stage.pcx , pcy = stage.pcy,
        pdx = stage.pdx , pdy = stage.pdy , pex = stage.pex , pey = stage.pey , pfx = stage.pfx , pfy = stage.pfy;
        
        //限定D1在shape内 , 即图书的边境内
        if(_self.pos.d1.x < pax){
            _self.pos.d1.x = pax;
        }
        if(_self.pos.d1.x > pfx){
            _self.pos.d1.x = pfx-1; //-1为避免计算问题。。或bug。。
        }
        /*
        if(_self.pos.d1.y < pay){
            _self.pos.d1.y = pay;
        }
        if(_self.pos.d1.y > pfy){
            _self.pos.d1.y = pfy;
        }
        */
        if( _self.pos.d1.y <= pfy ){//右下角在书边框内
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
        
        }else{//右下书角在边框下侧 ， 即p1y > pfy
            //限定D1在半径内,合理的翻书可能性
            var d1g = _self.pos.d1.x - pdx ;
            var cg = _self.pos.d1.y - pcy;
            var cf = _self.getDist( pcx, pcy, pfx , pfy);
            var d1c = _self.getDist( pcx, pcy, _self.pos.d1.x,_self.pos.d1.y);
            if( d1c > cf ){
                cg = Math.sqrt(Math.pow(cf, 2) - Math.pow(d1g, 2));
            }
            _self.pos.d1.y = pcy + cg;
            
            var d1f= _self.getDist( pfx, pfy, _self.pos.d1.x,_self.pos.d1.y);
            var fo=d1f/2;
            var mf=pfx-_self.pos.d1.x;
            
            var d2f = fo * d1f / mf;
            
            var d1m = _self.pos.d1.y - pfy;
            var d2o = d2f * d1m / d1f;
            
            var fs = fo * d2f / d2o;
            
            var d1d2 = d2f;//相等，表示一下
            var d1d4 = pfy - pey ;
            var d2m = pfx - d2f - _self.pos.d1.x;
            var d1n = d1m * d2f / d2m ;
            var d1r = d1m * d1d4 /d1n ;
            var mn=d1m * d1n /d2f;
            var d4r = d1d4 * mn /d1n ;
            
            var d1s = fo * d1d2 /d2o;
            var fs = d1s;
            var ef = d1d4;
            var es = fs + ef ;
            var d3e = d2f * es /fs;
            
            //设置点位
            
            _self.pos.d2.x = pfx - d2f ;
            _self.pos.d2.y = pfy ;
            _self.pos.d3.x = pex - d3e ;
            _self.pos.d3.y = pey ;
            _self.pos.d4.x = _self.pos.d1.x - d4r ;
            _self.pos.d4.y = _self.pos.d1.y - d1r ;
            
        }
        //移动到头了
        if(Math.floor(_self.pos.d4.x)<=pax && Math.floor(_self.pos.d4.y) <=pay){
            return true;
        }else{
            return false;
        }
    },
    getD234From3:function(){
    },
    //获取两个坐标的距离
    getDist:function(px1, py1, px2, py2) {
        x = px2 - px1;
        y = py2 - py1;
        hyp = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        return hyp;
    },
    //获取角度
    getAngle:function(px1, py1, px2, py2) {
        x = px2 - px1;
        y = py2 - py1;
        hyp = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        cos = x / hyp;
        rad = Math.acos(cos);
        return rad;//采用此弧度
        
        //以下转换为标准角度，不采用
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
        },500);//定时检测图片是否加载完成
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
    pages:['1.jpg','2.jpg','3.jpg','4.jpg','5.jpg','6.jpg'],
    nextOffset:{
        "x":600
    }
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