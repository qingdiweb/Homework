import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import { Link, hashHistory } from 'react-router'
import { getExerciseListData } from '../../fetch/classroom-exercise/classroom-exercise'
import * as Constants from '../../constants/store'
import Pagination from '../../Components/Pagination'
import DelModal from '../DelModal'
import { Button , Progress, Select , DatePicker , Icon,Spin} from 'antd';

import './style.less'

const Option = Select.Option;
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;
const loginToken=localStorage.getItem("loginToken");
class ExerciseList extends React.Component {
    constructor(props, context) {
        super(props, context);
         this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
        this.state={
            exerciseListData:[],//练习列表数据
            exerciseListLen:'',//练习数据个数
            isShowModal:false,//显示删除提示弹窗框
            exerciseId:'',//作业id
            loadingShow:'block',
            parentType:3,
            currentPage:1
        }
    }
    
    componentWillReceiveProps(nextProps){
        let classId='',
            catalogId=nextProps.screening.catalogId,
            state=this.props.referenceType==0 ? '0,1' : '2',
            createdAtStart=nextProps.screening.createdAtStart,
            createdAtEnd=nextProps.screening.createdAtEnd,
            pageNumber=0,
            pageSize=5;
            if(this.props.flag!=nextProps.flag){
                this.getExerciseListData.bind(this,loginToken,classId,catalogId,state,createdAtStart,createdAtEnd,pageNumber,pageSize)();
            }
    }
    //获取随堂练习列表数据
    getExerciseListData(loginToken,classId,catalogId,state,createdAtStart,createdAtEnd,pageNumber,pageSize){
        this.setState({
            loadingShow:'block'
        })
        const resultHomeworkList=getExerciseListData(loginToken,classId,catalogId,state,createdAtStart,createdAtEnd,pageNumber,pageSize);
                resultHomeworkList.then(res => {
                    return res.json()
                }).then(json => {
                    // 处理获取的数据
                    const data = json
                    if (data.result) {
                        let content=data.data.content;
                            for (var i = 0; i < content.length; i++) {
                                let newDateParse=Date.parse(new Date());//当前时间戳
                                    content[i].newCreatedAt='创建时间:'+' '+Constants.dealTimestamp(content[i].createdAt);//创建时间
                            }                      
                           this.setState({
                            exerciseListData:content,
                            exerciseListLen:data.data.pageable.totalSize/5,
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
        console.log('laoding',this.props.referenceType)
        return (
            <div className="exercise-list">
                <div style={{"display":this.state.loadingShow}}> 
                    <Spin size="large" style={{"fontSize":"30px","display":'block','margin':'300px auto'}}/>
                </div>
                {
                    this.state.exerciseListData.length>0&&this.state.loadingShow=='none' ? this.state.exerciseListData.map((item,index)=>{
                            return <div className={item.state==0 ? 'list-sec corrections' : 'list-sec no-corrections'} key={index}>
                                    <p className="date"><span>{item.newCreatedAt}</span></p>
                                    <div className="mark-box homeworinfo-mark">
                                        <span className="class-mark" title={item.className}>{item.className}</span>
                                        <div className='homework-name-time'>
                                            <h1 className="homework-mark">
                                                <span className="homework-name" title={item.name}>{item.name}</span>
                                            </h1>
                                            <p>
                                                <span className="homeworknum-mark">共{item.questionCount}题</span>
                                                <span className={item.state==0 ? 'nopublish-state' : item.state==1 ? 'answer-state' : item.state==2&&'finish-state'}>{item.state==0 ? '未发布' : item.state==1?'作答中':'已完成'}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mark-box correcting-mark-box">
                                    {
                                        this.props.referenceType==0 ? <p>
                                            <Button type='primary' className="detail-btn" data-id={item.id} onClick={this.jumpExerciseDetail.bind(this)}>详情</Button>
                                            {item.state==0&&<a href="javascript:;" className="del-btn" data-id={item.id} onClick={this.exerciseDel.bind(this)}>删除</a>}
                                        </p> : <p>
                                            <Button type='primary' className="detail-btn" data-id={item.id} onClick={this.jumpExerciseDetail.bind(this)}>查看记录</Button>
                                            <a href="javascript:;" className="del-btn" data-id={item.id} onClick={this.exerciseDel.bind(this)}>删除</a>
                                        </p>
                                    }
                                    </div>
                            </div>  
                            
                    }) : this.state.loadingShow=='none'&&<div style={{'fontSize':'16px','textAlign':'center','margin':'300px',"display":this.state.loadingShow=='block' ? 'none' : 'block'}}><Icon type="exclamation-circle" style={{marginRight:'5px',color:'rgba(255, 159, 0, 1)'}}/>暂无数据~</div>
                }
                <DelModal isShowModal={this.state.isShowModal} parentType={this.state.parentType} exerciseId={this.state.exerciseId} noticeHomework={this.noticeHomework.bind(this)}/>
                {
                    this.state.loadingShow=='none'&&<Pagination currentPage={this.state.currentPage} topicListLen={this.state.exerciseListLen} paginationSel={this.paginationSel.bind(this)}/>
                }
                
            </div>
        )
        
    }
 
    //跳转详情
    jumpExerciseDetail(e){
        let id=e.currentTarget.getAttribute('data-id');
        if(this.props.referenceType==0){//随堂练习-去练习详情
            hashHistory.push('/exercise-detail/' + encodeURIComponent(id));
        }else{//课堂记录-去查看记录
            hashHistory.push('/classroom-record-detail/' + encodeURIComponent(id));
        }
    }
    //分页
    paginationSel(page){
        this.setState({
            currentPage:page
        },()=>{
            let classId='',
                catalogId=this.props.screening.catalogId,
                state=this.props.referenceType==0 ? '0,1' : '2',
                createdAtStart=this.props.screening.createdAtStart,
                createdAtEnd=this.props.screening.createdAtEnd,
                pageNumber=page-1,
                pageSize=5;
                this.getExerciseListData.bind(this,loginToken,classId,catalogId,state,createdAtStart,createdAtEnd,pageNumber,pageSize)();
        })
    }
    //删除指定作业
    exerciseDel(e){
        //this.state.isShowModal=true;
        let id=e.target.getAttribute('data-id');
        this.setState({
            isShowModal:true,
            exerciseId:id
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
        let classId='',
            catalogId=this.props.screening.catalogId,
            state=this.props.referenceType==0 ? '0,1' : '2',
            createdAtStart='',
            createdAtEnd='',
            pageNumber=this.state.exerciseListData.length==1 ? this.state.currentPage-2 : this.state.currentPage-1,//如果当前数据为1条的时候删除了之后就就跳回上一页
            pageSize=5;
            this.getExerciseListData.bind(this,loginToken,classId,catalogId,state,createdAtStart,createdAtEnd,pageNumber,pageSize)();
    }
}

export default ExerciseList