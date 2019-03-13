/*
 *  Date: 2017-07-27
 *	Author: hanshuai
 */
import $ from  'jquery'
import { canvasUpload} from '../../fetch/homework-report/homework-report';
import './style.less'
const loginToken=localStorage.getItem("loginToken");
//标记拖拽函数
export function dragBind(thisObj, _this, ev,subtopicId){//obj:拖拽的对象;_this:拖拽范围
    var box = _this,
    	opW = box.width(),
    	opH = box.height(),
		objW = thisObj.outerWidth(),
		objH = thisObj.outerHeight(),
		maxDragWidth = opW-objW,
		maxDrgHeight = opH - objH,
		disX = ev.clientX - parseInt(thisObj.css('left')),
    	disY = ev.clientY - parseInt(thisObj.css('top')),
    	downtime,uptime;
	ev = ev || event;
    ev.nativeEvent.stopPropagation();
    ev.nativeEvent.preventDefault();
    if (thisObj.setCapture) {//打断图片拖拽
        thisObj.setCapture();
    }
    //长按删除
    /*var longDelete = setTimeout (function (){
    	thisObj.remove();
    	//保存标记接口
		saveMark(subtopicId,hwdataService);
    },2000);
    var date1 = new Date()
    downtime = date1.getTime();*/
    document.onmousemove = function (ev) {

    	//clearTimeout(longDelete)
        ev = ev || event;       
        ev.stopPropagation();
		var l=ev.clientX - disX;
		var t=ev.clientY - disY;
		if(!thisObj.hasClass('arrow')){
			console.log('距离',l,t,maxDragWidth,maxDrgHeight)
			if(l<=0){//限制拖拽范围
				l=0;
			}else if(l>=maxDragWidth){
				l=maxDragWidth;
			}
			if(t<=0){
				t=0;
			}
			else if(t>=maxDrgHeight){
			    t=maxDrgHeight;
			}
		}else{
			console.log('距离',thisObj)
			if(thisObj.hasClass('first-quadrant')){//第一象限
				if(l<=0){//限制拖拽范围
					l=0;
				}else if(l>=maxDragWidth){
					l=maxDragWidth;
				}
				if(t<=objH+(objH*0.2)){
					t=objH+(objH*0.2);
				}
				else if(t>=opH){
				    t=opH;
				}
			}else if(thisObj.hasClass('second-quadrant')){//第二象限
				if(l<=0){//限制拖拽范围
					l=0;
				}else if(l>=maxDragWidth){
					l=maxDragWidth;
				}
				if(t<=0){
					t=0;
				}
				else if(t>=maxDrgHeight-(maxDrgHeight*0.2)){
				    t=maxDrgHeight-(maxDrgHeight*0.2);
				}
			}else if(thisObj.hasClass('third-quadrant')){//第三象限
				if(l<=objW+(objW*0.2)){//限制拖拽范围
					l=objW+(objW*0.2);
				}else if(l>=opW){
					l=opW;
				}
				if(t<=0){
					t=0;
				}
				else if(t>=maxDrgHeight-(maxDrgHeight*0.1)){
				    t=maxDrgHeight-(maxDrgHeight*0.1);
				}
			}
			else if(thisObj.hasClass('fourth-quadrant')){//第四象限
				if(l<=objW+(objW*0.3)){//限制拖拽范围
					l=objW+(objW*0.3);
				}else if(l>=opW){
					l=opW;
				}
				if(t<=objH+(objH*0.1)){
					t=objH+(objH*0.1);
				}
				else if(t>=opH){
				    t=opH;
				}
			}
			
			/*if(ev.clientX <= box.offset().left){
				l=0;
			}else if(ev.clientX >= box.offset().left+opW){
				l=opW;
			}
			if(ev.clientY <= box.offset().top){
				t=objH;
			}else if(ev.clientY >= box.offset().top+opH){
				t=opH;
			}*/
		}
        thisObj.css({'top':t,'left':l});
		let oldTop = parseInt(thisObj.css('top'));
        let oldLeft = parseInt(thisObj.css('left'));
        let nTop = parseInt((oldTop / opH) * 100) + "%";
        let nLeft = parseInt((oldLeft / opW) * 100) + "%";
        //拖拽确定之后给拖拽元素赋值
        thisObj.css({'top':nTop,'left':nLeft});
    }
    document.onmouseup = function () {
    	/*var date2 = new Date();
        uptime = date2.getTime();
        if(uptime - downtime < 2000){//时间小于2秒,取消删除
            clearTimeout(longDelete); 
        }*/
            	// alert(11)
        document.onmousemove = document.onmouseup = null;
        //释放全局捕获 releaseCapture();
        try {
            thisObj.releaseCapture();
        } catch (ex) {}
    }
    return false;
}
export function markFun(obj, markType, ev, subtopicid,markNum){//obj：创建目标盒子;markType：当前标记类型
	var _this=obj,
		thisType = markType,//当前标记类型
		offleft = _this.offset().left,
		offtop = _this.offset().top,
		x1=ev.pageX - offleft,//鼠标起点x的坐标
		x2=0,
		y1=ev.pageY - offtop,//鼠标起点y的坐标
		y2=0,
		opW = _this.width(),
		opH = _this.height(),
		oMark = document.createElement('span'),
		wx = parseInt((x1/opW) * 100) + "%",
		wy = parseInt((y1/opH) * 100) + "%",
		dX=0,
		dY=0;
	ev = ev || event;
	//this.setCapture && this.setCapture();//全局捕获，消除图片的默认拖拽效果。
	oMark.className = thisType+' span_mark';
	oMark.setAttribute('belongto-subtopicid',subtopicid);
	oMark.setAttribute('this-type',thisType);
	oMark.setAttribute('marknum',markNum);
	//oMark.setAttribute('title','长按标记2秒，删除此标记');
	oMark.style.position = 'absolute';
	oMark.style.left = wx;
	oMark.style.top = wy;
	_this.append(oMark);//插入标记
	//添加选框-移动
	$('.span_mark').on('click',function(){
        var _this=$(this);
            if(_this.hasClass('on')){
                _this.removeClass('on');
            }else{
                _this.addClass('on').siblings().removeClass('on');
            }
    })
    //move
	$(document).mousemove(function (ev){
		ev = ev || event;
	    x2 = ev.pageX - offleft;//鼠标落点x的位置。
	    y2 = ev.pageY-offtop;//鼠标落点y的位置。
	    /*var currentPage	= testPaperScroll.currentPage.pageX;
		var width=$('.hw-yj-img-icon').eq(currentPage).width(),
	    	height=$('.hw-yj-img-icon').eq(currentPage).height();*/
		var width=$('.hw-yj-img-icon').width(),
	    	height=$('.hw-yj-img-icon').height();
	    	console.log('坐标',x1,x2)
	    //限制范围
		if(x2<0 || x2>width || y2<0 || y2>height){ 
			$(document).off('mousemove');//移除move事件。
			$(document).off('click');//移除click事件。
			$('.hw-yj-save-mark').addClass('active');//声明还有未保存的标记
			return false;
		}
	    if(thisType=="right" || thisType=='half-right' || thisType=='error' || thisType=='rectangle' || thisType=='circle'){//不需要旋转的情况
	        dX=Math.abs(parseFloat(x2-x1));//起，落点x的距离差。
	        dY=Math.abs(parseFloat(y2-y1));//起，落点y的距离差。
	        if(x2>x1&&y2>y1){//根据鼠标从四个不同方向绘制进行不同的绘制定位。(左上往右下)第三象限
	            oMark.style.left=wx;
	            oMark.style.top=wy;
	        }else if(x2<x1&&y2>y1){//(右上往左下)第四象限
	            oMark.style.left=((x1-dX)/opW)*100+'%';
	            oMark.style.top=wy;
	        }else if(x2>x1&&y2<y1){//(左下往右上)第一象限
	            oMark.style.left=wx;
	            oMark.style.top=((y1-dY)/opH)*100+'%';
	        }else if(x2<x1&&y2<y1){//(右下往左上)第二象限
	            oMark.style.left=((x1-dX)/opW)*100+'%';
	            oMark.style.top=((y1-dY)/opH)*100+'%';
	        }
	        if(thisType=='rectangle' || thisType=='circle'){//矩形
	        	var wid = dX/opW,
                    heig = dY/opH;
                if(wid == 0){
                    oMark.style.width=(0.03)*100+'%';
                }else{
                    oMark.style.width=(dX/opW)*100+'%';
                }
                if(heig == 0){
                    oMark.style.height=(0.03)*100+'%';
                }else{
                    oMark.style.height=(dY/opH)*100+'%';
                }
	        }else{
	            oMark.style.width=(dX/opW)*100+'%';
	            oMark.style.height=(dX/opH)*100+'%';
	            console.log('画图',oMark,oMark.style.width,dX,opW)
	        	console.log('画图',oMark,oMark.style.height,dX,opH)
	        }
	    }
	    else if(thisType=='arrow'){//可以旋转的情况
	        dX=x2-x1;
	        dY=y2-y1;
	        if(dX>0&&dY>0){
	        	oMark.className = thisType+' span_mark second-quadrant';
	            if(dX>dY){
	                oMark.style.width=(dX/opW)*100+'%';
	                oMark.style.height=(dX/opH)*100+'%';
	            }else if(dX<dY){
	                oMark.style.width=(dY/opW)*100+'%';
	                oMark.style.height=(dY/opH)*100+'%';
	            }
	            //使得旋转兼容不同的设备。
	            oMark.style.transform='rotate('+((Math.atan(dY/dX)*180/Math.PI)-45)+'deg)';
	            oMark.style['-0-transform']='rotate('+((Math.atan(dY/dX)*180/Math.PI)-45)+'deg)';
	            oMark.style['-ms-transform']='rotate('+((Math.atan(dY/dX)*180/Math.PI)-45)+'deg)';
	            oMark.style['-moz-transform']='rotate('+((Math.atan(dY/dX)*180/Math.PI)-45)+'deg)';
	            oMark.style['-webkit-transform']='rotate('+((Math.atan(dY/dX)*180/Math.PI)-45)+'deg)';
				oMark.style.WebkitTransform='rotate('+((Math.atan(dY/dX)*180/Math.PI)-45)+'deg)';
				
	        }
	        else if(dX<0&&dY>0){
	        	oMark.className = thisType+' span_mark third-quadrant';
	            if(-dX>dY){
	                oMark.style.width=(-dX/opW)*100+'%';
	                oMark.style.height=(-dX/opH)*100+'%';
	            }else if(-dX<dY){
	                oMark.style.width=(dY/opW)*100+'%';
	                oMark.style.height=(dY/opH)*100+'%';
	            }
	            oMark.style.transform='rotate('+(Math.atan(-dX/dY)*180/Math.PI+45)+'deg)';
	            oMark.style['-0-transform']='rotate('+(Math.atan(-dX/dY)*180/Math.PI+45)+'deg)';
	            oMark.style['-ms-transform']='rotate('+(Math.atan(-dX/dY)*180/Math.PI+45)+'deg)';
	            oMark.style['-moz-transform']='rotate('+(Math.atan(-dX/dY)*180/Math.PI+45)+'deg)';
	            oMark.style['-webkit-transform']='rotate('+(Math.atan(-dX/dY)*180/Math.PI+45)+'deg)';
				oMark.style.WebkitTransform='rotate('+(Math.atan(-dX/dY)*180/Math.PI+45)+'deg)';
	        }
	        else if(dX<0&&dY<0){
	        	oMark.className = thisType+' span_mark fourth-quadrant';
	            if(-dX>-dY){
	                oMark.style.width=(-dX/opW)*100+'%';
	                oMark.style.height=(-dX/opH)*100+'%';
	            }else if(-dX<-dY){
	                oMark.style.width=(-dY/opW)*100+'%';
	                oMark.style.height=(-dY/opH)*100+'%';
	            }
	            oMark.style.transform='rotate('+(-((Math.atan(dX/dY)*180/Math.PI)+135))+'deg)';
	            oMark.style['-0-transform']='rotate('+(-((Math.atan(dX/dY)*180/Math.PI)+135))+'deg)';
	            oMark.style['-ms-transform']='rotate('+(-((Math.atan(dX/dY)*180/Math.PI)+135))+'deg)';
	            oMark.style['-moz-transform']='rotate('+(-((Math.atan(dX/dY)*180/Math.PI)+135))+'deg)';
	            oMark.style['-webkit-transform']='rotate('+(-((Math.atan(dX/dY)*180/Math.PI)+135))+'deg)';
				oMark.style.WebkitTransform='rotate('+(-((Math.atan(dX/dY)*180/Math.PI)+135))+'deg)';
	        }
	        else if(dX>0&&dY<0){
	        	oMark.className = thisType+' span_mark first-quadrant';
	            if(dX>-dY){
	                oMark.style.width=(dX/opW)*100+'%';
	                oMark.style.height=(dX/opH)*100+'%';
	            }else if(dX<-dY){
	                oMark.style.width=(-dY/opW)*100+'%';
	                oMark.style.height=(-dY/opH)*100+'%';
	            }
	            oMark.style.transform='rotate('+((Math.atan(dX/-dY)*180/Math.PI)+225)+'deg)';
	            oMark.style['-0-transform']='rotate('+((Math.atan(dX/-dY)*180/Math.PI)+225)+'deg)';
	            oMark.style['-ms-transform']='rotate('+((Math.atan(dX/-dY)*180/Math.PI)+225)+'deg)';
	            oMark.style['-moz-transform']='rotate('+((Math.atan(dX/-dY)*180/Math.PI)+225)+'deg)';
	            oMark.style['-webkit-transform']='rotate('+((Math.atan(dX/-dY)*180/Math.PI)+225)+'deg)';
				oMark.style.WebkitTransform='rotate('+(-((Math.atan(dX/dY)*180/Math.PI)+135))+'deg)';
	        }
	    }
	})

	//up
	$('.hw-yj-img-icon').mouseup(function(ev){
		ev = ev||event;
	    x2=ev.pageX - offleft;//鼠标落点x的位置。
	    y2=ev.pageY - offtop;//鼠标落点y的位置。
	    $(document).off('mousemove');//移除move事件。
		$(document).off('click');//移除click事件。

		$('.hw-yj-save-mark').addClass('active');//声明还有未保存的标记
		//合成图片与标记
		//console.log('合成方法',canvasPrint())
	});
	//dragBind($(this).find('.span_mark'), $(this));//执行拖拽函数，oDiv1:拖拽的对象;$(this):拖拽范围
	return false;
	ev.nativeEvent.preventDefault()
}

