/**
 * 批改作业
 */
import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import { Link, hashHistory } from 'react-router'
import { Radio , Checkbox , Button , Icon , message , Carousel , Breadcrumb,Spin,Input,Menu, Dropdown} from 'antd';
import { getHomeworkQuestionDetail , getStudentAnswerList , getTopicAnswerList , correctAnswer , convertBase64 , canvasUpload,remarkLibrary} from '../../fetch/homework-report/homework-report';
import { dragBind , markFun , remarkFun , iconRemark , saveMark } from './init.js'
import * as Constants from '../../constants/store'
import $ from  'jquery'
import './style.less'
const loginToken=localStorage.getItem("loginToken");
const rightLogo=require('../../static/img/right.png');
const halfRightLogo=require('../../static/img/half-right.png');
const wrongLogo=require('../../static/img/wrong.png');
const correctingAgainLogo=require('../../static/img/correcting-again.png');
const rightLogoSel=require('../../static/img/right-sel.png');
const halfRightLogoSel=require('../../static/img/half-right-sel.png');
const wrongLogoSel=require('../../static/img/wrong-sel.png');
const correctingAgainLogoSel=require('../../static/img/correcting-again-sel.png');
const defaultAvatar=require('../../static/img/default-avatar.png');

//标记
let thisIconType = null;//当前的标记类型
let markNum = 0;//当前的标记类型
let thisAudio = null; //当前正在标记小题或者整卷
let testPaperScroll = null; //X轴滚动条

