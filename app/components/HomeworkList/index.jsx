import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import { Link, hashHistory } from 'react-router'
import { getTopicListData } from '../../fetch/decorate-homework/decorate-homework'
import Pagination from '../../Components/Pagination'
import DelModal from '../DelModal'
import { Button , Progress, Select , DatePicker , Icon,Spin} from 'antd';
import { getHomeworkListData } from '../../fetch/index-homework/index-homework'


import './style.less'

const Option = Select.Option;
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;
const loginToken=localStorage.getItem("loginToken");
class HomeworkList extends React.Component {
    constructor(props, context) {
        super(props, context);
         this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
        this.state={
            homeworkListData:[],//作业列表数据
            homeworkListLen:'',//作业数据个数
            isShowModal:false,//显示删除提示弹窗框
            homeworkId:'',//作业id
            loadingShow:'block',
            parentType:0,
            currentPage:1
        }
    }
    
    componentWillReceiveProps(nextProps){
        let pageNumber=0,
            pageSize=5,
            classId='',
            state=nextProps.screening.homeworkstate,
            publishAtStart=nextProps.screening.publishAtStart,
            publishAtEnd=nextProps.screening.publishAtEnd;
            if(this.props.flag!=nextProps.flag){
                this.getHomeworkListData.bind(this,loginToken,pageNumber,pageSize,classId,state,publishAtStart,publishAtEnd)();
            }
    }
    componentWillMount(){
        let pageNumber=0,
            pageSize=5,
            classId='',
            state='',
            publishAtStart='',
            publishAtEnd='';
            this.getHomeworkListData.bind(this,loginToken,pageNumber,pageSize,classId,state,publishAtStart,publishAtEnd)();
        
    }
    //获取作业首页列表数据
    getHomeworkListData(loginToken,pageNumber,pageSize,classId,state,publishAtStart,publishAtEnd){
        this.setState({
            loadingShow:'block'
        })
        const resultHomeworkList=getHomeworkListData(loginToken,pageNumber,pageSize,classId,state,publishAtStart,publishAtEnd);
                resultHomeworkList.then(res => {
                    return res.json()
                }).then(json => {
                    // 处理获取的数据
                    const data = json
                    if (data.result) {
                        let content=data.data.content;
                            for (var i = 0; i < content.length; i++) {
                                let inputTime=new Date(content[i].abortAt),//截止时间
                                    publishTime=new Date(content[i].publishAt),//发布时间
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
                                    content[i].newAbortAt=' '+M+D+' '+Hours+':'+Minute;
                                    content[i].newPublishAt='创建时间:'+' '+PublishY+PublishM+PublishD+' '+PublishHours+':'+PublishMinute;
                                    //如果当前时间大于截止时间，就标红，提示已截止
                                    if(newDateParse>content[i].abortAt){
                                        content[i].isAsShow='inline-block';
                                        content[i].isNotAsShow='none';
                                    }else{
                                        content[i].isAsShow='none';
                                        content[i].isNotAsShow='inline-block';
                                    }
                                    //如果状态为2，那么就是有需要批改的
                                    if(content[i].state==2){
                                        content[i].isNeedCorrect='inline-block';
                                        content[i].isDetail='none';
                                    }else{
                                        content[i].isNeedCorrect='none';
                                        content[i].isDetail='inline-block';
                                    }
                            }                      
                           this.setState({
                            homeworkListData:content,
                            homeworkListLen:data.data.pageable.totalSize/5,
                            currentPage:pageNumber+1,
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
    render() {
        return (
            <div className="homeworkList">
                <div style={{"display":this.state.loadingShow}}> 
                    <Spin size="large" style={{"fontSize":"30px","display":'block','margin':'300px auto'}}/>
                </div>
                {
                    this.state.homeworkListData.length>0&&this.state.loadingShow=='none' ? this.state.homeworkListData.map((item,index)=>{
                            return <div className={item.state==2 ? 'list-sec corrections' : 'list-sec no-corrections'} key={index}>
                                    <p className="date"><span>{item.newPublishAt}</span></p>
                                    <div className="mark-box homeworinfo-mark">
                                        <span className="class-mark" title={item.className}>{item.className}</span>
                                        <div className='homework-name-time'>
                                            <h1 className="homework-mark">
                                                <span style={{marginLeft:'-8px',float:'left','display':item.isNeedCorrect,color: 'rgba(255, 133, 72, 1)'}}>【待批改】</span>
                                                <span className="homework-name" title={item.name}>{item.name}</span>
                                            </h1>
                                            <p>
                                                <span className="homeworknum-mark">共{item.questionCount}题</span>
                                                <span className={item.isAsShow=='inline-block' ? 'alreadyAstime-tag' : 'astime-tag'}><span className="as-mark" style={{'display':item.isAsShow}}>已截止:</span><span className="as-mark" style={{'display':item.isNotAsShow}}>截止时间</span><span className="astimemonth-mark">{item.newAbortAt}</span></span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mark-box progress-mark-box">
                                        <div className="progress-bar">
                                            <Progress strokeColor='rgba(45, 187, 85, 1)' strokeWidth={6} percent={(item.committedCount/item.allCount)*100} showInfo={false} status="active"/>
                                        </div>
                                        <div className="progress-bar-txt">
                                            <span>已提交</span><span><span className="submitted">{item.committedCount}</span>/<span>{item.allCount}</span></span>
                                        </div>
                                    </div>
                                    <div className="mark-box progress-circle-mark-box">
                                        <div className="progress-circle-bar">
                                            <Progress strokeColor='rgba(45, 187, 85, 1)' strokeWidth={6} type="circle" percent={item.accuracy} width={48} status="active"/>
                                        </div>
                                        <p className="progress-circle-text">正确率</p>
                                    </div>
                                    <div className="mark-box correcting-mark-box">
                                        
                                        {
                                            item.state==2 ? <p>
                                                <a href="javascript:;" className="detail-btn" data-id={item.id} onClick={this.jumpHomeworkStatis.bind(this)}>作业报告</a>
                                                <Button type="primary" className="correcting-btn" data-id={item.id} onClick={this.jumpHomeworkDetail.bind(this)}>批改</Button>
                                            </p> : <p>
                                                <a href="javascript:;" className="detail-btn" data-id={item.id} onClick={this.jumpHomeworkStatis.bind(this)}>作业报告</a>
                                                <a href="javascript:;" className="del-btn" data-id={item.id} onClick={this.homeworkDel.bind(this)}>删除</a>
                                            </p>
                                        }
                                        
                                    </div>
                            </div>  
                            
                    }) : this.state.loadingShow=='none'&&<div style={{'fontSize':'16px','textAlign':'center','margin':'300px',"display":this.state.loadingShow=='block' ? 'none' : 'block'}}><Icon type="exclamation-circle" style={{marginRight:'5px',color:'rgba(255, 159, 0, 1)'}}/>暂无数据~</div>
                }
                <DelModal isShowModal={this.state.isShowModal} parentType={this.state.parentType} homeworkId={this.state.homeworkId} noticeHomework={this.noticeHomework.bind(this)}/>
                {
                    this.state.loadingShow=='none'&&<Pagination currentPage={this.state.currentPage} topicListLen={this.state.homeworkListLen} paginationSel={this.paginationSel.bind(this)}/>
                }
            </div>
        )
        
    }
/*    enterHandle(value) {
        hashHistory.push('/search/all/' + encodeURIComponent(value))
    }*/
    //跳转报告
    jumpHomeworkStatis(e){
        let id=e.currentTarget.getAttribute('data-id');
            hashHistory.push('/homework-statistical/' + encodeURIComponent(id)+'/0/0');
    }
    //跳转详情
    jumpHomeworkDetail(e){
        let id=e.currentTarget.getAttribute('data-id');
            hashHistory.push('/homework-detail/' + encodeURIComponent(id)+'/0/0');
    }
    //分页
    paginationSel(page){
        this.setState({
            currentPage:page
        })
        let pageNumber=page-1,
            pageSize=5,
            classId='',
            state=this.props.screening.homeworkstate,
            publishAtStart=this.props.screening.publishAtStart,
            publishAtEnd=this.props.screening.publishAtEnd;
            this.getHomeworkListData.bind(this,loginToken,pageNumber,pageSize,classId,state,publishAtStart,publishAtEnd)();
    }
    //删除指定作业
    homeworkDel(e){
        //this.state.isShowModal=true;
        let id=e.target.getAttribute('data-id');
        this.setState({
            isShowModal:true,
            homeworkId:id
        })

    }
    //子组件通知父组件改变isShowModal值
    noticeHomework(data,id){
        this.setState({
            isShowModal:data,
        })
        if(id===''){
            return;
        }
        let pageNumber=this.state.homeworkListData.length==1 ? this.state.currentPage-2 : this.state.currentPage-1,//如果当前数据为1条的时候删除了之后就就跳回上一页
            pageSize=5,
            classId='',
            state='',
            publishAtStart='',
            publishAtEnd='';
            this.getHomeworkListData.bind(this,loginToken,pageNumber,pageSize,classId,state,publishAtStart,publishAtEnd)();
    }
}

export default HomeworkList