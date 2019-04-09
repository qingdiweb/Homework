export const STORE_UPDATE = 'STORE_UPDATE';
export const STORE_ADD = 'STORE_ADD';
export const STORE_RM = 'STORE_RM';
//清空前后空格
export const Trim=(str)=>{
  return str.replace(/(^\s*)|(\s*$)/g, "");
}
//判断是否为null和''
export const whetherTure = (value)=>{
	if(value!==null&&value!==''){
		return true;
	}else{
		return false;
	}

}
//处理时间戳转化时间日期格式
export const dealTimestamp = (dateAt)=>{
        let date=new Date(dateAt),
	        dateY=date.getFullYear()+'-',
	        dateM=date.getMonth()+1<10 ? '0'+(date.getMonth()+1)+'-' : (date.getMonth()+1)+'-',
	       	dateD=date.getDate()<10 ? '0'+date.getDate()+'' : date.getDate()+'',
	        dateHours=date.getHours() < 10 ? "0" + date.getHours() : date.getHours(),
	        dateMinute=date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes(),
	        newDate=dateY+dateM+dateD+' '+dateHours+':'+dateMinute;
	        return newDate
}
//处理题目数据
export const dealQuestion = (data,questionInfo)=>{
    if(questionInfo==''){
    	if(data instanceof Array && data.length!=0){
    		for (var i = 0; i < data.length; i++) {
		        if(typeof(data[i].options)=='string'&&data[i].options.indexOf('[')>-1){
		           data[i].options=JSON.parse(data[i].options);
		        }else if(data[i].options==null||data[i].options==''){
		            data[i].options=[];
		        }
		        data[i].knowledges=data[i].knowledges==null||data[i].knowledges==''  ? [] : data[i].knowledges.split(',');//处理考点
		        data[i].isShow='none';//初始化不显示解析
		    }
    	}else if(data.constructor === Object && Object.keys(data).length!==0){
		        if(typeof(data.options)=='string'&&data.options.indexOf('[')>-1){
		           data.options=JSON.parse(data.options);
		        }else if(data.options==null||data.options==''){
		            data.options=[];
		        }
		        data.knowledges=data.knowledges==null||data.knowledges==''  ? [] : data.knowledges.split(',');//处理考点
		        data.isShow='none';//初始化不显示解析
    	}
    }else{
    	if(data instanceof Array && data.length!=0){
			for (var i = 0; i < data.length; i++) {
		        if(typeof(data[i].questionInfo.options)=='string'&&data[i].questionInfo.options.indexOf('[')>-1){
		           data[i].questionInfo.options=JSON.parse(data[i].questionInfo.options);
		        }else if(data[i].questionInfo.options==null||data[i].questionInfo.options==''){
		            data[i].questionInfo.options=[];
		        }
		        data[i].questionInfo.knowledges=data[i].questionInfo.knowledges==null||data[i].questionInfo.knowledges==''  ? [] : data[i].questionInfo.knowledges.split(',');//处理考点
		    	data[i].questionInfo.isShow='none';//初始化不显示解析
		    }
    	}else if(data.constructor === Object && Object.keys(data).length!==0){
	    		if(typeof(data.questionInfo.options)=='string'&&data.questionInfo.options.indexOf('[')>-1){
			           data.questionInfo.options=JSON.parse(data.questionInfo.options);
		        }else if(data.questionInfo.options==null||data.questionInfo.options==''){
		            data.questionInfo.options=[];
		        }
			    data.questionInfo.knowledges=data.questionInfo.knowledges==null||data.questionInfo.knowledges==''  ? [] : data.questionInfo.knowledges.split(',');//处理考点
			    data.questionInfo.isShow='none';//初始化不显示解析
    	}

    }
    return data
}
//判断一个数据是否符合格式
export const isFormat = (data,type)=>{
    if(type==Array){
		if(data!==null&&data.length!==0){
			return true
		}else{
			return false
		}
    }else if(type==Object){
    	if(data!==null&&Object.keys(data).length!==0){
			return true
		}else{
			return false
		}
    }else if(type==String){
    	if(data!==null&&data!==''){
			return true
		}else{
			return false
		}
    }else if(type==undefined){
    	if(typeof(data)!="undefined"){
			return true
		}else{
			return false
		}
    }

}
//判断草稿内的题目是否都是无对应章节
export const isHasCatalog = (data)=>{
    let arr=!!data ? data.split(',') : [],
    	isBool=false;
    	for (var i = 0; i < arr.length; i++) {
    		if(arr[i]!='0'){
				isBool=true;
				break;
    		}else{
    			isBool=false
    		}
    	}
    	return isBool
}

//递归通过id查找名称
export const recursiveName = (datavalue,childvalue,id)=>{
	let name='';
    for(let item of datavalue){
		if(item.id==id){
			name=item.name;
    	}else{
    		if(item[childvalue]){
    			if(recursiveName(item[childvalue],childvalue,id)!=''){
    				name=recursiveName(item[childvalue],childvalue,id)
    			}else{
    				recursiveName(item[childvalue],childvalue,id)
    			}
	    	}
    	}
    }
    return name
}

//测试地址和正式地址
export const isTest = false;
export const baseUrl = isTest ? 'https://test.huazilive.com/api/tiku' : 'https://api.huazilive.com/api/tiku';
export const serviceBaseUrl = isTest ? 'https://test.huazilive.com/api/service' : 'https://api.huazilive.com/api/service';
//录题访问地址
export const lutiUrl = isTest ? 'https://test.huazilive.com/LutiAdmin' : 'https://www.huazilive.com/luti';
//j教师录题访问地址
export const teachLutiUrl = isTest ? 'https://test.huazilive.com/TeacherLuti/console.html#!/login/' : 'https://www.huazilive.com/luti/teacher/console.html#!/login/';