class CorrectHomework extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
        this.state={
            topicList:{},//题目过来-列表
            studentList:[],//题目过来-左侧学生列表
            topicListLen:'',//题目过来-数据条数
            questionListData:[],//学生过来-题目列表
            questionList:{},//学生过来-题目列表
            flag:false,
            isCheck:'block',//判断列表什么时候显示可选题目按钮
            loadingShow:'block',//加载图标
            detailLoadingShow:'block',//加载图标
            topicId:'',//题目id
            parentType:1,
            answerDetail:[],//学生答题详情
            stuIndex:0,//当前第几位学生
            homeworkId:this.props.params.homeworkId,//批改-作业id
            studentId:'',//批改-学生id
            questionId:'',//批改-题目id
            isAllowCorrect:false,//是否允许批改
            correctFinish:3,//区分批改那个logo，给上相应的选中logo  3是随便设置的值因为''与0一样
            parentType:this.props.params.parentType,//0 试题纬度过来的 1 学生纬度过来的
            topDistance:0,
            remarkLibraryData:[]//评语库
        }

    }
    //当组件接收到新的 props 时，会触发该函数。在改函数中，通常可以调用 this.setState 方法来完成对 state 的修改。
    componentWillReceiveProps(nextProps){
    }
    componentWillMount(){
        let homeworkId=!!this.props.params.homeworkId ? this.props.params.homeworkId : '',//作业id
            questionStuId=!!this.props.params.questionStuId ? this.props.params.questionStuId : '',//题目id-学生id
            parentType=this.state.parentType;//0 试题纬度过来的 1 学生纬度过来的
            if(parentType=='0'){
                //获取题目详情
                this.getHomeworkQuestionDetail.bind(this,loginToken,questionStuId)();
                //指定题目-获取待批改的学生答案列表
                this.getStudentAnswerList.bind(this,loginToken,homeworkId,questionStuId)();
            }else if(parentType=='1'){
                //指定学生-获取待批改的题目答案列表
                this.getTopicAnswerList.bind(this,loginToken,homeworkId,questionStuId)()
            }

            //评语库
            this.remarkLibrary.bind(this,loginToken)()
    }
    componentDidMount(){
        window.addEventListener('scroll', this.handleScroll.bind(this));
        this.setState({
            flag:!this.state.flag
        })

    }
    componentDidUpdate(){
        console.log('更新')
        this.setState({
            detailLoadingShow:'none'
        })
    }
    //获取题目数据
    getHomeworkQuestionDetail(loginToken,questionId){
        const resultHomeworkDetail = getHomeworkQuestionDetail(loginToken,questionId);
                resultHomeworkDetail.then(res => {
                    return res.json()
                }).then(json => {
                    // 处理获取的数据
                    const data = json
                    if (data.result) {
                        let topicListData=data.data;
                            if(typeof(topicListData.options)=='string'&&topicListData.options.indexOf('[')>-1){
                               topicListData.options=JSON.parse(topicListData.options);
                               console.log(topicListData.options)
                            }else if(topicListData.options==null||topicListData.options==''){
                                topicListData.options=[];
                            }
                            topicListData.knowledges=topicListData.knowledges==null||'' ? [] : topicListData.knowledges.split(',');//处理考点
                            topicListData.isShow='none';//初始化不显示解析
                            //给题目列表添加序列号
                            topicListData.topicIndex=1;

                            //循环遍历如果有子题，是多view时给小题加上isShow
                            if(topicListData.childQuestionInfoList!=null&&topicListData.childQuestionInfoList.length!=0){
                                topicListData.childQuestionInfoList.map((item,index)=>{
                                        if(typeof(item.options)=='string'&&item.options.indexOf('[')>-1){
                                           item.options=JSON.parse(item.options);
                                        }else if(item.options==null||item.options==''){
                                            item.options=[];
                                        }
                                        item.knowledges=item.knowledges==null||item.knowledges==''  ? [] : item.knowledges.split(',');//处理考点
                                        item.isShow='none';//初始化不显示解析
                                })
                            }
                            this.setState({
                                topicList:topicListData,
                                questionId:this.props.params.questionStuId,
                                isCheck:'block',
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
    //指定题目-获取待批改的学生答案列表
    getStudentAnswerList(loginToken,homeworkId,questionId){
        const resultStudentAnswerList = getStudentAnswerList(loginToken,homeworkId,questionId);
                resultStudentAnswerList.then(res => {
                    return res.json()
                }).then(json => {
                    // 处理获取的数据
                    const data = json
                    if (data.result) {
                        let studentList=data.data;
                        this.setState({
                            studentList:studentList,
                            //answerDetail:!!data.data[0].studentHomeworkAnswerInfo&&data.data[0].studentHomeworkAnswerInfo.answer!='' ? data.data[0].studentHomeworkAnswerInfo.answer.split(',') : [],
                            studentId:data.data[0].id,
                        })
                       //初始化第一个学生-判断当前学生是否已批改过的
                        this.dealAnswer.bind(this,studentList[0])()


                    }
                }).catch(ex => {
                    // 发生错误
                    if (__DEV__) {
                        console.error('暂无数据, ', ex.message)
                    }
                })

    }
    //指定学生-获取待批改的题目答案列表
    getTopicAnswerList(loginToken,homeworkId,studentId){
        const resultStudentAnswerList = getTopicAnswerList(loginToken,homeworkId,studentId);
                resultStudentAnswerList.then(res => {
                    return res.json()
                }).then(json => {
                    // 处理获取的数据
                    const data = json
                    if (data.result) {
                        let questionList=data.data,
                            questionArr=[],//因为map里面不支持删除，所以新声明一个数组盛放
                            initialQuestion={};//初始化进来展示数据-盛放容器
                            for (var i = 0; i < questionList.length; i++) {
                                //将学生答题内容字符串转换为数组
                                if(Object.keys(questionList[i]).length!=0){
                                    questionList[i].answer=questionList[i].answer.split(',');
                                    if(typeof(questionList[i].options)=='string'&&questionList[i].options.indexOf('[')>-1){
                                       questionList[i].options=JSON.parse(questionList[i].options);
                                    }else if(questionList[i].options==null||questionList[i].options==''){
                                        questionList[i].options=[];
                                    }
                                    questionList[i].knowledges=questionList[i].knowledges==null||'' ? [] : questionList[i].knowledges.split(',');//处理考点
                                    questionList[i].isShow='none';//初始化不显示解析
                                    //给题目列表添加序列号
                                    questionList[i].topicIndex=i+1;
                                    //判断当前进来的是否从学生报告众多题目当中点过来的-如果是那么需要定位
                                    if(this.props.params.positionTopic==questionList[i].id){
                                        initialQuestion=questionList[i];
                                        this.setState({
                                            stuIndex:i
                                        })
                                    }else if(this.props.params.positionTopic==0){
                                        initialQuestion=questionList[0];
                                    }
                                }

                            }
                            //循环遍历如果有子题，是多view时给小题加上isShow
                            questionList.map((ele,i)=>{
                                if(Object.keys(ele).length!=0){
                                    if(ele.childQuestionInfoList!=null&&ele.childQuestionInfoList.length!=0){
                                        ele.childQuestionInfoList.map((item,index)=>{
                                            if(Object.keys(item).length!=0){
                                                if(typeof(item.options)=='string'&&item.options.indexOf('[')>-1){
                                                   item.options=JSON.parse(item.options);
                                                }else if(item.options==null||item.options==''){
                                                    item.options=[];
                                                }
                                                item.knowledges=item.knowledges==null||item.knowledges==''  ? [] : item.knowledges.split(',');//处理考点
                                                item.isShow='none';//初始化不显示解析

                                                //面向对象问题：深拷贝一个新对象，要不同一个内存地址造成的，之后循环改变的对象值造成之前的也变化了，所以childId一直是最后一个
                                                let obj=Object.assign({childId:item.id,serial:(i+1)+'.'+(index+1),postionIndex:index},ele);
                                                questionArr.push(obj)

                                                /*//判断当前进来的是否从学生报告众多题目当中点过来的-如果是那么需要定位
                                                if(this.props.params.positionTopic==item.id){
                                                    initialQuestion=questionArr[i+index];
                                                    this.setState({
                                                        stuIndex:i+index
                                                    })
                                                }else if(this.props.params.positionTopic==0){
                                                    console.log("指定学生的数据",questionArr)
                                                    initialQuestion=questionArr[0];
                                                }
                                                */
                                            }

                                        })


                                    }else{
                                        //为了展示真实题号
                                        ele.serial=i+1;
                                        questionArr.push(ele);
                                    }
                                }
                            })
                            //判断当前进来的是否从学生报告众多题目当中点过来的-如果是那么需要定位
                            console.log('定位数据',questionArr,this.props.params.positionTopic)

                            questionArr.forEach((item,index)=>{
                                if(!!item.childId){//多view
                                    if(this.props.params.positionTopic==item.childId){
                                        initialQuestion=questionArr[index];
                                        this.setState({
                                            stuIndex:index
                                        })
                                    }else if(this.props.params.positionTopic==0){
                                        initialQuestion=questionArr[0];
                                    }
                                }else{//单view
                                    if(this.props.params.positionTopic==item.id){
                                        initialQuestion=questionArr[index];
                                        this.setState({
                                            stuIndex:index
                                        })
                                    }else if(this.props.params.positionTopic==0){
                                        initialQuestion=questionArr[0];
                                    }
                                }

                            })
                            this.setState({
                                questionListData:questionArr,
                                questionList:initialQuestion,
                                //answerDetail:!!initialQuestion.studentHomeworkAnswerInfo&&initialQuestion.studentHomeworkAnswerInfo.answer!='' ? initialQuestion.studentHomeworkAnswerInfo.answer.split(',') : [],
                                studentId:this.props.params.questionStuId,
                                questionId:initialQuestion.id,
                                loadingShow:'none'
                            })
                            //初始化第一道题-判断当前题目是否已批改过的
                            this.dealAnswer.bind(this,initialQuestion)()
                    }
                }).catch(ex => {
                    // 发生错误
                    if (__DEV__) {
                        console.error('暂无数据, ', ex.message)
                    }
                })

    }
    //批改作业
    correctAnswer(loginToken,homeworkId,studentId,questionId,correct,reviewFlag){
        const resultCorrectAnswer = correctAnswer(loginToken,homeworkId,studentId,questionId,correct,reviewFlag);
                resultCorrectAnswer.then(res => {
                    return res.json()
                }).then(json => {
                    // 处理获取的数据
                    const data = json
                    if (data.result) {
                        message.success('批改成功')
                       //每次批改完成功之后将此学生作答状态标记为3
                        let parentType=this.state.parentType,//0 试题纬度过来的 1 学生纬度过来的
                            newStudentList=this.state.studentList,
                            newQuestionListData=this.state.questionListData;
                            if(parentType=='0'&&newStudentList.length!=0){//0 试题纬度过来的
                                let newStuList=newStudentList[this.state.stuIndex];
                                    newStuList.studentHomeworkAnswerInfo.state=3;
                                    newStuList.studentHomeworkAnswerInfo.reviewFlag=reviewFlag;
                                    newStuList.studentHomeworkAnswerInfo.reviewResult=correct;//实时批改更新左侧学生对错logo
                                    this.setState({
                                        studentList:newStudentList,
                                        flag:!this.state.flag
                                    })
                                    //批改成功之后删除所有标记
                                    $('.span_mark').remove();

                            }else if(parentType=='1'&&newQuestionListData.length!=0){//1 学生纬度过来的
                                let newQueList=newQuestionListData[this.state.stuIndex];
                                    //多view题
                                    if(newQueList.hasOwnProperty("childQuestionInfoList")&&newQueList.childQuestionInfoList!=null&&newQueList.childQuestionInfoList.length!=0){
                                        //注意。。。判断当前批改的是否是无批改状态的题-如果是那么studentHomeworkAnswerInfo为null
                                        if(newQueList.childQuestionInfoList[newQuestionListData[this.state.stuIndex].postionIndex].studentHomeworkAnswerInfo===null){
                                            newQueList.childQuestionInfoList[newQuestionListData[this.state.stuIndex].postionIndex].studentHomeworkAnswerInfo={};
                                            newQueList.childQuestionInfoList[newQuestionListData[this.state.stuIndex].postionIndex].studentHomeworkAnswerInfo.state=3;
                                            newQueList.childQuestionInfoList[newQuestionListData[this.state.stuIndex].postionIndex].studentHomeworkAnswerInfo.reviewFlag=reviewFlag;
                                            newQueList.childQuestionInfoList[newQuestionListData[this.state.stuIndex].postionIndex].studentHomeworkAnswerInfo.reviewResult=correct;//实时批改更新左侧学生对错logo
                                        }else{
                                            newQueList.childQuestionInfoList[newQuestionListData[this.state.stuIndex].postionIndex].studentHomeworkAnswerInfo.state=3;
                                            newQueList.childQuestionInfoList[newQuestionListData[this.state.stuIndex].postionIndex].studentHomeworkAnswerInfo.reviewFlag=reviewFlag;
                                            newQueList.childQuestionInfoList[newQuestionListData[this.state.stuIndex].postionIndex].studentHomeworkAnswerInfo.reviewResult=correct;//实时批改更新左侧学生对错logo
                                        }

                                        this.setState({
                                            questionListData:newQuestionListData,
                                            flag:!this.state.flag
                                        })
                                    }else{//单view题
                                        //注意。。。判断当前批改的是否是无批改状态的题-如果是那么studentHomeworkAnswerInfo为null
                                        if(newQueList.studentHomeworkAnswerInfo===null){
                                            newQueList.studentHomeworkAnswerInfo={};
                                            newQueList.studentHomeworkAnswerInfo.state=3;
                                            newQueList.studentHomeworkAnswerInfo.reviewFlag=reviewFlag;
                                            newQueList.studentHomeworkAnswerInfo.reviewResult=correct;//实时批改更新左侧学生对错logo
                                        }else{
                                            newQueList.studentHomeworkAnswerInfo.state=3;
                                            newQueList.studentHomeworkAnswerInfo.reviewFlag=reviewFlag;
                                            newQueList.studentHomeworkAnswerInfo.reviewResult=correct;//实时批改更新左侧学生对错logo
                                        }

                                        this.setState({
                                            questionListData:newQuestionListData,
                                            flag:!this.state.flag
                                        })

                                    }
                                    //批改成功之后删除所有标记
                                    $('.span_mark').remove();
                            }
                            //批改完一道题之后自动跳转到下一题
                            this.switchNext.bind(this)()
                    }else{
                        message.warning("批改失败")
                    }
                }).catch(ex => {
                    // 发生错误
                    if (__DEV__) {
                        console.error('暂无数据, ', ex.message)
                    }
                })

    }
    //评语库
    remarkLibrary(loginToken){
        const resultRemark=remarkLibrary(loginToken);
                resultRemark.then(res=>{
                   return res.json()//JSON.parse(response.text())
                }).then((json)=>{
                    const data=json;
                    if(data.result){
                        this.setState({
                            remarkLibraryData:data.data
                        })
                    }
                }).catch(ex=>{
                    // 发生错误
                    if (__DEV__) {
                        console.error('暂无数据, ', ex.message)
                    }
                })
    }
    render() {
        const remarkmenu = (
              <Menu className="remark-box" onClick={this.iconRemark.bind(this)}>
              {
                Constants.isFormat(this.state.remarkLibraryData,Array)&&this.state.remarkLibraryData.map((item,index)=>{
                    return <Menu.Item key={item.id} title={item.remark} >{item.remark}</Menu.Item>
                })
              }
              </Menu>
            );
        let topicList={},
            parentType=this.state.parentType,//0 试题纬度过来的 1 学生纬度过来的
            answerList=[],//左侧答题列表
            studentName='',//学生名字
            degreeData="",//难度展示
            degreeTxt='',
            optionsNub=['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'],
            jumpType=this.props.params.type,//存储类型-判断是从哪个页面跳转到作业详情的
            classId=this.props.params.classId,//存储类型-判断是从哪个页面跳转到作业详情的
            classJumpType=localStorage.getItem('classJumpType'),
            correctType=localStorage.getItem('correctType'),//存储类型-判断是从哪个页面跳转到作业批改的 0 作业详情跳转 1 试题详情跳转 2学生报告跳转
            breadcrumbTxtFirst='',//第一级面包屑
            breadcrumbTxt="";//面包屑
            //0 试题纬度过来的 1 学生纬度过来的
            if(parentType=='0'){
                topicList=this.state.topicList;
                answerList=this.state.studentList;//左侧答题列表
            }else if(parentType=='1'){
                topicList=this.state.questionList;
                answerList=this.state.questionListData;//左侧答题列表
                studentName=JSON.stringify(topicList) != "{}"&&!!topicList.studentHomeworkAnswerInfo ? topicList.studentHomeworkAnswerInfo.studentNickname : '';//学生的作业
            }
            degreeTxt=JSON.stringify(topicList) != "{}" ? topicList.degree/20 : 0
            //计算难度
            if(!!degreeTxt){
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
            }
            //面包屑
            if(jumpType==0){//作业首页过来的
                if(correctType==0){
                    breadcrumbTxt=<Breadcrumb separator=">">
                                    <Breadcrumb.Item><Link to='/index-homework'>课后作业</Link></Breadcrumb.Item>
                                    <Breadcrumb.Item ><Link to={'/homework-detail/'+this.props.params.homeworkId+'/'+jumpType+'/0'}>作业批改</Link></Breadcrumb.Item>
                                    <Breadcrumb.Item>批改</Breadcrumb.Item>
                                </Breadcrumb>
                }else if(correctType==1){
                     breadcrumbTxt=<Breadcrumb separator=">">
                                    <Breadcrumb.Item><Link to='/index-homework'>课后作业</Link></Breadcrumb.Item>
                                    <Breadcrumb.Item ><Link to={'/homework-detail/'+this.props.params.homeworkId+'/'+jumpType+'/0'}>作业批改</Link></Breadcrumb.Item>
                                    <Breadcrumb.Item ><Link to={'/homework-topic-detail/'+this.props.params.homeworkId+'/'+this.props.params.questionStuId+'/'+jumpType+'/'+classId}>试题详情</Link></Breadcrumb.Item>
                                    <Breadcrumb.Item>批改</Breadcrumb.Item>
                                </Breadcrumb>
                }else if(correctType==2){
                    breadcrumbTxt=<Breadcrumb separator=">">
                                    <Breadcrumb.Item><Link to='/index-homework'>课后作业</Link></Breadcrumb.Item>
                                    <Breadcrumb.Item ><Link to={'/homework-detail/'+this.props.params.homeworkId+'/'+jumpType+'/0'}>作业批改</Link></Breadcrumb.Item>
                                    <Breadcrumb.Item ><Link to={'/homework-student-detail/'+this.props.params.homeworkId+'/'+this.props.params.questionStuId+'/'+jumpType+'/'+classId}>学生报告</Link></Breadcrumb.Item>
                                    <Breadcrumb.Item>批改</Breadcrumb.Item>
                                </Breadcrumb>
                }
            }else if(jumpType==2){//我的班级过来的
                if(classJumpType==0){
                    if(correctType==0){
                        breadcrumbTxt=<Breadcrumb separator=">">
                                        <Breadcrumb.Item><Link to='/homework-class'>我的班级</Link></Breadcrumb.Item>
                                        <Breadcrumb.Item><Link to={'/homework-class-detail/'+classId}>班级详情</Link></Breadcrumb.Item>
                                        <Breadcrumb.Item ><Link to={'/homework-detail/'+this.props.params.homeworkId+'/'+jumpType+'/'+classId}>作业批改</Link></Breadcrumb.Item>
                                        <Breadcrumb.Item>批改</Breadcrumb.Item>
                                    </Breadcrumb>
                    }else if(correctType==1){
                         breadcrumbTxt=<Breadcrumb separator=">">
                                        <Breadcrumb.Item><Link to='/homework-class'>我的班级</Link></Breadcrumb.Item>
                                        <Breadcrumb.Item><Link to={'/homework-class-detail/'+classId}>班级详情</Link></Breadcrumb.Item>
                                        <Breadcrumb.Item ><Link to={'/homework-detail/'+this.props.params.homeworkId+'/'+jumpType+'/'+classId}>作业批改</Link></Breadcrumb.Item>
                                        <Breadcrumb.Item ><Link to={'/homework-topic-detail/'+this.props.params.homeworkId+'/'+this.props.params.questionStuId+'/'+jumpType+'/'+classId}>试题详情</Link></Breadcrumb.Item>
                                        <Breadcrumb.Item>批改</Breadcrumb.Item>
                                    </Breadcrumb>
                    }else if(correctType==2){
                        breadcrumbTxt=<Breadcrumb separator=">">
                                        <Breadcrumb.Item><Link to='/homework-class'>我的班级</Link></Breadcrumb.Item>
                                        <Breadcrumb.Item><Link to={'/homework-class-detail/'+classId}>班级详情</Link></Breadcrumb.Item>
                                        <Breadcrumb.Item ><Link to={'/homework-detail/'+this.props.params.homeworkId+'/'+jumpType+'/'+classId}>作业批改</Link></Breadcrumb.Item>
                                        <Breadcrumb.Item ><Link to={'/homework-student-detail/'+this.props.params.homeworkId+'/'+this.props.params.questionStuId+'/'+jumpType+'/'+classId}>学生报告</Link></Breadcrumb.Item>
                                        <Breadcrumb.Item>批改</Breadcrumb.Item>
                                    </Breadcrumb>
                    }
                }
            }else if(jumpType==3){//我的班级-学生详情过来的
                breadcrumbTxt=<Breadcrumb separator=">">
                                    <Breadcrumb.Item><Link to='/homework-class'>我的班级</Link></Breadcrumb.Item>
                                    <Breadcrumb.Item><Link to={'/homework-class-detail/'+classId}>班级详情</Link></Breadcrumb.Item>
                                    <Breadcrumb.Item><Link to={'/homework-class-stuhistory'+'/'+classId+'/'+this.props.params.questionStuId}>学生详情</Link></Breadcrumb.Item>
                                    <Breadcrumb.Item ><Link to={'/homework-student-detail/'+this.props.params.homeworkId+'/'+this.props.params.questionStuId+'/'+jumpType+'/'+classId}>学生报告</Link></Breadcrumb.Item>
                                    <Breadcrumb.Item>批改</Breadcrumb.Item>
                                </Breadcrumb>
            }
            return (
                <div id="decorate-list" className="clear-fix">
                    <h1 className='header-nav'>
                        {breadcrumbTxt}
                    </h1>
                    <p className='common-sec-title'><span className='sec-title-line'></span><span>试题详情</span></p>
                    <Spin size="large" style={{"fontSize":"30px","display":this.state.loadingShow,'margin':'200px auto'}}/>
                    {
                        JSON.stringify(topicList) != "{}" ? <div>
                                                            {
                                                                topicList.childQuestionInfoList==null||topicList.childQuestionInfoList.length==0 ?  <div className="topic-sec">
                                                                                <div className="topic-sec-cont">
                                                                                    <div className="option-cont">
                                                                                        <h1 className='cont-title'><span>{topicList.topicIndex}丶</span><span className="topic-type">({topicList.category})</span><span dangerouslySetInnerHTML={{ __html: topicList.title }}></span></h1>
                                                                                        <div  className='parent-option-cont'>
                                                                                            <div>
                                                                                                {
                                                                                                    topicList.options.length>0 ? topicList.options.map((ele,i)=>{
                                                                                                        return <p key={i}><span className="option">{optionsNub[i]}</span><span className='option-cont-html' dangerouslySetInnerHTML={{ __html: ele }}></span></p>
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
                                                                                                    topicList.knowledges.length>0 ? <p>
                                                                                                        <span className="title">考点</span>
                                                                                                        {
                                                                                                            topicList.knowledges.map((ele,i)=>{
                                                                                                                return <span className="exam-site" key={i}>{ele}</span>
                                                                                                            })
                                                                                                        }
                                                                                                    </p> : ''
                                                                                                }
                                                                                            </div>
                                                                                        </div>

                                                                                    </div>
                                                                                    <h1 className="topic-sec-head">
                                                                                        <p className="show-parse"  data-showType={topicList.isShow} onClick={this.showParse.bind(this)}>
                                                                                            {
                                                                                                topicList.isShow=='none' ? <Icon type="eye-o" style={{width:'16px',marginRight:'8px',color: '#CECECE' }} /> : <Icon type="eye" style={{width:'16px',marginRight:'8px',color: '#2dbb55' }} />
                                                                                            }
                                                                                            显示解析
                                                                                        </p>
                                                                                        {/*<p className="collect default-sel"><img style={{display:'block'}} src={require('../../static/img/collect-sel.png')} alt=""/>收藏</p>*/}
                                                                                    </h1>
                                                                                     <div className="parse-cont" style={{'display':topicList.isShow}} data-flagValue={this.state.flag}>
                                                                                        {
                                                                                            topicList.answer!=''&&topicList.answer!=null ? <p><span className="title">答案</span><span className="text" dangerouslySetInnerHTML={{ __html: topicList.answer}}></span></p> : ''
                                                                                        }
                                                                                        {
                                                                                            topicList.answerDetail!=''&&topicList.answerDetail!=null ? <p><span className="title">解析</span><span className="text" dangerouslySetInnerHTML={{ __html: topicList.answerDetail}}></span></p> : ''
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
                                                                                            topicList.knowledges.length!=0 ? <p>
                                                                                            <span className="title ">考点</span>
                                                                                                {
                                                                                                    topicList.knowledges.map((ele,i)=>{
                                                                                                        return <span className="exam-site" key={i}>{ele}</span>
                                                                                                    })
                                                                                                }
                                                                                            </p> : ''
                                                                                        }
                                                                                    </div>
                                                                                </div>
                                                                            </div> : <div className="topic-sec" style={{border:'0px',padding:'0px'}}>
                                                                                        <div className="topic-sec-cont" style={{padding: '8px 16px 0px 16px',marginBottom:'16px',border:'1px solid #dfe2e5',backgroundColor:'rgba(246, 248, 250, 1)'}}>
                                                                                            <div className="option-cont">
                                                                                                <h1 className='cont-title'><span>{topicList.topicIndex}丶</span><span className="topic-type">({topicList.category})</span><span dangerouslySetInnerHTML={{ __html: topicList.title }}></span></h1>
                                                                                            </div>
                                                                                        </div>
                                                                                        {
                                                                                            topicList.childQuestionInfoList.map((item,index)=>{
                                                                                                if(Object.keys(item).length!=0){
                                                                                                    return <div className="topic-sec" key={index} style={{backgroundColor:this.state.stuIndex==topicList.topicIndex-1+index ? 'rgba(45, 187, 85, 0.16)' : ''}}>
                                                                                                            <div className="topic-sec-cont">
                                                                                                                <div className="option-cont">
                                                                                                                    <h1 className='cont-title'><span>{(topicList.topicIndex)+'.'+(index+1)+'丶'}</span><span className="topic-type">({item.category})</span><span dangerouslySetInnerHTML={{ __html: item.title }}></span></h1>
                                                                                                                    <div  className='child-option-cont'>
                                                                                                                        <div>
                                                                                                                            {
                                                                                                                                item.options instanceof Array && item.options.length>0 ? item.options.map((ele,i)=>{
                                                                                                                                    return <p key={i}><span className="option">{optionsNub[i]}</span><span className='option-cont-html'  dangerouslySetInnerHTML={{ __html: ele }}></span></p>
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
                                                                                                                                item.knowledges instanceof Array && item.knowledges.length>0 ? <p>
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
                                                                                                                    <p className="show-parse"  data-showType={item.isShow}  data-check={index} onClick={this.showParse.bind(this)}>
                                                                                                                        {
                                                                                                                            item.isShow=='none' ? <Icon type="eye-o" style={{width:'16px',marginRight:'8px',color: '#CECECE' }} /> : <Icon type="eye" style={{width:'16px',marginRight:'8px',color: '#2dbb55' }} />
                                                                                                                        }
                                                                                                                        显示解析
                                                                                                                    </p>
                                                                                                                    {/*<p className="collect default-sel"><img style={{display:'block'}} src="" alt=""/>收藏</p>*/}
                                                                                                                </h1>
                                                                                                                <div className="parse-cont" style={{'display':item.isShow}} data-flagValue={this.state.flag}>
                                                                                                                    {
                                                                                                                        item.answer!=''&&item.answer!=null ? <p><span className="title">答案</span><span className="text" dangerouslySetInnerHTML={{ __html: item.answer}}></span></p> : ''
                                                                                                                    }
                                                                                                                    {
                                                                                                                        item.answerDetail!=''&&item.answerDetail!=null ? <p><span className="title">解析</span><span className="text" dangerouslySetInnerHTML={{ __html: item.answerDetail}}></span></p> : ''
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
                                                                                                                        item.knowledges instanceof Array && item.knowledges.length>0 ? <p>
                                                                                                                        <span className="title ">考点</span>
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
                                                                                                }

                                                                                            })
                                                                                        }
                                                                                      </div>
                                                            }
                                                            </div> : <div style={{'fontSize':'16px','textAlign':'center','margin':'300px auto',"display":this.state.loadingShow=='block' ? 'none' : 'block'}}><Icon type="exclamation-circle" style={{marginRight:'5px',color:'rgba(255, 159, 0, 1)'}}/>暂无数据~</div>
                    }
                    <p style={{"marginBottom":'10px',"color":"rgba(119, 119, 119, 1)"}}>批改作业</p>
                    <div className="correct-module">
                        <div className="left-correct-module">
                            <p className="title">
                            {
                                parentType=='0' ? '已提交学生' : studentName==null||'' ? '欧拉学生的作业' :  studentName+'的作业'
                            }
                            </p>
                            <div className="correct-list">
                                {
                                    answerList.length>0 ? answerList.map((item,index)=>{
                                        if(parentType=='0'){//指定题目进来
                                            let correctLogoImg="";
                                            if(!!item.studentHomeworkAnswerInfo){//已作答
                                                if(item.studentHomeworkAnswerInfo.reviewResult==null){//未批改
                                                    correctLogoImg="";
                                                }else if(item.studentHomeworkAnswerInfo.reviewResult==0){//已批改-对
                                                    correctLogoImg=rightLogoSel;
                                                }else if(item.studentHomeworkAnswerInfo.reviewResult==1){//已批改-错
                                                    correctLogoImg=wrongLogoSel;
                                                }else if(item.studentHomeworkAnswerInfo.reviewResult==2){//已批改-半对
                                                    correctLogoImg=halfRightLogoSel;
                                                }
                                            }else{//未作答
                                                correctLogoImg="";
                                            }
                                            return <h1 key={index} className={index==this.state.stuIndex ? 'correct-list-data correct-list-data-sel' : 'correct-list-data'} key={index}  data-index={ index } onClick={this.topicViewAnswer.bind(this)}>
                                                    <span>
                                                        <img src={item.avatarUrl==null||'' ? defaultAvatar : item.avatarUrl} alt="" className="head-portrait"/>
                                                    </span>
                                                    <span className="name">{item.nickname==null||'' ? '欧拉学生' :  item.nickname}</span>
                                                    <img src={correctLogoImg} alt="" className="correct-logo"/>
                                                </h1>
                                        }else if(parentType=='1'){//指定学生进来
                                            let questionInfoClass="";

                                            if(item.childQuestionInfoList!=null&&item.childQuestionInfoList.length!=0){//多view
                                                if(!!item.childQuestionInfoList[item.postionIndex].studentHomeworkAnswerInfo){//已作答
                                                    if(item.childQuestionInfoList[item.postionIndex].studentHomeworkAnswerInfo.reviewResult==null){//未批改
                                                        questionInfoClass="questionInfo-circle";
                                                    }else if(item.childQuestionInfoList[item.postionIndex].studentHomeworkAnswerInfo.reviewResult==0){//已批改-对
                                                        questionInfoClass="questionInfo-circle questionInfo-circle-right";
                                                    }else if(item.childQuestionInfoList[item.postionIndex].studentHomeworkAnswerInfo.reviewResult==1){//已批改-错
                                                        questionInfoClass="questionInfo-circle questionInfo-circle-wrong";
                                                    }else if(item.childQuestionInfoList[item.postionIndex].studentHomeworkAnswerInfo.reviewResult==2){//已批改-半对
                                                        questionInfoClass="questionInfo-circle questionInfo-circle-half";
                                                    }
                                                }else{//未作答
                                                    questionInfoClass="questionInfo-circle";
                                                }
                                            }else{//单view
                                                if(!!item.studentHomeworkAnswerInfo){//已作答
                                                    if(item.studentHomeworkAnswerInfo.reviewResult==null){//未批改
                                                        questionInfoClass="questionInfo-circle";
                                                    }else if(item.studentHomeworkAnswerInfo.reviewResult==0){//已批改-对
                                                        questionInfoClass="questionInfo-circle questionInfo-circle-right";
                                                    }else if(item.studentHomeworkAnswerInfo.reviewResult==1){//已批改-错
                                                        questionInfoClass="questionInfo-circle questionInfo-circle-wrong";
                                                    }else if(item.studentHomeworkAnswerInfo.reviewResult==2){//已批改-半对
                                                        questionInfoClass="questionInfo-circle questionInfo-circle-half";
                                                    }
                                                }else{//未作答
                                                    questionInfoClass="questionInfo-circle";
                                                }
                                            }

                                            return <span key={index} className={index==this.state.stuIndex ? "questionInfo-select questionInfo-select-bg" : "questionInfo-select"}><span  className={questionInfoClass} data-question={index} onClick={this.questionSwich.bind(this)}>{item.serial ? item.serial : index+1}</span></span>
                                        }
                                    }) : <div style={{'fontSize':'16px','textAlign':'center','margin':'300px auto',"display":this.state.loadingShow=='block' ? 'none' : 'block'}}><Icon type="exclamation-circle" style={{marginRight:'5px',color:'rgba(255, 159, 0, 1)'}}/>暂无数据~</div>
                                }
                            </div>
                        </div>
                        <div className="right-correct-module">
                            <div className="correct-area">
                                    {
                                        this.state.answerDetail.length>1 ? <span className="arrow-left" onClick={this.arrowLeft.bind(this)}><Icon type="left" style={{color:'#e9e9e9'}}/></span>
                                                                    : ''
                                    }
                                    {
                                        this.state.answerDetail.length>1 ? <span className="arrow-right" onClick={this.arrowRight.bind(this)}><Icon type="right" style={{color:'#e9e9e9'}}/></span>
                                                                        : ''
                                    }
                                <div className="answer-detail-area">
                                    <Icon type="loading" style={{position:'relative','zIndex':'1000',height:'900px','lineHeight':'900px',"fontSize":"30px","display":this.state.detailLoadingShow}}/>
                                    <div id='canvasPrint'>
                                        {
                                            this.state.answerDetail.length>0 ? <Carousel  afterChange={this.answerDetailHandle.bind(this)} ref='slider'>
                                            {
                                                 this.state.answerDetail.map((ele,i)=>{

                                                    return <img src={'data:image/png;base64,'+ele} alt="" className="answer-detail" key={i}/>

                                                })
                                            }
                                            </Carousel> : <div style={{'fontSize':'18px',width:'100%','textAlign':'center','position':'absolute',top:'50%',marginTop:'-10px'}}><Icon type="exclamation-circle" style={{marginRight:'5px',color:'rgba(255, 159, 0, 1)'}}/>暂无作答~</div>
                                        }
                                        <div className="hw-yj-img-icon-box" style={{position:'absolute',top:0,left:0,width:'100%',height:'940px',zIndex: 901}}>
                                            <div className="hw-yj-img-icon" onMouseDown={this.iconDrag.bind(this)} style={{position:'absolute',top:0,left:0,width:'100%',height:'940px',zIndex: 901}}>
                                                <span></span>
                                            </div>
                                        </div>

                                    </div>
                                    <div className='correct-tag' style={{top:this.state.topDistance+'px'}}>
                                        <ul className="hw-yj-middle-btnmore-topul hw-yj-middle-icon">
                                            <li><span className="hw-yj-middle-btnmore-remark" data-iconType="remark" onClick={this.iconHandle.bind(this)}></span></li>
                                            <li><span className="hw-yj-middle-btnmore-rightico" data-iconType="right" onClick={this.iconHandle.bind(this)}></span></li>
                                            <li><span className="hw-yj-middle-btnmore-bcuoico" data-iconType="error" onClick={this.iconHandle.bind(this)}></span></li>
                                            <li><span className="hw-yj-middle-btnmore-bandico" data-iconType="half-right" onClick={this.iconHandle.bind(this)}></span></li>
                                            <li><span className="hw-yj-middle-btnmore-bfangico" data-iconType="rectangle" onClick={this.iconHandle.bind(this)}></span></li>
                                            <li><span className="hw-yj-middle-btnmore-byuanico" data-iconType="circle" onClick={this.iconHandle.bind(this)}></span></li>
                                            <li><span className="hw-yj-middle-btnmore-bjianico" data-iconType="arrow" onClick={this.iconHandle.bind(this)}></span></li>
                                            <li><span className="hw-yj-middle-btnmore-bdeleteico" data-iconType="delete" onClick={this.iconHandle.bind(this)}></span></li>
                                        </ul>
                                    </div>
                                </div>
                                <p className="switch-list">
                                    <a href="javascript:;" className={this.state.stuIndex==0 ? 'last allowClick' : 'last'} onClick={this.switchLast.bind(this)}><span >&lt;</span><span className="last-text">{parentType=='0' ? '上一位' : '上一题'}</span></a>
                                    <a href="javascript:;" className={this.state.stuIndex==answerList.length-1 ? 'last allowClick' : 'last'} onClick={this.switchNext.bind(this)}><span>{parentType=='0' ? '下一位' : '下一题'}</span><span  className="next-text">&gt;</span></a>
                                </p>
                            </div>
                            <div className="correct-handle">
                                <div className="correct-handle-logo">
                                    <Dropdown overlay={remarkmenu} placement="bottomRight">
                                        <div className="remark-btn" >
                                            评
                                        </div>
                                    </Dropdown>
                                </div>
                                <div className="correct-handle-logo">
                                    <Button  className="pic-btn" disabled={this.state.isAllowCorrect} data-tag="0" onClick={this.correctHandle.bind(this)}>
                                        <img src={this.state.correctFinish==0 ? rightLogoSel : rightLogo} alt="" className="pic"/>
                                    </Button>
                                    <span className="text">正确</span>
                                </div>
                                <div className="correct-handle-logo correct-handle-halfRight">
                                    <Button  className="pic-btn"  disabled={this.state.isAllowCorrect} data-tag="2" onClick={this.correctHandle.bind(this)}>
                                        <img src={this.state.correctFinish==2 ? halfRightLogoSel : halfRightLogo} alt="" className="pic"/>
                                    </Button>
                                    <span className="text">半对</span>
                                </div>
                                <div className="correct-handle-logo">
                                    <Button  className="pic-btn"  disabled={this.state.isAllowCorrect} data-tag="1" onClick={this.correctHandle.bind(this)}>
                                        <img src={this.state.correctFinish==1 ? wrongLogoSel : wrongLogo} alt="" className="pic"/>
                                    </Button>
                                    <span className="text">错</span>
                                </div>
                               {/* <div className='correct-again' onClick={this.correctAgain.bind(this)}>
                                    <span className="correct-again-txt-logo"></span>
                                    <span className="correct-again-txt">重批</span>
                                </div>*/}
                            </div>
                        </div>

                    </div>
                </div>
            )
    }

    enterHandle(value) {
        hashHistory.push('/search/all/' + encodeURIComponent(value))
    }
    //选中题目
    onChange(e){
        let isShow=e.target.checked,//是否选择当前题
            questionId=e.target.dataId,//当前题选择的id
            topicIndex=e.target.dataIndex,//当前题选择的索引
            viewSelNum=this.props.viewSelNum;//查看已选数目
            if(isShow==true){
                this.props.viewSel.bind(this,viewSelNum+1,isShow,questionId)();
                for (var i = 0; i < this.state.topicList.length; i++) {
                   if(i==topicIndex){
                        this.state.topicList[i].whetherSelected=true;
                        this.setState({
                            topicList:this.state.topicList
                        })
                   }
                }
            }else{
                this.props.viewSel.bind(this,viewSelNum-1,isShow,questionId)();
                for (var i = 0; i < this.state.topicList.length; i++) {
                   if(i==topicIndex){
                        this.state.topicList[i].whetherSelected=false;
                        this.setState({
                            topicList:this.state.topicList
                        })
                   }
                }
            }

    }
    //走马灯切换效果
    arrowLeft(){
        this.refs.slider.prev()
    }
    arrowRight(){
        this.refs.slider.next()
    }
    //查看解析
    showParse(e){
        let topicList=this.state.topicList,
            isShow=e.currentTarget.getAttribute('data-showType');
            if(topicList.childQuestionInfoList==null||topicList.childQuestionInfoList.length==0){
                if(isShow=='none'){
                    let topicLists=this.state.topicList,
                        questionList=this.state.questionList;
                        topicLists.isShow='block';
                        questionList.isShow='block';
                        if(this.state.parentType=='0'){
                            this.setState({topicList:topicLists,flag:!this.state.flag});
                        }else if(this.state.parentType=='1'){
                            this.setState({topicList:questionList,flag:!this.state.flag});
                        }
                }else{
                    let topicLists=this.state.topicList,
                        questionList=this.state.questionList;
                        questionList.isShow='none';
                        topicLists.isShow='none';
                        if(this.state.parentType=='0'){
                            this.setState({topicList:topicLists,flag:!this.state.flag});
                        }else if(this.state.parentType=='1'){
                            this.setState({topicList:questionList,flag:!this.state.flag});
                        }
                }
            }else{
                let datacheck=e.currentTarget.getAttribute('data-check');
                if(isShow=='none'){
                    let topicLists=this.state.topicList,
                        questionList=this.state.questionList;
                        topicLists.childQuestionInfoList[datacheck].isShow='block';
                        questionList.isShow='block';
                        if(this.state.parentType=='0'){
                            this.setState({topicList:topicLists,flag:!this.state.flag});
                        }else if(this.state.parentType=='1'){
                            this.setState({topicList:questionList,flag:!this.state.flag});
                        }
                }else{
                    let topicLists=this.state.topicList,
                        questionList=this.state.questionList;
                        topicLists.childQuestionInfoList[datacheck].isShow='none';
                        questionList.isShow='none';
                        if(this.state.parentType=='0'){
                            this.setState({topicList:topicLists,flag:!this.state.flag});
                        }else if(this.state.parentType=='1'){
                            this.setState({topicList:questionList,flag:!this.state.flag});
                        }
                }
            }

    }
    //指定题目-点击作业学生列表查看答案
    topicViewAnswer(e){
        let stuIndex=e.currentTarget.getAttribute("data-index"),
            stuList=this.state.studentList[stuIndex];
            this.setState({
                //answerDetail:!!this.state.studentList[stuIndex].studentHomeworkAnswerInfo&&this.state.studentList[stuIndex].studentHomeworkAnswerInfo.answer!='' ? this.state.studentList[stuIndex].studentHomeworkAnswerInfo.answer.split(',') : [],
                studentId:stuList.id,
                stuIndex:stuIndex,
                detailLoadingShow:'block',
                correctFinish:3//回复默认能批
            })
            //切换答题情况时也要检查一下当前作答状态
            this.dealAnswer.bind(this,stuList)()
            //删除标记
            $('.span_mark').remove();

    }
    //指定学生-点击作业题目列表查看答案
    questionSwich(e){
        let dataQuestion=e.target.getAttribute("data-question"),
            questionList=this.state.questionListData[dataQuestion];//对应下的题目数据
            this.setState({
                questionList:questionList,
                //answerDetail:!!questionList.studentHomeworkAnswerInfo&&questionList.studentHomeworkAnswerInfo.answer!='' ? questionList.studentHomeworkAnswerInfo.answer.split(',') : [],
                questionId:!!this.state.questionListData[dataQuestion].childId ? this.state.questionListData[dataQuestion].childId : this.state.questionListData[dataQuestion].id,
                stuIndex:dataQuestion,
                correctFinish:3,//回复默认能批
                detailLoadingShow:'block'
            })
            //切换答题情况时也要检查一下当前作答状态
            this.dealAnswer.bind(this,questionList)()
            //删除标记
            $('.span_mark').remove();
    }
    //学生答题图片切换事件
    answerDetailHandle(){

    }
    //标记评语
    iconRemark(e){
        let remarkValue=e.item.props.children,
            thisIconType='icon-remark',
            iconRemarkLen=$('.icon-remark').length;
            markNum += 1;
            iconRemark($('.answer-detail-area .hw-yj-img-icon'), thisIconType,markNum,iconRemarkLen,remarkValue);//创建标记

    }
    //批改作业
    correctHandle(e){
        let homeworkId=this.state.homeworkId,
            studentId=this.state.studentId,
            questionId=this.state.questionId,
            tag=e.currentTarget.getAttribute("data-tag"),//0 对 1半对 2错
            markNum=$('.hw-yj-img-icon .span_mark').length;
            // reviewFlag=typeof(window.canvasIMG)!='undefined' ? window.canvasIMG : '';//标记图片
            //标记批改之前判断一下当前该学生是否有作答
            if(this.state.answerDetail.length!==0){
                if(markNum==0){
                    this.setState({
                        correctFinish:tag
                    },()=>{
                        this.correctAnswer.bind(this,loginToken,homeworkId,studentId,questionId,tag,'')()
                    })
                }else{
                    //合成图片与标记
                    this.canvasPrint.bind(this)().then((reviewFlag)=>{
                        //批改成功之后给上相应的选中logo-辨别
                        this.setState({
                            correctFinish:tag
                        },()=>{
                            this.correctAnswer.bind(this,loginToken,homeworkId,studentId,questionId,tag,reviewFlag)()
                        })

                    }).catch((ex)=>{
                        console.log("暂无数据 "+ex.message)
                    })
                }
             }else{
                if(markNum==0){
                    this.setState({
                        correctFinish:tag
                    },()=>{
                        this.correctAnswer.bind(this,loginToken,homeworkId,studentId,questionId,tag,'')()
                    })
                }else{
                    message.warning('该学生未作答不能标记批改')
                }

            }
    }
    canvasPrint(){
     var cloneDom = $("#canvasPrint").clone();
            //设置克隆节点的css属性，因为之前的层级为0，我们只需要比被克隆的节点层级低即可。
            cloneDom.css({
                "background-color": "white",
                'opacity':0,
                "position": "fixed",
                'left':'0px',
                "top": "0px",
                'z-index':'-1'
            });
            //将克隆节点动态追加到body后面。
            $("body").append(cloneDom);
            message.warning('保存中')
        return new Promise((resolve,reject) =>{
            html2canvas(cloneDom,{
                useCORS:true,
                logging:true,
                onrendered: function(canvas){

                    let canvasIMG=canvas.toDataURL('png');
                    console.log('canvasIMG',canvasIMG)
                    //上传合成图片
                    const resultCanvasUpload = canvasUpload(loginToken,canvasIMG);
                        resultCanvasUpload.then(res => {
                            return res.json()
                        }).then(json => {
                            // 处理获取的数据
                            const data = json
                            if (data.result) {
                                resolve(data.data.url)
                                console.log('canvas',data.data.url)
                                //window.canvasIMG=data.data.url;
                            }
                        }).catch(ex => {
                            // 发生错误
                            if (__DEV__) {
                                console.error('暂无数据, ', ex.message)
                            }
                        })
                }
            });

        })

    }
    //重批
    correctAgain(){
        //重批-恢复
        this.setState({
            isAllowCorrect:false,
            correctFinish:3
        })
    }
    //上一位
    switchLast(){
        let parentType=this.state.parentType,//0 试题纬度过来的 1 学生纬度过来的
            stuIndexLast=parseInt(this.state.stuIndex)-1,
            questionList=this.state.questionListData[stuIndexLast];//对应下的题目数据
            if(parentType=='0'){//0 试题纬度过来的
                if(this.state.stuIndex>0){
                    this.setState({
                        //answerDetail:!!this.state.studentList[stuIndexLast].studentHomeworkAnswerInfo&&this.state.studentList[stuIndexLast].studentHomeworkAnswerInfo.answer!='' ? this.state.studentList[stuIndexLast].studentHomeworkAnswerInfo.answer.split(',') : [],
                        studentId:this.state.studentList[stuIndexLast].id,
                        detailLoadingShow:'block',
                        stuIndex:stuIndexLast
                    })
                    //点击上一位时-检查下一位作答状态
                    let lastStudentList=this.state.studentList[stuIndexLast];
                        this.dealAnswer.bind(this,lastStudentList)()
                }
            }else if(parentType=='1'){//1 学生纬度过来的
                if(this.state.stuIndex>0){
                    this.setState({
                        questionList:questionList,
                        questionId:!!this.state.questionListData[stuIndexLast].childId ? this.state.questionListData[stuIndexLast].childId : this.state.questionListData[stuIndexLast].id,
                        detailLoadingShow:'block',
                        stuIndex:stuIndexLast
                    })
                    //点击上一位时-检查下一位作答状态
                    let lastQuestionListData=this.state.questionListData[stuIndexLast];
                        this.dealAnswer.bind(this,lastQuestionListData)()
                }
            }

    }
    //下一位
    switchNext(){
        console.log('下一步道',this.state.parentType)
        let parentType=this.state.parentType,//0 试题纬度过来的 1 学生纬度过来的
            studentListLen=this.state.studentList.length,
            questionListLen=this.state.questionListData.length,
            stuIndexNext=parseInt(this.state.stuIndex)+1,
            questionList=this.state.questionListData[stuIndexNext];//对应下的题目数据;
            if(parentType=='0'){//0 试题纬度过来的
                if(this.state.stuIndex<studentListLen-1){
                    this.setState({
                        //answerDetail:!!this.state.studentList[stuIndexNext].studentHomeworkAnswerInfo&&this.state.studentList[stuIndexNext].studentHomeworkAnswerInfo.answer!='' ? this.state.studentList[stuIndexNext].studentHomeworkAnswerInfo.answer.split(',') : [],
                        studentId:this.state.studentList[stuIndexNext].id,
                        stuIndex:stuIndexNext,
                        detailLoadingShow:'block',
                        correctFinish:3//恢复默认不高亮状态
                    })

                    //点击下一位时-检查下一位作答状态
                    let nextStudentList=this.state.studentList[stuIndexNext];
                        this.dealAnswer.bind(this,nextStudentList)()

                }else{//最后一个学生
                    this.setState({
                        detailLoadingShow:'block',
                        correctFinish:3//恢复默认不高亮状态
                    })
                    //点击下一位时-检查下一位作答状态
                    let nowStudentList=this.state.studentList[this.state.stuIndex];
                        this.dealAnswer.bind(this,nowStudentList)()
                }
            }else if(parentType=='1'){//1 学生纬度过来的
                console.log('下一步333',this.state.stuIndex,questionListLen-1)
                if(this.state.stuIndex<questionListLen-1){
                    this.setState({
                        questionList:questionList,
                        questionId:!!this.state.questionListData[stuIndexNext].childId ? this.state.questionListData[stuIndexNext].childId : this.state.questionListData[stuIndexNext].id,
                        stuIndex:stuIndexNext,
                        detailLoadingShow:'block',
                        correctFinish:3//恢复默认不高亮状态
                    })
                    //点击下一位时-检查下一位作答状态
                    let nextQuestionListData=this.state.questionListData[stuIndexNext];
                        console.log('下一步',nextQuestionListData)
                        this.dealAnswer.bind(this,nextQuestionListData)()
                }else{//最后一道
                    this.setState({
                        detailLoadingShow:'block',
                        correctFinish:3//恢复默认不高亮状态
                    })
                    //点击下一位时-检查下一位作答状态
                    let nowQuestionListData=this.state.questionListData[this.state.stuIndex];
                    console.log('下一步333',nextQuestionListData)

                        this.dealAnswer.bind(this,nowQuestionListData)()
                }
            }


    }
    //初始化以及切换题目(多view和单view)的作答数据处理
    dealAnswer(currentData){
        if(!!currentData&&Object.keys(currentData).length!=0){
            //判断当前数据是不是多view数据
            if(currentData.hasOwnProperty("childQuestionInfoList")&&currentData.childQuestionInfoList!==null&&currentData.childQuestionInfoList.length!=0){
               /* if(currentData.childQuestionInfoList.find(ele=>ele.id==currentData.childId).studentHomeworkAnswerInfo.state===2){//0未作答、1已作答、2未批改、3新批改、4已批改
                    this.setState({
                        isAllowCorrect:false
                    })
                }else if(currentData.childQuestionInfoList.find(ele=>ele.id==currentData.childId).studentHomeworkAnswerInfo.state>2){
                    this.setState({
                        isAllowCorrect:true
                    })
                }*/
                //判断是否有批改状态-studentHomeworkAnswerInfo是否为null
                if(currentData.childQuestionInfoList.find(ele=>ele.id==currentData.childId).studentHomeworkAnswerInfo===null){
                    this.setState({
                        correctFinish:3
                    })
                }else{
                    //判断当前题时对，错，半对给右侧批改相应高亮状态
                    if(currentData.childQuestionInfoList.find(ele=>ele.id==currentData.childId).studentHomeworkAnswerInfo.reviewResult==0){
                        this.setState({
                            correctFinish:0
                        })
                    }else if(currentData.childQuestionInfoList.find(ele=>ele.id==currentData.childId).studentHomeworkAnswerInfo.reviewResult==1){
                        this.setState({
                            correctFinish:1
                        })
                    }else if(currentData.childQuestionInfoList.find(ele=>ele.id==currentData.childId).studentHomeworkAnswerInfo.reviewResult==2){
                        this.setState({
                            correctFinish:2
                        })
                    }
                }

                //url转成base64
                let doubleViewQuestion=currentData.childQuestionInfoList.find(ele=>ele.id==currentData.childId),
                    answerDetail=doubleViewQuestion.studentHomeworkAnswerInfo.reviewFlag!==null&&doubleViewQuestion.studentHomeworkAnswerInfo.reviewFlag!=='' ? doubleViewQuestion.studentHomeworkAnswerInfo.reviewFlag.split(',') : doubleViewQuestion.studentHomeworkAnswerInfo.answer.split(','),
                    newAnswerDetail=[];
                    if(!!doubleViewQuestion.studentHomeworkAnswerInfo&&doubleViewQuestion.studentHomeworkAnswerInfo.answer!==''){
                        for (var i = 0; i < answerDetail.length; i++) {
                             this.convertBase64Handle.bind(this,answerDetail[i])().then((data)=>{
                                newAnswerDetail.push(data);
                                this.setState({
                                    answerDetail:newAnswerDetail
                                })
                            }).catch((ex)=>{
                                console.log("暂无数据 "+ex.message)
                            })
                        }
                    }else{
                        this.setState({
                            answerDetail:[]
                        })
                    }
            }else{
                 console.log('下一步1',currentData)
              /*  if(!!currentData.studentHomeworkAnswerInfo&&currentData.studentHomeworkAnswerInfo.state===2){//0未作答、1已作答、2未批改、3新批改、4已批改
                    this.setState({
                        isAllowCorrect:false
                    })
                }else if(currentData.studentHomeworkAnswerInfo&&currentData.studentHomeworkAnswerInfo.state>2){
                    this.setState({
                        isAllowCorrect:true
                    })
                }*/
                //判断是否有批改状态-studentHomeworkAnswerInfo是否为null
                if(currentData.studentHomeworkAnswerInfo===null){
                    this.setState({
                        correctFinish:3
                    })
                }else{
                    //判断当前题时对，错，半对给右侧批改相应高亮状态
                    if(currentData.studentHomeworkAnswerInfo.reviewResult==0){
                        this.setState({
                            correctFinish:0
                        })
                    }else if(currentData.studentHomeworkAnswerInfo.reviewResult==1){
                        this.setState({
                            correctFinish:1
                        })
                    }else if(currentData.studentHomeworkAnswerInfo.reviewResult==2){
                        this.setState({
                            correctFinish:2
                        })
                    }
                }
                //url转成base64
                if(!!currentData.studentHomeworkAnswerInfo&&currentData.studentHomeworkAnswerInfo.answer!==''){
                    let answerDetail=currentData.studentHomeworkAnswerInfo.reviewFlag!==null&&currentData.studentHomeworkAnswerInfo.reviewFlag!=='' ? currentData.studentHomeworkAnswerInfo.reviewFlag.split(',') : currentData.studentHomeworkAnswerInfo.answer.split(','),
                        newAnswerDetail=[];
                    for (var i = 0; i < answerDetail.length; i++) {
                         this.convertBase64Handle.bind(this,answerDetail[i])().then((data)=>{
                            newAnswerDetail.push(data);
                            this.setState({
                                answerDetail:newAnswerDetail
                            })
                        }).catch((ex)=>{
                            console.log("暂无数据 "+ex.message)
                        })
                    }

                }else{
                    this.setState({
                        answerDetail:[]
                    })
                }
            }

        }/*else{
            this.setState({
                isAllowCorrect:true
            })
        }*/
    }
    //标记功能 点击标记添加选框
    iconHandle(e){
        let thisType = e.currentTarget.getAttribute('data-iconType');
            if(thisType == 'delete'){//删除
                var subtopicid = $('.hw-yj-mark-topicactive').attr('data-subtopicid'),
                    thisItemShow = $('.hw-yj-middle-main .span_mark');
                    //删除当前选中的标记
                    $('.span_mark.on').remove();
                    //保存标记接口
                    saveMark(subtopicid);
                    //$('#hwYjMiddleImageWrapper'+thisPage).find('.hw-yj-img-icon .span_mark').remove();
                    $('.hw-yj-middle-btnmore').hide();//更多标记框隐藏
                    $('#hw-yj-model-mask').hide();//蒙版隐藏
            }else{//六个标记
                let current='';
                    if(thisType == 'right'){
                        current=$('.hw-yj-middle-btnmore-rightico');
                    }else if(thisType == 'error'){
                        current=$('.hw-yj-middle-btnmore-bcuoico');
                    }else if(thisType == 'half-right'){
                        current=$('.hw-yj-middle-btnmore-bandico');
                    }else if(thisType == 'rectangle'){
                        current=$('.hw-yj-middle-btnmore-bfangico');
                    }else if(thisType == 'circle'){
                        current=$('.hw-yj-middle-btnmore-byuanico');
                    }else if(thisType == 'arrow'){
                        current=$('.hw-yj-middle-btnmore-bjianico');
                    }else if(thisType == 'remark'){
                         current=$('.hw-yj-middle-btnmore-remark');
                    }
                    current.addClass('active').parent().siblings().find('span').removeClass('active');
                    $('#hw-yj-model-mask').hide();//蒙版隐藏
                    $('.hw-yj-middle-btnmore').hide();//标记按钮框隐藏
                    thisIconType = thisType;//当前标记类型
            }
            //十字画图光标
            $('.hw-yj-img-icon').css('cursor','Crosshair')
    }
    //标记功能 拖拽
    iconDrag(ev){
        ev.nativeEvent.stopPropagation();
        ev.nativeEvent.preventDefault();
        ev.nativeEvent.stopImmediatePropagation();
        var targett = ev.target || ev.srcElement,
            subtopicid = $('.hw-yj-mark-topicactive').attr('data-subtopicid');
            markNum = $('.hw-yj-img-icon').find('.span_mark').length;
            if(targett.className.indexOf('span_mark') > 0){
                var thisMarkNum = targett.getAttribute('markNum');
                dragBind($('.hw-yj-img-icon').find('.span_mark[marknum='+thisMarkNum+']'), $('.hw-yj-img-icon'), ev,subtopicid);//标记拖拽
                return false;
            }
            if(thisIconType != null){
                markNum += 1;
                if(thisIconType=='remark'){
                    remarkFun($('.answer-detail-area .hw-yj-img-icon'), thisIconType, ev, subtopicid,markNum);//创建标记
                    thisIconType=null;
                }else{
                    markFun($('.answer-detail-area .hw-yj-img-icon'), thisIconType, ev, subtopicid,markNum);//创建标记
                }
            }
    }
    //url转换成base64
    convertBase64Handle(imgUrl){
        return new Promise((resolve,reject) =>{
                const resultConvertBase64 = convertBase64(imgUrl);
                resultConvertBase64.then(res => {
                    return res.json()
                }).then(json => {
                    // 处理获取的数据
                    const data = json
                    if (data.result) {
                        // aaa=data.data;
                        resolve(data.data)
                    }
                }).catch(ex => {
                    // 发生错误
                    if (__DEV__) {
                        reject("暂无数据 "+ex.message)
                    }
                })

        })

    }
    //获取滚动条居上高度
    handleScroll(event) {
       let scrollTop =document.documentElement.scrollTop+200,
            maxTop=$('.answer-detail-area').offset().top;
       if(document.documentElement.scrollTop==0){
            this.setState({
                topDistance:0
            })
       }else if(document.documentElement.scrollTop>maxTop){
            this.setState({
                topDistance:900
            })
       }

    }

}

export default CorrectHomework
