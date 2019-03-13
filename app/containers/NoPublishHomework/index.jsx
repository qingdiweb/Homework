/**
 * 作业草稿
 */
import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import { Link, hashHistory } from 'react-router'
import { Button , Progress, Select , DatePicker , Icon , Breadcrumb,Spin,Menu, Dropdown} from 'antd';
import Pagination from '../../components/Pagination'
import DelModal from '../../components/DelModal'
import PublishModal from '../../components/PublishModal'
import { getTopicListData } from '../../fetch/decorate-homework/decorate-homework'
import { getDraftListData,delDraftListData } from '../../fetch/no-publish-homework/no-publish-homework'
import { getHomeworkListData } from '../../fetch/index-homework/index-homework'
import moment from 'moment';
import datalocale from 'antd/lib/date-picker/locale/zh_CN';

import './style.less'

const Option = Select.Option;
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;
const loginToken=localStorage.getItem("loginToken");
class HomeworkList extends React.Component {
    constructor(props, context) {
        super(props, context);
         //this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
        this.state={
            homeworkListData:[],//作业列表数据
            homeworkListLen:'',//作业数据个数
            isShowModal:false,//显示删除提示弹窗框
            pusblishVisible:false,//发布显示
            loadingShow:'block',//加载图标
            createdAtStart:'',//作业创建草稿日期0点
            createdAtEnd:'',//作业创建草稿日期24点
            homeworkId:'',//作业id
            parentType:2,
            dateValue:undefined,//修改日期
            currentPage:1,
            currentQuestionIds:'',//当前草稿的题目
            currentCatalogIds:'',//当前草稿的章节
            publishType:'',//发布类型 0 是随堂练习发布 1 课后作业发布
            flag:true//刷新
        }
    }