//自定义评语操作
export function remarkFun(obj, markType, ev, subtopicid,markNum){//obj：创建目标盒子;markType：当前标记类型
	var _this=obj,
		thisType = markType,//当前标记类型
		offleft = _this.offset().left,
		offtop = _this.offset().top,
		x1=ev.pageX - offleft,//鼠标起点x的坐标
		x2=0,
		y1=ev.pageY - offtop,//鼠标起点y的坐标
		y2=0,
		opW = _this.width(),
		opH = _this.height(),
		oMark = document.createElement('span'),
		wx = parseInt((x1/opW) * 100) + "%",
		wy = parseInt((y1/opH) * 100) + "%",
		dX=0,
		dY=0,
		isSwitch=false;//控制评语框是否自动获取焦点
	ev = ev || event;
	//this.setCapture && this.setCapture();//全局捕获，消除图片的默认拖拽效果。
	oMark.className = thisType+' span_mark';
	oMark.setAttribute('belongto-subtopicid',subtopicid);
	oMark.setAttribute('this-type',thisType);
	oMark.setAttribute('marknum',markNum);
	oMark.setAttribute('contentEditable','true');

	
	//oMark.setAttribute('title','长按标记2秒，删除此标记');
	oMark.style.position = 'absolute';
	oMark.style.left = wx;
	oMark.style.top = wy;
	_this.append(oMark);//插入标记
	//添加选框-移动
	$('.remark').on('click',function(){
        var _this=$(this);
            if(_this.hasClass('on')){
                _this.removeClass('on');
            }else{
                _this.addClass('on').siblings().removeClass('on');
            }
            _this.removeClass('noborder');
            _this.siblings.addClass('noborder');
    })
    $('.remark').on('dblclick',function(){
        var _this=$(this);
            _this.removeClass('on');
            _this.focus();
    })
   /* $('.remark').on('blur',function(){
    	console.log('失去焦点',oMark)
            oMark.blur();
    })*/
    
    //move
	$(document).mousemove(function (ev){
		ev = ev || event;
	    x2 = ev.pageX - offleft;//鼠标落点x的位置。
	    y2 = ev.pageY-offtop;//鼠标落点y的位置。
	    /*var currentPage	= testPaperScroll.currentPage.pageX;
		var width=$('.hw-yj-img-icon').eq(currentPage).width(),
	    	height=$('.hw-yj-img-icon').eq(currentPage).height();*/
		var width=$('.hw-yj-img-icon').width(),
	    	height=$('.hw-yj-img-icon').height();
	    	console.log('坐标',x1,x2)
	    //限制范围
		if(x2<0 || x2>width || y2<0 || y2>height){ 
			$(document).off('mousemove');//移除move事件。
			$(document).off('click');//移除click事件。
			$('.hw-yj-save-mark').addClass('active');//声明还有未保存的标记
			return false;
		}
	    if(thisType=='remark'){//不需要旋转的情况
	        dX=Math.abs(parseFloat(x2-x1));//起，落点x的距离差。
	        dY=Math.abs(parseFloat(y2-y1));//起，落点y的距离差。
	        if(x2>x1&&y2>y1){//根据鼠标从四个不同方向绘制进行不同的绘制定位。(左上往右下)第三象限
	            oMark.style.left=wx;
	            oMark.style.top=wy;
	        }else if(x2<x1&&y2>y1){//(右上往左下)第四象限
	            oMark.style.left=((x1-dX)/opW)*100+'%';
	            oMark.style.top=wy;
	        }else if(x2>x1&&y2<y1){//(左下往右上)第一象限
	            oMark.style.left=wx;
	            oMark.style.top=((y1-dY)/opH)*100+'%';
	        }else if(x2<x1&&y2<y1){//(右下往左上)第二象限
	            oMark.style.left=((x1-dX)/opW)*100+'%';
	            oMark.style.top=((y1-dY)/opH)*100+'%';
	        }
	        var wid = dX/opW,
                heig = dY/opH;
                if(wid == 0){
                    oMark.style.minWidth=(0.03)*100+'%';
                }else{
                    oMark.style.minWidth=(dX/opW)*100+'%';
                }
                if(heig == 0){
                    oMark.style.minHeight=(0.03)*100+'%';
                }else{
                    oMark.style.minHeight=(dY/opH)*100+'%';
                }
	    }
	    isSwitch=true;
	})
	//up
	$('.hw-yj-img-icon').mouseup(function(ev){
		ev = ev||event;
	    x2=ev.pageX - offleft;//鼠标落点x的位置。
	    y2=ev.pageY - offtop;//鼠标落点y的位置。
	    $(document).off('mousemove');//移除move事件。
		$(document).off('click');//移除click事件。
			
		$('.hw-yj-save-mark').addClass('active');//声明还有未保存的标记
		if(isSwitch){//评语框获取焦点
			oMark.focus();
			oMark.style.fontSize=oMark.clientHeight*0.625+'px';//设置输入框字体大小随输入框变化
			isSwitch=false
		}else{
			oMark.blur();
			console.log('oMark',oMark)
			oMark.classList.add('noborder')
		}
	});
	return false;
	ev.nativeEvent.preventDefault()
}

