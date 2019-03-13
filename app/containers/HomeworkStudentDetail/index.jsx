/**
 * 学生详情
 */
import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import { Link, hashHistory } from 'react-router'
import { Menu, Icon , Button , Progress , Tabs , Radio ,  Checkbox , Select ,  Input , Modal , Row , Col , Breadcrumb} from 'antd';
import { specifyStudentStatistical } from '../../fetch/homework-report/homework-report'
import { getTopicListData , getDefaultQuestionList , collectSearchList , addorcancelCollect , addProblem} from '../../fetch/decorate-homework/decorate-homework'
import Pagination from '../../Components/Pagination';

import './style.less'
const TabPane = Tabs.TabPane;
const noCollectImg=require("../../static/img/default-sel.png");
const collectImg=require("../../static/img/collect-sel.png");
const rightLogoSel=require('../../static/img/right-sel.png')
const halfRightLogoSel=require('../../static/img/half-right-sel.png')
const wrongLogoSel=require('../../static/img/wrong-sel.png')
const loginToken=localStorage.getItem("loginToken");
const defaultAvatar=require('../../static/img/default-avatar.png');
class HomeStuDetail extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
        this.state={
            topicList:{},//题目列表
            topicListLen:'',//数据条数
            homeworkId:'',//作业id
            isCheck:'block',//判断列表什么时候显示可选题目按钮
            collectVisible:false,//是否显示收藏弹窗
            isAddcollectShow:false,//是否显示添加习题集输入框
            collectProblemData:'',//选择的习题集
            defaultCollectProblemData:[],//默认此题目下的习题集
            collectList:[],//收藏习题集列表
            newProblemName:'',//添加新习题集名字
            collectQustionId:'',//收藏习题集列表所需题目id
            loadingShow:'block',//加载图标
            flag:false,
            allObjective:true,
            currentPage:1
        }
    }
    componentWillMount(){
        let homeworkId=this.props.params.homeworkId,
            studentId=this.props.params.studentId,
            pageNumber=0,
            pageSize=5;
            this.specifyStudentStatistical.bind(this,loginToken,homeworkId,studentId,pageNumber,pageSize)();
            //通知左侧menu导航-当前在那个menu下
            localStorage.setItem('positionMenu',JSON.stringify(['3']));
    }
    //获取作业详情数据
    specifyStudentStatistical(loginToken,homeworkId,studentId,pageNumber,pageSize){
        const resultHomework=specifyStudentStatistical(loginToken,homeworkId,studentId,pageNumber,pageSize);
                resultHomework.then(res => {
                    return res.json()
                }).then(json => {
                    // 处理获取的数据
                    const data = json
                    if (data.result) {
                       let topicListData=data.data.content,
                            questionInfoList=topicListData.questionInfoList;
                        for (var i = 0; i < questionInfoList.length; i++) {
                            //将学生答题内容字符串转换为数组
                            questionInfoList[i].answer=questionInfoList[i].answer.split(',');
                            if(typeof(questionInfoList[i].options)=='string'&&questionInfoList[i].options.indexOf('[')>-1){
                               questionInfoList[i].options=JSON.parse(questionInfoList[i].options);
                            }else if(questionInfoList[i].options==null||questionInfoList[i].options==''){
                                questionInfoList[i].options=[];
                            }
                            questionInfoList[i].knowledges=questionInfoList[i].knowledges==null||questionInfoList[i].knowledges==''  ? [] : questionInfoList[i].knowledges.split(',');//处理考点
                            questionInfoList[i].isShow='none';//初始化不显示解析
                            //给题目列表添加序列号
                            questionInfoList[i].topicIndex=pageNumber*5+i+1;
                            //找出所有主观题给他们一个所有主观题的排序，方便批改过去定位
                            /*if(questionInfoList[i].canAnswer==0){
                                questionInfoList[i].positionCorrect=pageNumber*5+i;
                            }*/
                            //如果发现有主观题的话，就显示全局批改那妞
                            if(questionInfoList[i].canAnswer==0){
                                this.setState({
                                    allObjective:false
                                })
                            }
                        }
                        //循环遍历如果有子题，是多view时给小题加上isShow
                        questionInfoList.map((ele,i)=>{
                            if(ele.childQuestionInfoList!=null&&ele.childQuestionInfoList.length!=0){
                                ele.childQuestionInfoList.map((item,index)=>{
                                        item.answer=item.answer.split(',');
                                        if(typeof(item.options)=='string'&&item.options.indexOf('[')>-1){
                                           item.options=JSON.parse(item.options);
                                        }else if(item.options==null||item.options==''){
                                            item.options=[];
                                        }
                                        item.knowledges=item.knowledges==null||item.knowledges==''  ? [] : item.knowledges.split(',');//处理考点
                                        item.isShow='none';//初始化不显示解析
                                })
                            }
                        })

                        this.setState({
                            topicList:topicListData,
                            topicListLen:data.data.pageable.totalSize/5,
                            loadingShow:'none'
                        },()=>{
                            window.MathJax.Hub.Queue(["Typeset",window.MathJax.Hub,"output"]);
                        });
                    }
                }).catch(ex => {
                    // 发生错误
                    if (__DEV__) {
                        console.error('暂无数据, ', ex.message)
                    }
                })
    }

    render() {
        let topicList=this.state.topicList,
            studentHomeworkInfo=topicList.studentHomeworkInfo,
            answerSecond=!!studentHomeworkInfo&&!!studentHomeworkInfo.answerSecond ? studentHomeworkInfo.answerSecond : '',//用时
            committedTime=!!studentHomeworkInfo&&!!studentHomeworkInfo.committedAt ? studentHomeworkInfo.committedAt : '',//提交时间
            minute=answerSecond==null||''||JSON.stringify(topicList) == '{}' ? 0 : parseInt(answerSecond/60),
            second=answerSecond==null||''||JSON.stringify(topicList) == '{}' ? 0 : answerSecond%60,
            committedAt=committedTime==null||'' ? 0 : new Date(committedTime),//提交时间
            newDateParse=Date.parse(new Date()),//当前时间戳
            M=committedAt.getMonth()+1<10 ? '0'+(committedAt.getMonth()+1)+'月' : (committedAt.getMonth()+1)+'月',
            D=committedAt.getDate()<10 ? '0'+committedAt.getDate()+'日' : committedAt.getDate()+'日',
            Hours=committedAt.getHours() < 10 ? "0" + committedAt.getHours() : committedAt.getHours(),
            Minute=committedAt.getMinutes() < 10 ? "0" + committedAt.getMinutes() : committedAt.getMinutes(),
            committedAtTime=' '+M+D+' '+Hours+':'+Minute,
            jumpType=this.props.params.type,//存储类型-判断是从哪个页面跳转到作业详情的
            classId=this.props.params.classId,//存储类型-判断是从哪个页面跳转到作业详情的
            breadcrumbTxt="";//面包屑
            console.log('学生报告',topicList)
            //面包屑
            if(jumpType==0){//作业首页过来的
                breadcrumbTxt=<Breadcrumb separator=">">
                                  <Breadcrumb.Item>
                                    <Link to='/index-homework'>课后作业</Link>
                                  </Breadcrumb.Item>
                                  <Breadcrumb.Item ><Link to={/homework-detail/+this.props.params.homeworkId+'/'+jumpType+'/0'}>作业批改</Link></Breadcrumb.Item>
                                  <Breadcrumb.Item>学生报告</Breadcrumb.Item>
                              </Breadcrumb>
            }else if(jumpType==2){//我的班级-班级详情过来的
                breadcrumbTxt=<Breadcrumb separator=">">
                                  <Breadcrumb.Item>
                                    <Link to='/homework-class'>我的班级</Link>
                                  </Breadcrumb.Item>
                                  <Breadcrumb.Item>
                                    <Link to={'/homework-class-detail/'+classId}>班级详情</Link>
                                  </Breadcrumb.Item>
                                  <Breadcrumb.Item ><Link to={/homework-detail/+this.props.params.homeworkId+'/'+jumpType+'/'+classId}>作业批改</Link></Breadcrumb.Item>
                                  <Breadcrumb.Item>学生报告</Breadcrumb.Item>
                              </Breadcrumb>
            }else if(jumpType==3){//我的班级-学生详情过来的
                breadcrumbTxt=<Breadcrumb separator=">">
                                  <Breadcrumb.Item>
                                    <Link to='/homework-class'>我的班级</Link>
                                  </Breadcrumb.Item>
                                  <Breadcrumb.Item>
                                    <Link to={'/homework-class-detail/'+classId}>班级详情</Link>
                                  </Breadcrumb.Item>
                                  <Breadcrumb.Item>
                                    <Link to={'/homework-class-stuhistory'+'/'+classId+'/'+this.props.params.studentId}>学生详情</Link>
                                  </Breadcrumb.Item>
                                  <Breadcrumb.Item>学生报告</Breadcrumb.Item>
                              </Breadcrumb>
            }

        return (
            <div className="homework-student-detail">
                <h1 className='header-nav'>
                    {
                        breadcrumbTxt
                    }
                </h1>
                <p className='common-sec-title' style={{marginBottom:'16px'}}><span className='sec-title-line'></span><span>答案统计</span></p>
                <div className="answer-statistics">
                    <div className="info-sec">
                        <div>
                            <img src={JSON.stringify(this.state.topicList) != '{}'&&!!studentHomeworkInfo&&!!studentHomeworkInfo.studentAvatarUrl ? studentHomeworkInfo.studentAvatarUrl : defaultAvatar} alt="" className="head-portrait"/>
                            <p className="stu-answer-info">
                                <b style={{display:'block',height:'22px','marginBottom':'4px'}}>{JSON.stringify(this.state.topicList)!='{}'&&!!studentHomeworkInfo&&!!studentHomeworkInfo.studentName ? studentHomeworkInfo.studentName : '欧拉学生'}</b>
                                <p><span>共{JSON.stringify(this.state.topicList) != '{}'&&!!topicList.questionCount ? topicList.questionCount : '0'}道题</span><span className="clock-logo"></span><span className="time">{minute}'{second}s</span><span>提交时间：</span>{<span>{committedAtTime}</span>}</p>
                            </p>
                        </div>
                    </div>
                    {
                        !this.state.allObjective ? <Button type="primary" className="correcting-btn" data-id={0} onClick={this.jumpCorrect.bind(this)}>
                                                       批改
                                                    </Button> : ''
                    }

                    <div className="process-box  info-sec-left">
                        <Progress strokeColor='rgba(45, 187, 85, 1)' strokeWidth={6} className="process-circle" type="circle" percent={JSON.stringify(this.state.topicList) != '{}'&&!!studentHomeworkInfo&&!!studentHomeworkInfo.reviewAccuracy ? studentHomeworkInfo.reviewAccuracy : 0} width={48} status="active"/>
                        <span className="detail-btn">正确率</span>
                    </div>
                </div>
                <p className='common-sec-title' style={{marginBottom:'16px'}}><span className='sec-title-line'></span><span>作业信息</span></p>
                <div className="topic-detail">
                <Icon type="loading" style={{"fontSize":"30px","display":this.state.loadingShow,'margin':'200px auto'}}/>
                {

                    JSON.stringify(topicList) != '{}' ? topicList.questionInfoList.map((item,index)=>{
                         let degreeData="",//难度展示
                            degreeTxt=item.degree/20,
                            isShow=true,//判断区分主客观题，标识显示问题
                            correctText="",
                            correctLogo='',
                            optionsNub=['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
                            if (0<degreeTxt && degreeTxt<=1)
                            {
                                degreeData ='较容易';
                            }
                            else if (1<degreeTxt && degreeTxt<=2)
                            {
                                degreeData ='容易';
                            }
                            else if (2<degreeTxt && degreeTxt<=3)
                            {
                                degreeData ='中等';
                            }
                            else if (3<degreeTxt && degreeTxt<=4)
                            {
                                degreeData ='较难';
                            }
                            else if (4<degreeTxt && degreeTxt<=5)
                            {
                                degreeData ='难';
                            }
                            if(item.canAnswer==1){//客观题
                                //是否作答-没作答直接算错
                                isShow=true;
                                if(!!item.studentHomeworkAnswerInfo){
                                    if(item.studentHomeworkAnswerInfo.answer==""){
                                        correctLogo=wrongLogoSel;
                                        correctText="错"
                                    }else{
                                        if(item.studentHomeworkAnswerInfo.reviewResult==0){
                                            correctLogo=rightLogoSel;
                                            correctText="正确"
                                        }else if(item.studentHomeworkAnswerInfo.reviewResult==1){
                                             correctLogo=wrongLogoSel;
                                            correctText="错"
                                        }else if(item.studentHomeworkAnswerInfo.reviewResult==2){
                                            correctLogo=halfRightLogoSel;
                                            correctText="半对"
                                        }
                                    }
                                }else{
                                    correctLogo=wrongLogoSel;
                                    correctText="错"
                                }

                            }else if(item.canAnswer==0){//主观题
                                isShow=false;
                            }
                        return  <div key={index}>
                                {
                                    item.childQuestionInfoList==null||item.childQuestionInfoList.length==0 ? <div key={index} className="topic-sec">
                                        <div className="topic-sec-cont">
                                            <div className="option-cont">
                                                <h1 className='cont-title'><span>{item.topicIndex}丶</span><span className="topic-type">({item.category})</span><span dangerouslySetInnerHTML={{ __html: item.title }}></span></h1>
                                                <div  className='parent-option-cont'>
                                                <div>
                                                    {
                                                        item.options.map((ele,i)=>{
                                                     /*       console.log(optionsNub[i])
                                                            console.log("答案",item.answer.toString())*/
                                                            let answer=item.answer.toString(),
                                                                optionClass='';//选项类名
                                                                if(item.type==0){//单选题
                                                                    if(answer!==''){
                                                                        if(!!item.studentHomeworkAnswerInfo&&item.studentHomeworkAnswerInfo.answer==optionsNub[i]){
                                                                            if(answer==item.studentHomeworkAnswerInfo.answer){
                                                                                optionClass='option-sel-right';
                                                                            }else{
                                                                                optionClass='option-sel-error';
                                                                            }
                                                                        }
                                                                    }else{
                                                                        optionClass='';
                                                                    }
                                                                }else if(item.type==1){//多选题
                                                                    if(answer!==''){
                                                                        if(!!item.studentHomeworkAnswerInfo&&item.studentHomeworkAnswerInfo.answer.includes(optionsNub[i])==true){
                                                                            if(item.answer.includes(item.studentHomeworkAnswerInfo.answer)==true){
                                                                                optionClass='option-sel-right';
                                                                            }else{
                                                                                optionClass='option-sel-error';
                                                                            }
                                                                        }
                                                                    }else{
                                                                        optionClass='';
                                                                    }
                                                                }
                                                                return <p key={i} className={optionClass}><span className="option">{optionsNub[i]}</span><span className='option-cont-html' dangerouslySetInnerHTML={{ __html: ele }}></span></p>
                                                        })
                                                    }
                                                </div>
                                                 <div>
                                                    {
                                                        degreeData!=''&&degreeData!=null ? <p>
                                                            <span className="title">难度</span>
                                                            <span className="degree">{degreeData}</span>
                                                        </p> : ''
                                                    }
                                                    {
                                                        item.knowledges.length>0 ? <p>
                                                            <span className="title">考点</span>
                                                            {
                                                                item.knowledges.map((ele,i)=>{
                                                                    return <span className="exam-site" key={i}>{ele}</span>
                                                                })
                                                            }
                                                        </p> : ''
                                                    }
                                                </div>
                                                </div>

                                            </div>
                                            <h1 className="topic-sec-head">
                                                <p className="show-parse" data-check={index} data-showType={item.isShow} data-child={false}  onClick={this.showParse.bind(this)}>
                                                    {
                                                        item.isShow=='none' ? <Icon type="eye-o" style={{width:'16px',marginRight:'8px',color: '#CECECE' }} /> : <Icon type="eye" style={{width:'16px',marginRight:'8px',color: '#2dbb55' }} />
                                                    }
                                                    显示解析
                                                </p>
                                                {/*<p className="collect" data-id={item.id} onClick={this.collectHandle.bind(this)}><img src={item.whetherCollected==true ?  collectImg : noCollectImg} alt="" />收藏</p>*/}
                                                <p className="sel-btn">
                                                    {
                                                        isShow==true ? <span className="correct-text"><img src={correctLogo} className='correct-logo'/>{correctText}</span> : <Button type="primary" className="correcting-btn" data-id={item.id} onClick={this.jumpCorrect.bind(this)}>{!!item.studentHomeworkAnswerInfo&&item.studentHomeworkAnswerInfo.reviewResult!==null&&item.studentHomeworkAnswerInfo.reviewResult!=='' ? '已批改' : '待批改'}</Button>
                                                    }
                                                </p>
                                            </h1>
                                             <div className="parse-cont" style={{'display':item.isShow}} data-flagValue={this.state.flag}>
                                                {
                                                    item.answerDetail!=''&&item.answerDetail!=null ? <p><span className="title">答案</span><span className="text" dangerouslySetInnerHTML={{ __html: item.answerDetail}}></span></p> : ''
                                                }
                                                {
                                                    item.answerParsing!=''&&item.answerParsing!=null ? <p><span className="title">解析</span><span className="text" dangerouslySetInnerHTML={{ __html: item.answerParsing}}></span></p> : ''
                                                }
                                                {
                                                    /*item.source!=''&&item.source!=null ? <p><span className="title">题源</span><span className="text" dangerouslySetInnerHTML={{ __html: item.source}}></span></p> : ''*/
                                                }
                                                {
                                                    degreeData!=''&&degreeData!=null ? <p>
                                                        <span className="title">难度</span>
                                                        <span className="degree">{degreeData}</span>
                                                    </p> : ''
                                                }
                                                {
                                                    item.knowledges.length!=0 ? <p>
                                                    <span className="title ">考点</span>
                                                        {
                                                            item.knowledges.map((ele,i)=>{
                                                                return <span className="exam-site" key={i}>{ele}</span>
                                                            })
                                                        }
                                                    </p> : ''
                                                }
                                                {
                                                    item.canAnswer==0 ? <p>
                                                                <span className="title">他的作答</span>
                                                                <span className="text" style={{width:"calc(100% - 72px)"}}>
                                                                {
                                                                    item.studentHomeworkAnswerInfo!==null ? item.studentHomeworkAnswerInfo.answer.split(',').map((ele,i)=>{
                                                                        return <img src={ele} alt="" key={i}/>
                                                                    }) : ''
                                                                }
                                                                </span>
                                                            </p> : ''
                                                }
                                            </div>
                                        </div>
                                    </div> : <div className="topic-sec" style={{border:'0px',padding:'0px'}}>
                                                <div className="topic-sec-cont" style={{padding: '8px 16px 0px 16px',marginBottom:'16px',border:'1px solid #dfe2e5',backgroundColor:'rgba(246, 248, 250, 1)'}}>
                                                    <div className="option-cont">
                                                        <h1 className='cont-title'><span>{item.topicIndex}丶</span><span className="topic-type">({item.category})</span><span dangerouslySetInnerHTML={{ __html: item.title }}></span></h1>
                                                    </div>
                                                </div>
                                                {
                                                    item.childQuestionInfoList.map((childItem,childIndex)=>{
                                                        let childCorrectText='',
                                                            correctLogo='',
                                                            childIsShow=true;//判断区分主客观题，标识显示问题
                                                        if(childItem.canAnswer==1){//客观题
                                                            //是否作答-没作答直接算错
                                                            childIsShow=true;
                                                            if(!!childItem.studentHomeworkAnswerInfo&&childItem.studentHomeworkAnswerInfo.answer==""){
                                                                correctLogo=wrongLogoSel;
                                                                childCorrectText="错"
                                                            }else{
                                                                if(!!childItem.studentHomeworkAnswerInfo&&childItem.studentHomeworkAnswerInfo.reviewResult==0){
                                                                    correctLogo=rightLogoSel;
                                                                    childCorrectText="正确"
                                                                }else if(!!childItem.studentHomeworkAnswerInfo&&childItem.studentHomeworkAnswerInfo.reviewResult==1){
                                                                    correctLogo=wrongLogoSel;
                                                                    childCorrectText="错"
                                                                }else if(!!childItem.studentHomeworkAnswerInfo&&childItem.studentHomeworkAnswerInfo.reviewResult==2){
                                                                    correctLogo=halfRightLogoSel;
                                                                    childCorrectText="半对"
                                                                }
                                                            }
                                                        }else if(childItem.canAnswer==0){//主观题
                                                            childIsShow=false;
                                                        }
                                                        return <div className="topic-sec" key={childIndex} >
                                                                    <div className="topic-sec-cont">
                                                                        <div className="option-cont">
                                                                            <h1 className='cont-title'><span>{(item.topicIndex)+'.'+(childIndex+1)+'丶'}</span><span className="topic-type">({childItem.category})</span><span dangerouslySetInnerHTML={{ __html: childItem.title }}></span></h1>
                                                                            <div  className='child-option-cont'>
                                                                                <div>
                                                                                    {
                                                                                        childItem.options instanceof Array && childItem.options.length>0 ? childItem.options.map((ele,i)=>{
                                                                                                let answer=childItem.answer.toString(),
                                                                                                    optionClass='';//选项类名
                                                                                                    if(childItem.type==0){//单选题
                                                                                                        if(answer!==''){
                                                                                                            if(!!childItem.studentHomeworkAnswerInfo&&childItem.studentHomeworkAnswerInfo.answer==optionsNub[i]){
                                                                                                                if(answer==childItem.studentHomeworkAnswerInfo.answer){
                                                                                                                    optionClass='option-sel-right';
                                                                                                                }else{
                                                                                                                    optionClass='option-sel-error';
                                                                                                                }
                                                                                                            }
                                                                                                        }else{
                                                                                                            optionClass='';
                                                                                                        }
                                                                                                    }else if(childItem.type==1){//多选题
                                                                                                        if(answer!==''){
                                                                                                            if(!!childItem.studentHomeworkAnswerInfo&&childItem.studentHomeworkAnswerInfo.answer.includes(optionsNub[i])==true){
                                                                                                                if(childItem.answer.includes(childItem.studentHomeworkAnswerInfo.answer)==true){
                                                                                                                    optionClass='option-sel-right';
                                                                                                                }else{
                                                                                                                    optionClass='option-sel-error';
                                                                                                                }
                                                                                                            }
                                                                                                        }else{
                                                                                                            optionClass='';
                                                                                                        }
                                                                                                    }
                                                                                            return <p key={i} className={optionClass}><span className="option">{optionsNub[i]}</span><span className='option-cont-html' dangerouslySetInnerHTML={{ __html: ele }}></span></p>
                                                                                        }) : ''
                                                                                    }
                                                                                </div>
                                                                                <div>
                                                                                    {
                                                                                        degreeData!=''&&degreeData!=null ? <p>
                                                                                            <span className="title">难度</span>
                                                                                            <span className="degree">{degreeData}</span>
                                                                                        </p> : ''
                                                                                    }
                                                                                    {
                                                                                        childItem.knowledges instanceof Array && childItem.knowledges.length>0 ? <p>
                                                                                            <span className="title">考点</span>
                                                                                            {
                                                                                                childItem.knowledges.map((ele,i)=>{
                                                                                                    return <span className="exam-site" key={i}>{ele}</span>
                                                                                                })
                                                                                            }
                                                                                        </p> : ''
                                                                                    }
                                                                                </div>
                                                                            </div>

                                                                        </div>
                                                                        <h1 className="topic-sec-head">
                                                                            <p className="show-parse"  data-showType={childItem.isShow}  data-fatherCheck={index} data-check={childIndex} data-child={true} onClick={this.showParse.bind(this)}>
                                                                                {
                                                                                    childItem.isShow=='none' ? <Icon type="eye-o" style={{width:'16px',marginRight:'8px',color: '#CECECE' }} /> : <Icon type="eye" style={{width:'16px',marginRight:'8px',color: '#2dbb55' }} />
                                                                                }
                                                                                显示解析
                                                                            </p>
                                                                            {/*<p className="collect default-sel"><img style={{display:'block'}} src="" alt=""/>收藏</p>*/}
                                                                            <p className="sel-btn">
                                                                                {
                                                                                    childIsShow==true ? <span className="correct-text"><img src={correctLogo} className='correct-logo'/>{childCorrectText}</span> : <Button type="primary" data-id={childItem.id} className="correcting-btn" onClick={this.jumpCorrect.bind(this)}>{!!childItem.studentHomeworkAnswerInfo&&childItem.studentHomeworkAnswerInfo.reviewResult!==null&&childItem.studentHomeworkAnswerInfo.reviewResult!=='' ? '已批改' : '待批改'}</Button>
                                                                                }
                                                                            </p>
                                                                        </h1>
                                                                        <div className="parse-cont" style={{'display':childItem.isShow}} data-flagValue={this.state.flag}>
                                                                            {
                                                                                childItem.answer!=''&&childItem.answer!=null ? <p><span className="title">答案</span><span className="text" dangerouslySetInnerHTML={{ __html: childItem.answer}}></span></p> : ''
                                                                            }
                                                                            {
                                                                                childItem.answerDetail!=''&&childItem.answerDetail!=null ? <p><span className="title">解析</span><span className="text" dangerouslySetInnerHTML={{ __html: childItem.answerDetail}}></span></p> : ''
                                                                            }
                                                                            {
                                                                                /*item.source!=''&&item.source!=null ? <p><span className="title">题源</span><span className="text" dangerouslySetInnerHTML={{ __html: item.source}}></span></p> : ''*/
                                                                            }
                                                                            {
                                                                                degreeData!=''&&degreeData!=null ? <p>
                                                                                    <span className="title">难度</span>
                                                                                    <span className="degree">{degreeData}</span>
                                                                                </p> : ''
                                                                            }
                                                                            {
                                                                                childItem.knowledges instanceof Array && childItem.knowledges.length>0 ? <p>
                                                                                <span className="title ">考点</span>
                                                                                    {
                                                                                        childItem.knowledges.map((ele,i)=>{
                                                                                            return <span className="exam-site" key={i}>{ele}</span>
                                                                                        })
                                                                                    }
                                                                                </p> : ''
                                                                            }
                                                                            {
                                                                                childItem.canAnswer==0 ? <p>
                                                                                            <span className="title">他的作答</span>
                                                                                            <span className="text" style={{width:"calc(100% - 72px)"}}>
                                                                                            {
                                                                                                childItem.studentHomeworkAnswerInfo!==null ? childItem.studentHomeworkAnswerInfo.answer.split(',').map((ele,i)=>{
                                                                                                    return <img src={ele} alt="" key={i}/>
                                                                                                }) : ''
                                                                                            }
                                                                                            </span>
                                                                                        </p> : ''
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                        })
                                                    }
                                              </div>
                                }
                                </div>
                    })  : <div style={{'font-size':'16px','text-align':'center','margin':'300px auto',"display":this.state.loadingShow=='block' ? 'none' : 'block'}}><Icon type="exclamation-circle" style={{marginRight:'5px',color:'rgba(255, 159, 0, 1)'}}/>暂无数据~</div>
                }
                </div>
                <Pagination currentPage={this.state.currentPage} topicListLen={this.state.topicListLen} paginationSel={this.paginationSel.bind(this)}/>
                <Modal
                  title="收藏试题"
                  visible={this.state.collectVisible}
                  cancelText="取消"
                  okText="确定"
                  width='420px'
                  onOk={this.collectHandleOk.bind(this)}
                  onCancel={this.collectHandleCancel.bind(this)}
                >
                  <Row gutter={8}>
                    <Col span={4} offset={2}>
                        <span>收藏至:</span>
                    </Col>
                    <Col span={6}>
                        <Select
                            mode="multiple"
                            placeholder="请选择习题集"
                            key={this.state.defaultCollectProblemData.length.toString()}
                            defaultValue={this.state.defaultCollectProblemData}
                            style={{ width: '244px' ,marginTop:'-10px'}}
                            onChange={this.collectSel.bind(this)}>
                            {
                                this.state.collectList.map((item,index)=>{
                                    return <Option key={item.id} value={item.name}>{item.name}</Option>
                                })
                            }
                        </Select>
                    </Col>
                  </Row>
                  <Row gutter={8} style={{marginTop:'20px'}}>
                    <Col span={16} offset={2}>
                        <span style={{color: 'rgba(45, 187, 85, 1)',fontSize: '14px',cursor:'pointer'}} onClick={this.addColletBtn.bind(this)}>+添加习题集</span>
                    </Col>
                  </Row>
                  {
                    this.state.isAddcollectShow==true ? <Row gutter={8} style={{marginTop:'20px'}}>
                                                            <Col span={5} offset={2}>
                                                                <span>题集名称</span>
                                                            </Col>
                                                        </Row> : ''
                  }
                  {
                    this.state.isAddcollectShow==true ? <Row gutter={8} style={{marginTop:'20px'}}>
                                                            <Col span={16} offset={2}>
                                                                <Input placeholder="请输入习题集名称" onChange={this.collectInput.bind(this)}/>
                                                            </Col>
                                                            <Col span={6}  style={{marginTop:'-5px'}}>
                                                                <p style={{float:'left',marginTop:'10px',fontSize: '14px',color:'rgba(51,51,51,1)'}}>
                                                                    <span style={{marginRight:'8px',color: 'rgba(45, 187, 85, 1)',cursor:'pointer'}} onClick={this.saveCollectBtn.bind(this)}>保存</span><span style={{cursor:'pointer'}} onClick={this.cancelCollectBtn.bind(this)}>取消</span>
                                                                </p>
                                                            </Col>
                                                        </Row> : ''
                  }
                </Modal>
            </div>
        )
    }
    //试题报告 学生报告
    callback(e){

    }

    //查看解析
    showParse(e){
        let isShow=e.currentTarget.getAttribute('data-showType'),
            dataIndex=e.currentTarget.getAttribute('data-check'),
            dataChild=e.currentTarget.getAttribute('data-child'),//是否是多view的题
            topicLists=this.state.topicList;
            console.log('查看解析',dataChild,isShow)
            if(dataChild=='true'){
                let dataFatherCheck=e.currentTarget.getAttribute('data-fatherCheck');
                if(isShow=='none'){
                    topicLists.questionInfoList[dataFatherCheck].childQuestionInfoList[dataIndex].isShow='block';
                    this.setState({topicList:topicLists,flag:!this.state.flag});
                }else{
                    topicLists.questionInfoList[dataFatherCheck].childQuestionInfoList[dataIndex].isShow='none';
                    this.setState({topicList:topicLists,flag:!this.state.flag});
                }
            }else{
                if(isShow=='none'){
                    topicLists.questionInfoList[dataIndex].isShow='block';
                    this.setState({topicList:topicLists,flag:!this.state.flag});
                }else{
                    topicLists.questionInfoList[dataIndex].isShow='none';
                    this.setState({topicList:topicLists,flag:!this.state.flag});
                }
            }

    }
    paginationSel(page){
        console.log(page)
        this.setState({
            loadingShow:'block',
            currentPage:page
        })
        let homeworkId=this.props.params.homeworkId,
            studentId=this.props.params.studentId,
            pageNumber=page-1,
            pageSize=5;
            this.specifyStudentStatistical.bind(this,loginToken,homeworkId,studentId,pageNumber,pageSize)();
    }
    //获取习题集列表
    getCollectList(collectQustionId){
        const resultCollectSearchList = collectSearchList(loginToken,collectQustionId);
                resultCollectSearchList.then(res => {
                    return res.json()
                }).then(json => {
                    // 处理获取的数据
                    const data = json
                    if (data.result) {
                        let collectList=data.data;
                            //每次调出收藏弹窗，默认选中已存在的习题集
                            let defaultCollectProblemData=[],
                                collectProblemDataStr='';
                                for (var i = 0; i < collectList.length; i++) {
                                    if(collectList[i].questionId==collectQustionId){
                                        defaultCollectProblemData.push(collectList[i].name);
                                        collectProblemDataStr+=collectList[i].id+',';
                                        collectProblemDataStr=collectProblemDataStr.substring(0,collectProblemDataStr.length-1);

                                    }
                                }
                                console.log("默认",defaultCollectProblemData)
                                this.setState({
                                    defaultCollectProblemData:defaultCollectProblemData,
                                    collectProblemData:collectProblemDataStr,
                                    collectList:collectList,
                                    flag:!this.state.flag
                                })
                    }
                }).catch(ex => {
                    // 发生错误
                    if (__DEV__) {
                        console.error('暂无数据, ', ex.message)
                    }
                })
        this.setState({
            collectVisible:true
        })
    }
    //收藏
    collectHandle(e){
        console.log('题目id',e.target.getAttribute('data-id'))
        let collectQustionId=e.target.getAttribute('data-id');
            this.getCollectList.bind(this,collectQustionId)();
            this.setState({
                collectQustionId:collectQustionId
            })
    }
    //选择收藏习题集
    collectSel(value){
      console.log(value.toString())
      let collectList=this.state.collectList,
          valueId=[];
          for (var i = 0; i < collectList.length; i++) {
              for (var j = 0; j < value.length; j++) {
                  if(collectList[i].name==value[j]){
                        valueId.push(collectList[i].id)
                   }
              }

          }
          this.setState({
            collectProblemData:valueId.toString()
          })
    }
    //输入习题集名称
    collectInput(e){
        console.log(e.target.value)
        this.setState({
            newProblemName:e.target.value
        })
    }
    //添加新习题集-显示
    addColletBtn(){
        this.setState({
            isAddcollectShow:true
        })
    }

    //添加习题集-保存
    saveCollectBtn(){
        let name=this.state.newProblemName;//新习题集名字
        const resultAddProblem = addProblem(loginToken,name);
                resultAddProblem.then(res => {
                    return res.json()
                }).then(json => {
                    // 处理获取的数据
                    const data = json
                    if (data.result) {
                        //添加成功之后重新渲染一下收藏习题集列表
                        let collectQustionId=this.state.collectQustionId;
                            this.getCollectList.bind(this,collectQustionId)();
                            this.setState({
                                isAddcollectShow:false
                            })
                    }
                }).catch(ex => {
                    // 发生错误
                    if (__DEV__) {
                        console.error('暂无数据, ', ex.message)
                    }
                })
    }
    //添加习题集-取消
    cancelCollectBtn(){
        this.setState({
            isAddcollectShow:false
        })
    }
    //收藏确定
    collectHandleOk(){
        let collectIds=this.state.collectProblemData,
            questionId=this.state.collectQustionId;
            console.log("保存",questionId)
            const resultAddorcancelCollect = addorcancelCollect(loginToken,collectIds,questionId);
                    resultAddorcancelCollect.then(res => {
                        return res.json()
                    }).then(json => {
                        // 处理获取的数据
                        const data = json
                        if (data.result) {
                            let whetherCollected=data.data.whetherCollected,
                                topicList=this.state.topicList;
                                for (var i = 0; i < topicList.length; i++) {
                                    if(topicList[i].id==questionId){
                                        topicList[i].whetherCollected=whetherCollected;
                                    }
                                }
                                console.log("重新渲染",whetherCollected,topicList)
                                this.setState({
                                    topicList:topicList,
                                    collectVisible:false,
                                    flag:!this.state.flag
                                })

                        }
                    }).catch(ex => {
                        // 发生错误
                        if (__DEV__) {
                            console.error('暂无数据, ', ex.message)
                        }
                    })
            this.setState({
                collectVisible:false
            })
    }
    //取消收藏
    collectHandleCancel(){
        this.setState({
            collectVisible:false
        })
    }
    //跳转批改
    jumpCorrect(e){
         let homeworkId=this.state.topicList.studentHomeworkInfo.homeworkId,
            studentId=this.state.topicList.studentHomeworkInfo.studentId,
            questionId=e.currentTarget.getAttribute('data-id'),//用来点击过去批改定位某道题用
            correctType=2;//存储类型-判断是从哪个页面跳转到作业批改的 0 作业详情跳转 1 试题详情跳转 2学生报告跳转
            hashHistory.push('/correct-homework/' + encodeURIComponent(homeworkId)+'/'+ encodeURIComponent(studentId)+'/1/'+encodeURIComponent(questionId)+'/'+this.props.params.type+'/'+this.props.params.classId);
            //存储类型-判断是从哪个页面跳转到作业详情的
            localStorage.setItem('correctType',correctType);
    }
}

export default HomeStuDetail
