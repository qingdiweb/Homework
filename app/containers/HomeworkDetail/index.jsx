/**
 * 作业详情
 */
import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import { Link, hashHistory } from 'react-router'
import { Menu, Icon , Button , Progress , Tabs , Breadcrumb,Spin} from 'antd';
import { getHomeworkQuestion , getHomeworkStudent } from '../../fetch/homework-report/homework-report'
import './style.less'
const TabPane = Tabs.TabPane;
const clockImg=require("../../static/img/clock.png");
const loginToken=localStorage.getItem("loginToken");
const defaultAvatar=require('../../static/img/default-avatar.png');
class HomeDetail extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
        this.state={
            homeworkListData:{},//作业列表数据
            homeworkQuestionInfoList:[],//获取作业下所有题目答题数据
            studentHomeworkInfoList:[],//获取作业下所有题目答题数据
            isShowModal:false,//显示删除提示弹窗框
            homeworkId:'',//作业id
            flag:false,
            loadingShow:'block'
        }
    }
    componentWillMount(){
        let homeworkId=this.props.params.homeworkId;
            //获取作业下所有题目答题情况
            this.getHomeworkQuestion.bind(this,loginToken,homeworkId)();
            //获取作业下所有学生答题情况
            this.getHomeworkStudent.bind(this,loginToken,homeworkId)();
            //通知左侧menu导航-当前在那个menu下
            localStorage.setItem('positionMenu',JSON.stringify(['3']));
    }
    //获取作业下所有题目答题情况
    getHomeworkQuestion(loginToken,homeworkId){
        const resultHomeworkQuestion=getHomeworkQuestion(loginToken,homeworkId);
                resultHomeworkQuestion.then(res => {
                    return res.json()
                }).then(json => {
                    // 处理获取的数据
                    const data = json
                    if (data.result) {
                        let content=data.data,
                            homeworkQuestionInfoList=content.questionInfoList==null||'' ? [] : content.questionInfoList,
                            inputTime=new Date(content.abortAt),//截止时间
                            publishTime=new Date(content.publishAt),//发布时间
                            newDateParse=Date.parse(new Date()),//当前时间戳
                            //Y=inputTime.getFullYear()+'-',
                            M=inputTime.getMonth()+1<10 ? '0'+(inputTime.getMonth()+1)+'月' : (inputTime.getMonth()+1)+'月',
                            D=inputTime.getDate()<10 ? '0'+inputTime.getDate()+'日' : inputTime.getDate()+'日',
                            Hours=inputTime.getHours() < 10 ? "0" + inputTime.getHours() : inputTime.getHours(),
                            Minute=inputTime.getMinutes() < 10 ? "0" + inputTime.getMinutes() : inputTime.getMinutes(),
                            PublishY=publishTime.getFullYear()+'-',
                            PublishM=publishTime.getMonth()+1<10 ? '0'+(publishTime.getMonth()+1)+'-' : (publishTime.getMonth()+1)+'-',
                            PublishD=publishTime.getDate()<10 ? '0'+publishTime.getDate()+'' : publishTime.getDate()+'',
                            PublishHours=publishTime.getHours() < 10 ? "0" + publishTime.getHours() : publishTime.getHours(),
                            PublishMinute=publishTime.getMinutes() < 10 ? "0" + publishTime.getMinutes() : publishTime.getMinutes();
                            content.newAbortAt=' '+M+D+' '+Hours+':'+Minute;
                            content.newPublishAt='创建时间:'+' '+PublishY+PublishM+PublishD+' '+PublishHours+':'+PublishMinute;

                            //如果当前时间大于截止时间，就标红，提示已截止
                            console.log("当前时间戳",newDateParse)
                            console.log("截止时间戳",content.abortAt)
                            if(newDateParse>content.abortAt){
                                content.isAsShow='inline-block';
                                content.isNotAsShow='none';
                            }else{
                                content.isAsShow='none';
                                content.isNotAsShow='inline-block';
                            }
                            //如果状态为2，那么就是有需要批改的
                            if(content.state==2){
                                content.isNeedCorrect='inline-block';
                                content.isDetail='none';
                            }else{
                                content.isNeedCorrect='none';
                                content.isDetail='inline-block';
                            }
                            //遍历查出子题-组合到大题里面
                            console.log('作业题目全部',homeworkQuestionInfoList)
                            let homeworkQuestionInfoListArr=[];
                            homeworkQuestionInfoList.forEach((item,index)=>{
                                if(item.childQuestionInfoList!=null&&item.childQuestionInfoList.length!=0){
                                    //面向对象问题：深拷贝一个新对象，要不同一个内存地址造成的，之后循环改变的对象值造成之前的也变化了，所以childId一直是最后一个
                                    let obj=Object.assign([],item.childQuestionInfoList);
                                    homeworkQuestionInfoListArr=[...homeworkQuestionInfoListArr,...obj]
                                    console.log('深拷贝数组',homeworkQuestionInfoListArr)
                                    //homeworkQuestionInfoList=[...homeworkQuestionInfoList,...obj];
                                    //给子题添加序列号
                                    item.childQuestionInfoList.forEach((ele,i)=>{
                                        ele.serial=(index+1)+'.'+(i+1);
                                    })
                                }else{
                                    item.serial=index+1;
                                    homeworkQuestionInfoListArr.push(item)
                                }
                            })
                             this.setState({
                                homeworkListData:content,
                                homeworkQuestionInfoList:homeworkQuestionInfoListArr,
                                loadingShow:'none'
                            })

                    }
                }).catch(ex => {
                    // 发生错误
                    if (__DEV__) {
                        console.error('暂无数据, ', ex.message)
                    }
                })
    }
    //获取作业下所有学生答题情况
    getHomeworkStudent(loginToken,homeworkId){
        const resultHomeworkStudent=getHomeworkStudent(loginToken,homeworkId);
                resultHomeworkStudent.then(res => {
                    return res.json()
                }).then(json => {
                    // 处理获取的数据
                    const data = json
                    if (data.result) {
                        let studentHomeworkInfoList=data.data.studentInfoList==null||'' ? [] : data.data.studentInfoList;
                            this.setState({
                                studentHomeworkInfoList:studentHomeworkInfoList
                            })
                    }
                }).catch(ex => {
                    // 发生错误
                    if (__DEV__) {
                        console.error('暂无数据, ', ex.message)
                    }
                })
    }
    render() {
        let homeworkListData=this.state.homeworkListData,
            homeworkQuestionInfoList=this.state.homeworkQuestionInfoList,
            studentHomeworkInfoList=this.state.studentHomeworkInfoList,
            jumpType=this.props.params.type,//存储类型-判断是从哪个页面跳转到作业详情的
            classId=this.props.params.classId,//存储类型-判断是从哪个页面跳转到作业详情的
            breadcrumbTxt="";//面包屑
            if(jumpType==0){//作业首页过来的
                breadcrumbTxt=<Breadcrumb separator=">"><Breadcrumb.Item><Link to='/index-homework'>课后作业</Link></Breadcrumb.Item><Breadcrumb.Item>作业批改</Breadcrumb.Item></Breadcrumb>
            }else if(jumpType==1){//作业报告过来的
                breadcrumbTxt=<Breadcrumb separator=">"><Breadcrumb.Item><Link to={'/homework-statistical/'+this.props.params.homeworkId+'/1/0'}>作业报告</Link></Breadcrumb.Item><Breadcrumb.Item>作业批改</Breadcrumb.Item></Breadcrumb>
            }else if(jumpType==2){//我的班级过来的
                breadcrumbTxt=<Breadcrumb separator=">">
                                  <Breadcrumb.Item>
                                    <Link to='/homework-class'>我的班级</Link>
                                  </Breadcrumb.Item>
                                  <Breadcrumb.Item>
                                    <Link to={'/homework-class-detail/'+classId}>班级详情</Link>
                                  </Breadcrumb.Item>
                                  <Breadcrumb.Item>
                                    作业批改
                                  </Breadcrumb.Item>
                              </Breadcrumb>
            }
        return (
            <div className="homework-detail">
                <h1 className='header-nav'>
                    { breadcrumbTxt }
                </h1>
                <Spin size="large" style={{"fontSize":"30px","display":this.state.loadingShow,'margin':'300px auto'}}/>
                {
                    Object.keys(homeworkListData).length!=0&&<div>
                        <p className='common-sec-title' style={{marginBottom:'30px'}}><span className='sec-title-line'></span><span>作业信息</span></p>
                        <div>
                            <div className="list-sec no-corrections">
                                    <p className="date"><span>{homeworkListData.newPublishAt}</span></p>
                                    <div className="mark-box homeworinfo-mark">
                                        <span className="class-mark" title={homeworkListData.className}>{Object.keys(homeworkListData).length!=0 ? homeworkListData.className : ''}</span>
                                        <div className='homework-name-time'>
                                            <h1 className="homework-mark">
                                                <span className="homework-name" title={homeworkListData.name}>{Object.keys(homeworkListData).length!=0 ? homeworkListData.name : ''}</span>
                                            </h1>
                                            <p>
                                                <span className="homeworknum-mark">共{homeworkListData.questionCount}题</span>
                                                <span className={homeworkListData.isAsShow=='inline-block' ? 'alreadyAstime-tag' : 'astime-tag'}><span className="as-mark" style={{'display':homeworkListData.isAsShow}}>已截止:</span><span className="as-mark" style={{'display':homeworkListData.isNotAsShow}}>截止时间</span><span className="astimemonth-mark">{homeworkListData.newAbortAt}</span></span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mark-box progress-mark-box">
                                        {<p className="progress-bar">
                                            <Progress strokeColor='rgba(45, 187, 85, 1)' strokeWidth={6} percent={(homeworkListData.committedCount/homeworkListData.allCount)*100} showInfo={false} status="active" />
                                        </p>}
                                        {<p className="progress-bar-txt">
                                            <span>已提交</span><span><span className="submitted">{homeworkListData.committedCount}</span>/<span>{homeworkListData.allCount}</span></span>
                                        </p>}
                                    </div>
                                    <div className="mark-box progress-circle-mark-box">
                                        <p className="progress-circle-bar">
                                            <Progress strokeColor='rgba(45, 187, 85, 1)' strokeWidth={6} type="circle" percent={homeworkListData.accuracy} width={48} status="active"/>
                                        </p>
                                        <p className="progress-circle-text">正确率</p>
                                    </div>
                                    <div className="mark-box correcting-mark-box">
                                        <a href="javascript:;" className="report-detail-btn"><Link to={'/homework-edit-again/'+this.props.params.homeworkId+'/'+homeworkListData.draftId+'/'+this.props.params.type+'/0'+'/'+classId}>查看作业</Link></a>
                                        <a href="javascript:;" className="report-detail-btn"><Link to={'/homework-statistical/'+this.props.params.homeworkId+'/'+this.props.params.type+'/0'}>作业报告</Link></a>
                                    </div>
                            </div>
                        </div>
                        <div className="topic-stu-report">
                            <Tabs defaultActiveKey="1" onChange={this.callback.bind(this)}>
                                <TabPane tab="按试题批改" key="1">
                                    {
                                        homeworkQuestionInfoList.length>0 ? homeworkQuestionInfoList.map((item,index)=>{

                                            if(item.canAnswer==0){//不可作答
                                                let processClass="",
                                                    logoIdentify='',
                                                    processNub='',
                                                    processPercent='',
                                                    questionProcessClass="";
                                                    if(item.accuracy<60){
                                                        if(item.accuracy==0){
                                                            processClass="process-circle"
                                                        }else{
                                                            processClass="process-circle-six"
                                                        }
                                                    }else if(item.accuracy>=60&&item.accuracy<80){
                                                        processClass="process-circle-eight"
                                                    }else if(item.accuracy>=80&&item.accuracy<=100){
                                                        processClass="process-circle-ten"
                                                    }
                                                    if(item.committedCount===0){//未提交
                                                        logoIdentify='no-submit-identify';
                                                        processNub='未提交';
                                                        processPercent=0;
                                                        questionProcessClass='nosubmit-process-circle';
                                                    }else{
                                                        if(item.state===0){//提交但未都批改完
                                                            logoIdentify='correct-logo-identify';
                                                            processNub='待批改';
                                                            processPercent=100;
                                                            questionProcessClass='correct-process-circle';
                                                        }else if(item.state===1){//提交并都批改完
                                                            logoIdentify='correct-finish-identify';
                                                            processNub=item.accuracy+'%';
                                                            processPercent=!!item.accuracy&&(item.accuracy!=null||'') ? item.accuracy : 0;
                                                            questionProcessClass='finish-process-circle';
                                                        }
                                                    }
                                                    return <div className="process-box question-info" key={item.id} style={{minWidth:"89px"}}>
                                                            {
                                                                item.committedCount===0||(item.committedCount!==0&&item.state===1) ? <Link to={"/homework-topic-detail/"+this.props.params.homeworkId+"/"+item.id+'/'+jumpType+'/'+classId}>
                                                                    {
                                                                        /*logoIdentify=='correct-logo-identify' ? <span className={logoIdentify} data-id={item.id} data-type="0" onClick={this.jumpCorrect.bind(this)}></span> : <span className={logoIdentify}></span>*/
                                                                    }
                                                                    {
                                                                       /* item.state==1 ? <span className='subjective-correct-logo-box'>
                                                                                               <span className="correct-finish-logo"></span>
                                                                                        </span> : <span className='subjective-correct-logo-box' style={{background: 'none'}}><span className="subjective-correct-logo" data-id={item.id} data-type="0" onClick={this.jumpCorrect.bind(this)}></span></span>*/
                                                                    }
                                                                    {
                                                                        item.committedCount!==0&&item.state===1 ? <Progress strokeColor='rgba(39, 188, 83, 1)' strokeWidth={6} className={questionProcessClass} type="circle" percent={processPercent} width={60} format={() => processNub}/> : <Progress strokeColor='rgba(39, 188, 83, 1)' strokeWidth={6} className={questionProcessClass} type="circle" percent={processPercent} width={60} format={() => processNub}/>
                                                                    }
                                                                    {
                                                                        /*item.state==1 ?  <Progress strokeColor='rgba(45, 187, 85, 1)'strokeWidth={6} className={processClass} type="circle" percent={item.accuracy} width={60} status="active"/> : <Progress strokeColor='rgba(45, 187, 85, 1)' strokeWidth={6} className='marked-correct-process-circle' type="circle" width={60} format={() => '待批改'}/> */
                                                                    }

                                                                    {
                                                                        /*item.committedCount===0||(item.committedCount!==0&&item.state===1) ? <span className="detail-btn"><Link to={"/homework-topic-detail/"+this.props.params.homeworkId+"/"+item.id}>详情</Link></span> : <span className="correct-num"><span style={{"marginRight":"8px",color:'#999'}}>已批改</span><span className="already-submit">{item.checkedCount}</span>/<span>{homeworkListData.committedCount}</span></span> */
                                                                    }
                                                                    {
                                                                    /*    !!item.serial ? <span className="sequence-nub">{item.serial}</span> : <span className="sequence-nub">{index+1}</span>*/
                                                                    !!item.serial&&<span className="sequence-nub">{item.serial}</span>
                                                                    }
                                                                </Link> : <div data-id={item.id} data-type="0" onClick={this.jumpCorrect.bind(this)} style={{cursor:'pointer'}}>
                                                                    {
                                                                        /*logoIdentify=='correct-logo-identify' ? <span className={logoIdentify} data-id={item.id} data-type="0" onClick={this.jumpCorrect.bind(this)}></span> : <span className={logoIdentify}></span>*/
                                                                    }
                                                                    {
                                                                       /* item.state==1 ? <span className='subjective-correct-logo-box'>
                                                                                               <span className="correct-finish-logo"></span>
                                                                                        </span> : <span className='subjective-correct-logo-box' style={{background: 'none'}}><span className="subjective-correct-logo" data-id={item.id} data-type="0" onClick={this.jumpCorrect.bind(this)}></span></span>*/
                                                                    }
                                                                    {
                                                                        item.committedCount!==0&&item.state===1 ? <Progress strokeColor='rgba(39, 188, 83, 1)' strokeWidth={6} className={questionProcessClass} type="circle" percent={processPercent} width={60}/> : <Progress strokeColor='rgba(39, 188, 83, 1)' strokeWidth={6} className={questionProcessClass} type="circle" percent={processPercent} width={60} format={() => processNub}/>
                                                                    }
                                                                    {
                                                                        /*item.state==1 ?  <Progress strokeColor='rgba(45, 187, 85, 1)'strokeWidth={6} className={processClass} type="circle" percent={item.accuracy} width={60} status="active"/> : <Progress strokeColor='rgba(45, 187, 85, 1)' strokeWidth={6} className='marked-correct-process-circle' type="circle" width={60} format={() => '待批改'}/> */
                                                                    }

                                                                    {
                                                                        /*item.committedCount===0||(item.committedCount!==0&&item.state===1) ? <span className="detail-btn"><Link to={"/homework-topic-detail/"+this.props.params.homeworkId+"/"+item.id}>详情</Link></span> : <span className="correct-num"><span style={{"marginRight":"8px",color:'#999'}}>已批改</span><span className="already-submit">{item.checkedCount}</span>/<span>{homeworkListData.committedCount}</span></span> */
                                                                    }
                                                                    {
                                                                        !!item.serial ? <span className="sequence-nub">{item.serial}</span> : <span className="sequence-nub">{index+1}</span>
                                                                    }
                                                                </div>
                                                            }



                                                        </div>
                                            }else if(item.canAnswer==1){//可作答
                                                let processNub=item.accuracy+'%',
                                                    processClass="";
                                                    if(item.accuracy<60){
                                                        if(item.accuracy==0){
                                                            processClass="process-circle"
                                                        }else{
                                                            processClass="process-circle-six"
                                                        }
                                                    }else if(item.accuracy>=60&&item.accuracy<80){
                                                        processClass="process-circle-eight"
                                                    }else if(item.accuracy>=80&&item.accuracy<=100){
                                                        processClass="process-circle-ten"
                                                    }
                                                    return <div className="process-box question-info" key={item.id} style={{minWidth:"89px"}}>
                                                                <Link to={"/homework-topic-detail/"+this.props.params.homeworkId+"/"+item.id+'/'+jumpType+'/'+classId}>
                                                                            <Progress strokeColor='rgba(45, 187, 85, 1)' strokeWidth={6} className={processClass} type="circle" percent={item.accuracy} width={60} status="active" format={() => processNub}/>
                                                                            {
                                                                                !!item.serial ? <span className="sequence-nub">{item.serial}</span> : <span className="sequence-nub">{index+1}</span>
                                                                            }
                                                                            {/*<span className="detail-btn">详情</span>*/}
                                                                </Link>
                                                            </div>
                                            }
                                        }) : <div style={{'font-size':'16px','text-align':'center','margin':'300px auto',"display":this.state.loadingShow=='block' ? 'none' : 'block'}}><Icon type="exclamation-circle" style={{marginRight:'5px',color:'rgba(255, 159, 0, 1)'}}/>暂无数据~</div>
                                    }

                                </TabPane>
                                <TabPane tab="按学生批改" key="2">
                                {
                                    studentHomeworkInfoList.length>0 ? studentHomeworkInfoList.map((item,index)=>{
                                        let answerSecond=!!item.studentHomworkInfo ? item.studentHomworkInfo.answerSecond : '',
                                            minute=parseInt(answerSecond/60),
                                            second=answerSecond%60,
                                            logoIdentify='',
                                            logoIdentifyBtn='',
                                            processNub='',
                                            processPercent='',
                                            processClass='';
                                            if(!!item.studentHomworkInfo&&item.studentHomworkInfo.reviewState==1){//提交全部批改完
                                                logoIdentify='correct-finish-identify';
                                                logoIdentifyBtn='correcting-finish-btn';
                                                processNub='';
                                                processPercent=!!item.studentHomworkInfo&&(item.studentHomworkInfo.reviewAccuracy!=null||'') ? item.studentHomworkInfo.reviewAccuracy : 0;
                                                processClass='finish-process-circle';
                                            }else if(!!item.studentHomworkInfo&&item.studentHomworkInfo.reviewState===0){//提交未全部批改完
                                                if(item.studentHomworkInfo.state<2){//未提交
                                                    logoIdentify='no-submit-identify';
                                                    logoIdentifyBtn='no-submit';
                                                    processNub='未提交';
                                                    processPercent=0;
                                                    processClass='nosubmit-process-circle';
                                                }else if(item.studentHomworkInfo.state>=2&&item.studentHomworkInfo.state<=5){//提交但未都批改完
                                                        logoIdentify='correct-logo-identify';
                                                        logoIdentifyBtn='correcting-btn';
                                                        processNub='待批改';
                                                        processPercent=100;
                                                        processClass='correct-process-circle';
                                                }
                                            }else{//未提交
                                                logoIdentify='no-submit-identify';
                                                logoIdentifyBtn='no-submit';
                                                processNub='未提交';
                                                processPercent=0;
                                                processClass='nosubmit-process-circle';
                                            }

                                        return <div className="stu-info" key={index} style={{color:(!!item.studentHomworkInfo&&item.studentHomworkInfo.state<2)||item.studentHomworkInfo==null ? 'rgba(153, 153, 153, 1)' : ''}}>
                                                    {/*<span className={logoIdentify}></span>*/}
                                                    <div className="process-box  info-sec-left">
                                                        {
                                                            !!item.studentHomworkInfo&&item.studentHomworkInfo.reviewState==1 ? <Progress strokeColor='rgba(39, 188, 83, 1)' strokeWidth={6} className={processClass} type="circle" percent={processPercent} width={60}/> : <Progress strokeColor='rgba(39, 188, 83, 1)' strokeWidth={6} className={processClass} type="circle" percent={processPercent} width={60} format={() => processNub}/>
                                                        }
                                                        <span className="detail-btn">
                                                        {
                                                            !!item.studentHomworkInfo&&item.studentHomworkInfo.reviewState==1 ? '正确率' : ''
                                                        }
                                                        </span>
                                                    </div>
                                                    <div className="info-sec-right">
                                                        <div style={{content:'',clear:'both',display:'table'}}>
                                                            <img src={item.avatarUrl==null||'' ? defaultAvatar : item.avatarUrl} alt="" className="head-portrait"/>
                                                            <p className="name-time">
                                                                <a style={{color:'rgba(51, 51, 51, 1)'}}>{item.nickname==null||'' ? '欧拉学生' :  item.nickname}</a>
                                                                <a>
                                                                    <span className="clock-logo"></span><span style={{color:'rgba(153, 153, 153, 1)'}}>{(!!item.studentHomworkInfo&&item.studentHomworkInfo.state<2)||item.studentHomworkInfo==null ? "0'0" : minute+"'"+second+"s"}</span>
                                                                </a>
                                                            </p>
                                                        </div>
                                                        <div style={{marginTop:'15px'}}>
                                                            <Button type="primary" className={logoIdentifyBtn} disabled={(!!item.studentHomworkInfo&&item.studentHomworkInfo.state<2)||item.studentHomworkInfo==null ? true : false} data-id={item.id} data-type="1" onClick={this.jumpCorrect.bind(this)}>
                                                            {
                                                                (!!item.studentHomworkInfo&&item.studentHomworkInfo.reviewState===0&&item.studentHomworkInfo.state<2)||item.studentHomworkInfo==null ? '未提交' : '批改'
                                                            }
                                                            </Button>
                                                             {
                                                                (!!item.studentHomworkInfo&&item.studentHomworkInfo.reviewState===0&&item.studentHomworkInfo.state<2)||item.studentHomworkInfo==null ? '' : <span className="detail-btn"><Link style={{color:!!item.studentHomworkInfo&&item.studentHomworkInfo.reviewState==1 ? 'rgba(39, 188, 83, 1)' : 'rgba(255, 133, 72, 1)'}} to={"/homework-student-detail/"+this.props.params.homeworkId+"/"+item.id+'/'+this.props.params.type+'/'+classId}>详情</Link></span>
                                                             }
                                                        </div>
                                                    </div>
                                                </div>
                                    }) : <div style={{'font-size':'16px','text-align':'center','margin':'300px auto',"display":this.state.loadingShow=='block' ? 'none' : 'block'}}><Icon type="exclamation-circle" style={{marginRight:'5px',color:'rgba(255, 159, 0, 1)'}}/>暂无数据~</div>
                                }
                                </TabPane>
                            </Tabs>
                         {/*  <div className="logo-tip">
                                    <span className="logo-box">
                                        <span className="no-submit"></span>
                                        <span style={{"float":"left","marginLeft":"4px",fontSize: "12px"}}>
                                            未提交
                                        </span>
                                    </span>
                                    <span className="logo-box">
                                        <span className="stay-correct"></span>
                                        <span style={{"float":"left","marginLeft":"4px",fontSize: "12px"}}>
                                            待批改
                                        </span>
                                    </span>
                                    <span className="logo-box">
                                        <span className="correct-finish"></span>
                                        <span style={{"float":"left","marginLeft":"4px",fontSize: "12px"}}>
                                            批改完成
                                        </span>
                                    </span>
                                </div>*/}
                        </div>
                    </div>
                }

            </div>
        )
    }
  /*  enterHandle(value) {
        hashHistory.push('/search/all/' + encodeURIComponent(value))
    }*/
    //试题报告 学生报告
    callback(e){

    }
    //跳转批改
    jumpCorrect(e){
        let homeworkId=this.props.params.homeworkId,
            id=e.currentTarget.getAttribute('data-id'),
            type=e.currentTarget.getAttribute('data-type'),
            correctType=0;//存储类型-判断是从哪个页面跳转到作业批改的 0 作业详情跳转 1 试题详情跳转 2学生报告跳转
            hashHistory.push('/correct-homework/' + encodeURIComponent(homeworkId)+'/'+ encodeURIComponent(id)+'/'+encodeURIComponent(type)+'/0'+'/'+this.props.params.type+'/'+this.props.params.classId);
            //存储类型-判断是从哪个页面跳转到作业详情的
            localStorage.setItem('correctType',correctType);
    }
}

export default HomeDetail