//将自定义评语扔到画布上
export function iconRemark(obj, markType,markNum,iconRemarkLen,remarkValue){//obj：创建目标盒子;markType：当前标记类型
	var _this=obj,
		thisType = markType,//当前标记类型
		oMark = document.createElement('span');
		oMark.className = thisType+' icon-remark-border'+' span_mark';
		oMark.setAttribute('this-type',thisType);
		oMark.setAttribute('marknum',markNum);
		
		oMark.style.position = 'absolute';
		oMark.style.left = '0px';
		oMark.style.top = iconRemarkLen*32+'px';
		oMark.innerText=remarkValue;
		_this.append(oMark);//插入标记
		setTimeout(()=>{
			oMark.className = thisType+' span_mark';
		},500)
		//添加选框-移动
		$('.icon-remark').on('click',function(){
	        var _this=$(this);
	            if(_this.hasClass('on')){
	                _this.removeClass('on');
	            }else{
	                _this.addClass('on').siblings().removeClass('on');
	            }
	    })   
}


//保存标记接口
export function saveMark(subtopicId){
	var markList = '',
		pagesL = $('.hw-yj-img-icon').length,
		subtopicId = $('.hw-yj-mark-topicactive').attr('data-subtopicid');
	//循环全部标记组
	$('.hw-yj-img-icon').each(function(index, el) {
		var dragItems = [],
			markListChild = [],
			thisPage = $(this).attr('page-num');
		$(this).find('.span_mark').each(function(index, el) {
			var markId = $(this).attr('belongto-subtopicid');
			if(markId == subtopicId){//如果是当前小题的标记，才保存
				var marks = '{"type":"'+$(this).attr('this-type')+'","css":"'+$(this).attr('style')+'"}';
				dragItems.push(marks);
			}
		});
		if(pagesL == 1){
			markListChild = '[{"pageNum":'+thisPage+',"dragItems":['+dragItems+']}]';
		}else if(pagesL == 2){
			if(thisPage == 1){//第一页
				markListChild = '[{"pageNum":'+thisPage+',"dragItems":['+dragItems+']}';
			}else if(thisPage == 2){//最后一页
				markListChild = ',{"pageNum":'+thisPage+',"dragItems":['+dragItems+']}]';
			}
		}else if(pagesL > 2){
			if(thisPage == 1){//第一页
				markListChild = '[{"pageNum":'+thisPage+',"dragItems":['+dragItems+']}';
			}else if(pagesL == thisPage){//最后一页
				markListChild = ',{"pageNum":'+thisPage+',"dragItems":['+dragItems+']}]';
			}else if(1 < thisPage < pagesL){
				markListChild = ',{"pageNum":'+thisPage+',"dragItems":['+dragItems+']}';
			}
		}
		markList += markListChild;
	});
	//小题标记保存
	// hwdataService.saveHomeworkMarkHttp(subtopicId,markList).then(function(res){
	// 	$('.hw-yj-save-mark').removeClass('active');
	// });
}

