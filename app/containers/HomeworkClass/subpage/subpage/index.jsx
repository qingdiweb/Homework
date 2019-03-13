/**
 * 班级详情-学生历史记录
 */
import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import { Link, hashHistory } from 'react-router'
import { Menu, Icon , Button , Select , Progress , DatePicker , Breadcrumb} from 'antd';
import { classStuHomework} from '../../../../fetch/homework-class/homework-class'
import Pagination from '../../../../Components/Pagination'

import './style.less'

const loginToken=localStorage.getItem("loginToken");
class HistoryHomework extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
        this.state={
            historyHomeworkList:[],
            homeworkListLen:'',
            currentPage:1
        }
    }
    componentWillMount(){
        let classId=this.props.params.classId,
            studentId=this.props.params.studentId,
            pageNumber=0,
            pageSize=5;
            this.getHistoryHomework.bind(this,loginToken,classId,studentId,pageNumber,pageSize)();
            //通知左侧menu导航-当前在那个menu下
            localStorage.setItem('positionMenu',JSON.stringify(['5']));
    }
    //获取历史作业
    getHistoryHomework(loginToken,classId,studentId,pageNumber,pageSize){
         const resultStuHomework=classStuHomework(loginToken,classId,studentId,pageNumber,pageSize);
                    resultStuHomework.then(res => {
                        return res.json()
                    }).then(json => {
                        // 处理获取的数据
                        const data = json
                        if (data.result) {
                            let content=data.data.content;
                                for (var i = 0; i < content.length; i++) {
                                    let publishTime=new Date(content[i].publishAt),//发布时间
                                        newDateParse=Date.parse(new Date()),//当前时间戳
                                        PublishM=publishTime.getMonth()+1<10 ? '0'+(publishTime.getMonth()+1)+'月' : (publishTime.getMonth()+1)+'月',
                                        PublishD=publishTime.getDate()<10 ? '0'+publishTime.getDate()+'日' : publishTime.getDate()+'日',
                                        PublishHours=publishTime.getHours() < 10 ? "0" + publishTime.getHours() : publishTime.getHours(),
                                        PublishMinute=publishTime.getMinutes() < 10 ? "0" + publishTime.getMinutes() : publishTime.getMinutes();
                                        content[i].newPublishAt=PublishM+PublishD+' '+PublishHours+':'+PublishMinute;
                                        content[i].whenMinute=parseInt(content[i].answerSecond/60);
                                        content[i].whenSecond=content[i].answerSecond%60;
                                }
                                this.setState({
                                    historyHomeworkList:content,
                                    homeworkListLen:data.data.pageable.totalSize/5
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
        let historyHomeworkList=this.state.historyHomeworkList;
        console.log("历史作业",historyHomeworkList)
        return (
            <div className="history-homework-list">
              <h1 className='header-nav'><Breadcrumb separator=">"><Breadcrumb.Item><Link to="/homework-class">我的班级</Link></Breadcrumb.Item><Breadcrumb.Item><Link to={'/homework-class-detail/'+this.props.params.classId}>班级详情</Link></Breadcrumb.Item><Breadcrumb.Item>学生详情</Breadcrumb.Item></Breadcrumb></h1>
               <p className="title">历史作业</p>
               {
                    historyHomeworkList.length>0 ? historyHomeworkList.map((item,index)=>{
                        let processTemplate=''
                        if(!!item.studentHomeworkReviewState&&item.studentHomeworkReviewState==1){//提交全部批改完
                            processTemplate=<p className="progress-circle-bar">
                                <Progress strokeColor='rgba(45, 187, 85, 1)' strokeWidth={6} type="circle" percent={item.reviewAccuracy==null ? 0 : item.reviewAccuracy} width={52} status="active"/>
                            </p>
                        }else if(!!item.studentHomeworkReviewState&&item.studentHomeworkReviewState==0){//提交未全部批改完
                            if(item.studentHomeworkState<2){//未提交
                                    processTemplate=<p className="progress-circle-bar">
                                                        <Progress strokeColor='rgba(240, 239, 244, 1)' strokeWidth={6} className='nosubmit-process-circle' type="circle" percent={100} width={52} format={() => '未提交'}/>
                                                    </p>
                            }else if(item.studentHomeworkState>=2&&item.studentHomeworkState<=5){//提交但未都批改完
                                    processTemplate=<p className="progress-circle-bar">
                                                        <Progress strokeColor='rgba(39, 188, 83, 1)' strokeWidth={6} className='correct-process-circle' type="circle" percent={100} width={52} format={() => '待批改'}/>
                                                    </p>
                            }
                        }else{//未提交
                            processTemplate=<p className="progress-circle-bar"  style={{cursor:'auto'}}>
                                                        <Progress strokeColor='rgba(240, 239, 244, 1)' strokeWidth={6} className='nosubmit-process-circle' type="circle" percent={100} width={52} format={() => '未提交'}/>
                                                    </p>
                        }
                        return <div className="history-homework-sec" key={index}>
                                    <div className="mark-box homeworinfo-mark">
                                        <p className="date"><span>{item.newPublishAt}</span></p>
                                        <h1 className="homework-mark">{item.name}</h1>
                                        <p><span className="homeworknum-mark">共{item.questionCount==null&&'' ? 0 : item.questionCount}题</span><span className="clock-logo"></span><span className="homework-time">{item.whenMinute}'{item.whenSecond}</span></p>
                                    </div>
                                    {
                                        !!item.studentHomeworkReviewState&&(item.studentHomeworkReviewState==1||item.studentHomeworkReviewState==0) ? <div className="mark-box progress-circle-mark-box" data-id={item.id} onClick={this.jumpHomeworkDetail.bind(this)}>
                                                {
                                                    processTemplate
                                                }
                                                {
                                                    !!item.studentHomeworkReviewState&&item.studentHomeworkReviewState==1 ? <p className="progress-circle-text">正确率</p> : ''
                                                }
                                        </div> : <div className="mark-box progress-circle-mark-box" data-id={item.id} >
                                                {
                                                    processTemplate
                                                }
                                                {
                                                    !!item.studentHomeworkReviewState&&item.studentHomeworkReviewState==1 ? <p className="progress-circle-text">正确率</p> : ''
                                                }
                                        </div>
                                    }

                                </div>
                    }) : <div style={{'font-size':'16px','text-align':'center','margin':'300px auto',"display":this.state.loadingShow=='block' ? 'none' : 'block'}}><Icon type="exclamation-circle" style={{marginRight:'5px',color:'rgba(255, 159, 0, 1)'}}/>暂无数据~</div>
               }
                <Pagination currentPage={this.state.currentPage} topicListLen={this.state.homeworkListLen} paginationSel={this.paginationSel.bind(this)}/>
            </div>
        )
    }
     //跳转详情
    jumpHomeworkDetail(e){
        localStorage.setItem('classJumpType',1);//为了区分班级作业和班级学生作业列表到批改页面-面包屑的区分
        let id=e.currentTarget.getAttribute('data-id');
            hashHistory.push("/homework-student-detail/" + encodeURIComponent(id)+'/'+encodeURIComponent(this.props.params.studentId)+'/3'+'/'+this.props.params.classId);

    }
    //分页
    paginationSel(page){
        console.log(page)
        this.setState({
            loadingShow:'block',
            currentPage:page
        })
        let classId=this.props.params.classId,
            studentId=this.props.params.studentId,
            pageNumber=page-1,
            pageSize=5;
            this.getHistoryHomework.bind(this,loginToken,classId,studentId,pageNumber,pageSize)();
    }


}
export default HistoryHomework