    componentWillReceiveProps(nextProps){

    }
    componentWillMount(){
        let pageNumber=0,
            pageSize=5,
            createdAtStart='',
            createdAtEnd='';
            this.getDraftListData.bind(this,loginToken,pageNumber,pageSize,createdAtStart,createdAtEnd)();
            //通知左侧menu导航-当前在那个menu下
            localStorage.setItem('positionMenu',JSON.stringify(['2']));

    }
    componentDidMount(){
        window.catalogIds='';//全局章节
    }
    //获取草稿列表数据
    getDraftListData(loginToken,pageNumber,pageSize,createdAtStart,createdAtEnd){
        const resultHomeworkList=getDraftListData(loginToken,pageNumber,pageSize,createdAtStart,createdAtEnd);
                resultHomeworkList.then(res => {
                    return res.json()
                }).then(json => {
                    // 处理获取的数据
                    const data = json
                    if (data.result) {
                       console.log(data)
                        let content=data.data.content;
                            for (var i = 0; i < content.length; i++) {
                                let createdTime=new Date(content[i].createdAt),//发布时间
                                    CreatedM=createdTime.getMonth()+1<10 ? '0'+(createdTime.getMonth()+1)+'月' : (createdTime.getMonth()+1)+'月',
                                    CreatedD=createdTime.getDate()<10 ? '0'+createdTime.getDate()+'日' : createdTime.getDate()+'日',
                                    CreatedHours=createdTime.getHours() < 10 ? "0" + createdTime.getHours() : createdTime.getHours(),
                                    CreatedMinute=createdTime.getMinutes() < 10 ? "0" + createdTime.getMinutes() : createdTime.getMinutes();
                                    content[i].newCreateAt=CreatedM+CreatedD+' '+CreatedHours+':'+CreatedMinute;
                                    //给草稿列表作业默认名字
                                    content[i].name='作业草稿'+(pageNumber*5+i+1)
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
        console.log('render触发'+this.state.isShowModal)
        return (
            <div className="no-publish-list">
                <h1 className='header-nav'><Breadcrumb separator=">"><Breadcrumb.Item >作业草稿</Breadcrumb.Item></Breadcrumb></h1>
                <div className='indexHeadSearch'>
                        <Button className="resetBtn" type="" onClick={this.resetSearch.bind(this)}>重置</Button>
                        <Button className="searchBtn" type="primary" onClick={this.searchHomeworkList.bind(this)}>查找</Button>
                        <DatePicker className="datepickSel" locale={datalocale} allowClear={false} placeholder="日期筛选"  value={this.state.dateValue} onChange={this.datePickHandle.bind(this)} />
                </div>
                <div className="homeworkList">
                    <Spin size="large" style={{"fontSize":"30px","display":this.state.loadingShow,'margin':'250px auto'}}/>
                    {
                        this.state.homeworkListData.length>0 ? this.state.homeworkListData.map((item,index)=>{
                                const menu = (id,catalogIds,questionIds) => (
                                  <Menu onClick={this.publishHomework.bind(this,id,catalogIds,questionIds)}>
                                    <Menu.Item key="0">课堂作业</Menu.Item>
                                    <Menu.Item key="1">课后作业</Menu.Item>
                                  </Menu>
                                );
                                if(item.questionCount!==0){
                                    return <div className="list-sec no-corrections" key={index}>
                                                <div className="mark-box homeworinfo-mark">
                                                    <h1 className="homework-name">{item.name}</h1>
                                                    <p><span className="homeworknum-mark">共{item.questionCount}题</span></p>
                                                </div>
                                                <div className="mark-box pulishing-mark-box">
                                                    <p className="pulishDate"><span>{item.newCreateAt}</span></p>
                                                    <Dropdown overlay={menu(item.id,item.currentCatalogIds,item.currentQuestionIds)}>
                                                      <Button className="correcting-btn" type="primary" style={{'display':item.isNeedCorrect}}>发布</Button>
                                                    </Dropdown>
                                                </div>
                                                <div className="mark-box detail-del">
                                                    <a href="javascript:;" className="detail-btn" id={item.id} data-currentid={item.currentQuestionIds} data-currentcatalogIds={item.currentCatalogIds} onClick={this.draftEdit.bind(this)}>编辑</a>
                                                    <a href="javascript:;" className="del-btn" data-id={item.id} onClick={this.homeworkDel.bind(this)}>删除</a>
                                                </div>
                                            </div>
                                }
                        }) : <div style={{'font-size':'16px','text-align':'center','margin':'300px',"display":this.state.loadingShow=='block' ? 'none' : 'block'}}><Icon type="exclamation-circle" style={{marginRight:'5px',color:'rgba(255, 159, 0, 1)'}}/>暂无草稿~</div>
                    }
                    <DelModal isShowModal={this.state.isShowModal} parentType={this.state.parentType} homeworkId={this.state.homeworkId} draftId={this.state.homeworkId} noticeHomework={this.noticeHomework.bind(this)}/>
                    <PublishModal flag={this.state.flag} pusblishVisible={this.state.pusblishVisible} publishType={this.state.publishType} draftId={this.state.homeworkId} currentCatalogIds={this.state.currentCatalogIds} currentQuestionIds={this.state.currentQuestionIds} noticeHomework={this.noticePublish.bind(this)}/>
                    <Pagination currentPage={this.state.currentPage} topicListLen={this.state.homeworkListLen} paginationSel={this.paginationSel.bind(this)}/>
                </div>
            </div>
        )

    }
    //草稿编辑
    draftEdit(e){
        let draftId=e.currentTarget.getAttribute('id'),
            currentQuestionIds=e.currentTarget.getAttribute('data-currentid'),
            currentCatalogIds=e.currentTarget.getAttribute('data-currentcatalogIds');
            //储存在全局用于查题find
            window.noticeDecorateQuestionIds=currentQuestionIds;
            window.catalogIds=currentCatalogIds;
            hashHistory.push('/decorate-selected/'+draftId+'/0/0/2');


    }
    //日期选择
    datePickHandle(date, dateString){
        let stateTime=dateString+' '+'00:00',
            endTime=dateString+' '+'23:59',
            createdAtStart=new Date(stateTime).getTime(),
            createdAtEnd=new Date(endTime).getTime();
            this.setState({
                object:this.state.createdAtStart=createdAtStart,
                object:this.state.createdAtEnd=createdAtEnd,
                dateValue:moment(moment(dateString))
            })
    }
    //查找作业
    searchHomeworkList(){
        let pageNumber=0,
            pageSize=5,
            createdAtStart=this.state.createdAtStart,
            createdAtEnd=this.state.createdAtEnd;
            this.getDraftListData.bind(this,loginToken,pageNumber,pageSize,createdAtStart,createdAtEnd)();
    }
    //重置
    resetSearch(){
        this.setState({
            createdAtStart:'',
            createdAtEnd:'',
            dateValue:undefined
        })
    }
    //分页
    paginationSel(page){
        this.setState({
            loadingShow:'block',
            currentPage:page
        })
        let pageNumber=page-1,
            pageSize=5,
            createdAtStart='',
            createdAtEnd="";
            this.getDraftListData.bind(this,loginToken,pageNumber,pageSize,createdAtStart,createdAtEnd)();
    }
    //发布作业
    publishHomework(id,catalogIds,questionIds,e){
        this.setState({
            pusblishVisible:true,
            homeworkId:id,
            currentCatalogIds:catalogIds,
            currentQuestionIds:questionIds,
            publishType:e.key,
            flag:!this.state.flag
        })

    }
    //发布之后通知父组件
    noticePublish(data){
        this.setState({
            pusblishVisible:data
        })
    }
    //删除指定作业
    homeworkDel(e){
        console.log(e.target.getAttribute('data-id'))
        let id=e.target.getAttribute('data-id');
            this.setState({
                isShowModal:true,
                homeworkId:id
            })



    }
    //子组件通知父组件改变isShowModal值
    noticeHomework(data,isRefresh){
        this.setState({
            isShowModal:data,
        })
        if(isRefresh===false){
            return;
        }
        let pageNumber=this.state.homeworkListData.length==1 ? this.state.currentPage-2 : this.state.currentPage-1,//如果当前数据为1条的时候删除了之后就就跳回上一页
            pageSize=5,
            createdAtStart='',
            createdAtEnd='';
            this.getDraftListData.bind(this,loginToken,pageNumber,pageSize,createdAtStart,createdAtEnd)();
    }
}

export default HomeworkList
