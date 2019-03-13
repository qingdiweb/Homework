/**
 * 练习详情
 */
import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import { Link, hashHistory } from 'react-router'
import { fromJS } from 'immutable';
import { DraggableArea, DraggableAreasGroup} from 'react-draggable-tags';
import { Radio , Checkbox , Select , Icon , Input , Modal , Row , Col , Button,Breadcrumb,Spin} from 'antd';
import { getExerciseDetail,delExerciseTopic} from '../../fetch/classroom-exercise/classroom-exercise'
import DelModal from '../../Components/DelModal';
import Pagination from '../../Components/Pagination';
import * as Constants from '../../Constants/store'

import './style.less'

const Option = Select.Option;
const loginToken=localStorage.getItem("loginToken");
class EditDetail extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
        this.state={
            exerciseList:{},//练习列表
            exerciseListLen:'',//数据条数
            flag:false,
            loadingShow:'block',//加载图标
            isShowDelModal:false,
            topicId:'',//题目id
            parentType:1,
            currentPage:1
        }

    }
    componentWillMount(){
       let exerciseId=this.props.params.exerciseId,
            pageNumber=-1,//第一页
            pageSize=-1;//一页数据数
            this.getExerciseDetail.bind(this,loginToken,exerciseId,pageNumber,pageSize)();

    }
    //获取题目数据
    getExerciseDetail(loginToken,exerciseId,pageNumber,pageSize){
        const resultExerciseDetail = getExerciseDetail(loginToken,exerciseId,pageNumber,pageSize);
                resultExerciseDetail.then(res => {
                    return res.json()
                }).then(json => {
                    // 处理获取的数据
                    const data = json
                    if (data.result) {
                        let exerciseListData=data.data,
                            questionInfoList=exerciseListData.quizQuestionInfoList;
                            questionInfoList=Constants.dealQuestion(questionInfoList,'questionInfo');
                            exerciseListData.newCreatedAt=Constants.dealTimestamp(exerciseListData.createdAt);
                            this.setState({
                                exerciseList:exerciseListData,
                             /*   exerciseListLen:data.data.pageable.totalSize,*/
                                loadingShow:'none',//隐藏图标
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
    //删除题目
    delExerciseTopic(loginToken,quizId,questionIds,questionCount){
        return new Promise((resolve,reject)=>{
            const resultDelExerciseTopic=delExerciseTopic(loginToken,quizId,questionIds,questionCount);
                   resultDelExerciseTopic.then(res => {
                      return res.json()
                  }).then(json => {
                      // 处理获取的数据
                      const data = json
                      if (data.result) {
                        resolve(data.data)
                          //保存成功之后-跳转回作业首页列表
                          //hashHistory.push('/no-publish-homework');
                          //window.location.reload()
                      }else{
                        message.warning(data.error);
                      }
                  }).catch(ex => {
                      // 发生错误
                      if (__DEV__) {
                        reject(ex.message)
                        console.error('暂无数据, ', ex.message)
                      }
                  })
        })

    }
    render() {
        let exerciseList=this.state.exerciseList;
        return (
            <div className='exercise-detail'>
                <h1 className='header-nav'>
                    <Breadcrumb separator=">">
                        <Breadcrumb.Item><Link to='/classroom-exercise'>课堂作业</Link></Breadcrumb.Item>
                        <Breadcrumb.Item >练习详情</Breadcrumb.Item>
                    </Breadcrumb>
               </h1>
               {
                    Constants.isFormat(exerciseList,Object)&&<div className="exercise-info-title clear-fix">
                    <p className='common-sec-title' style={{marginBottom:'30px'}}><span className='sec-title-line'></span><span>练习信息</span></p>
                            <div className='list-sec corrections'>
                                        <p className="date"><span>{exerciseList.newCreatedAt}</span></p>
                                        <div className="mark-box homeworinfo-mark">
                                            <span className="class-mark" title={exerciseList.className}>{exerciseList.className}</span>
                                            <div className='homework-name-time'>
                                                <h1 className="homework-mark">
                                                    <span className="homework-name" title={exerciseList.name}>{exerciseList.name}</span>
                                                </h1>
                                                <p>
                                                    <span className="homeworknum-mark">共{exerciseList.questionCount}题</span>
                                                    <span className={exerciseList.state==0 ? 'nopublish-state' : exerciseList.state==1&&'answer-state'}>{exerciseList.state==0 ? '未发布' : exerciseList.state==1&&'作答中'}</span>
                                                </p>
                                            </div>
                                        </div>
                                        {
                                            exerciseList.state==0&&<div className="mark-box correcting-mark-box">
                                                <p>
                                                    <Button type='primary' className="detail-btn" data-id={exerciseList.id} onClick={this.continueAdd.bind(this)}>继续添加</Button>
                                                </p>
                                            </div>
                                        }
                                </div>
                        </div>
                }
                <div id="decorate-list" className="clear-fix">
                    <div style={{"display":this.state.loadingShow}}>
                        <Spin size="large" style={{"fontSize":"30px","display":'block','margin':'300px auto'}}/>
                    </div>
                    {
                       Constants.isFormat(exerciseList,Object)&&Constants.isFormat(exerciseList.quizQuestionInfoList,Array) ? exerciseList.quizQuestionInfoList.map((item,index)=>{
                                                                let degreeData="",//难度展示
                                                                    degreeTxt=item.questionInfo.degree/20,
                                                                    showSec="",
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

                                                                return  <div key={index} className="topic-sec">
                                                                            <div className="topic-sec-cont">
                                                                                <div className="option-cont">
                                                                                    <h1 className='cont-title'><span>{index+1}、</span><span className="topic-type">({item.questionInfo.category})</span><span dangerouslySetInnerHTML={{ __html: item.questionInfo.title }}></span></h1>
                                                                                    <div  className='parent-option-cont'>
                                                                                        <div>
                                                                                            {
                                                                                                item.questionInfo.options.length>0 ? item.questionInfo.options.map((ele,i)=>{
                                                                                                    return <p key={i}><span className="option">{optionsNub[i]}</span><span className="option-cont-html" dangerouslySetInnerHTML={{ __html: ele }}></span></p>
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
                                                                                                item.questionInfo.knowledges.length>0 ? <p>
                                                                                                    <span className="title">考点</span>
                                                                                                    {
                                                                                                        item.questionInfo.knowledges.map((ele,i)=>{
                                                                                                            return <span className="exam-site" key={i}>{ele}</span>
                                                                                                        })
                                                                                                    }
                                                                                                </p> : ''
                                                                                            }
                                                                                         </div>
                                                                                    </div>


                                                                                </div>
                                                                                <h1 className="topic-sec-head">
                                                                                    <p className="show-parse" data-check={index} data-showType={item.questionInfo.isShow} onClick={this.showParse.bind(this)}>
                                                                                        {
                                                                                            item.questionInfo.isShow=='none' ? <Icon type="eye-o" style={{width:'16px',marginRight:'8px',color: '#CECECE' }} /> : <Icon type="eye" style={{width:'16px',marginRight:'8px',color: '#2dbb55' }} />
                                                                                        }
                                                                                        显示解析
                                                                                    </p>
                                                                                    {
                                                                                        exerciseList.state==0&&<p className="del-topic-btn-p">
                                                                                        <div style={{ fontSize:14,color:'#555',cursor:'pointer',lineHeight:'42px','display':this.state.isCheck=='block' ? 'none' : 'block'}} data-id={item.questionInfo.id} onClick={this.delTopic.bind(this)}><Icon type="delete"style={{ fontSize: 16,marginRight:8,color:'#555','display':'inline-block'}}/>删除</div>
                                                                                        </p>
                                                                                    }
                                                                                    <p className={item.state==0 ? "exercise-topic-state-no" : 'exercise-topic-state-yes'}>
                                                                                        {
                                                                                            item.state==0 ? "未发布" : '已发布'
                                                                                        }
                                                                                    </p>


                                                                                </h1>
                                                                                 <div className="parse-cont" style={{'display':item.questionInfo.isShow}} data-flagValue={this.state.flag}>
                                                                                    {
                                                                                        item.questionInfo.answerDetail!=''&&item.questionInfo.answerDetail!=null ? <p><span className="title">答案</span><span className="text" dangerouslySetInnerHTML={{ __html: item.questionInfo.answerDetail}}></span></p> : ''
                                                                                    }
                                                                                    {
                                                                                        item.questionInfo.answerParsing!=''&&item.questionInfo.answerParsing!=null ? <p><span className="title">解析</span><span className="text" dangerouslySetInnerHTML={{ __html: item.questionInfo.answerParsing}}></span></p> : ''
                                                                                    }
                                                                                    {/*<p><span className="title">题源</span><span className="text" dangerouslySetInnerHTML={{ __html: item.source}}></span></p>*/}
                                                                                    {
                                                                                        degreeData!=''&&degreeData!=null ? <p>
                                                                                            <span className="title">难度</span>
                                                                                            <span className="degree">{degreeData}</span>
                                                                                        </p> : ''
                                                                                    }
                                                                                    {
                                                                                        item.questionInfo.knowledges.length!=0 ? <p>
                                                                                        <span className="title ">考点</span>
                                                                                            {
                                                                                                item.questionInfo.knowledges.map((ele,i)=>{
                                                                                                    return <span className="exam-site" key={i}>{ele}</span>
                                                                                                })
                                                                                            }
                                                                                        </p> : ''
                                                                                    }
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                })  : <div style={{'fontSize':'16px','textAlign':'center','margin':'300px auto',"display":this.state.loadingShow=='block' ? 'none' : 'block'}}><Icon type="exclamation-circle" style={{marginRight:'5px',color:'rgba(255, 159, 0, 1)'}}/>暂无数据~</div>
                    }
                    <DelModal isShowModal={this.state.isShowDelModal} parentType={this.state.parentType}  topicId={this.state.topicId} noticeHomework={this.noticeHomework.bind(this)}/>
                    {/*<Pagination currentPage={this.state.currentPage} topicListLen={this.state.topicListLen} paginationSel={this.paginationSel.bind(this)}/>*/}
                </div>
            </div>
        )
    }
    //继续添加
    continueAdd(e){
        let exerciseId=this.props.params.exerciseId,
            noticeDecorateQuestionIds='',
            catalogIds='';//章节
            this.state.exerciseList.quizQuestionInfoList.forEach((item,index)=>{
                noticeDecorateQuestionIds+=item.questionInfo.id+',';
                catalogIds+=item.catalogId+',';
            })
            window.noticeDecorateQuestionIds=noticeDecorateQuestionIds.substr(0,noticeDecorateQuestionIds.length-1);
            window.catalogIds=catalogIds.substr(0,catalogIds.length-1);
            hashHistory.push('/exercise-selected/'+'0'+'/'+exerciseId+'/3')
    }
    //练习详情-删除题目
    delTopic(e){
        let id=e.target.getAttribute('data-id');
        this.setState({
            isShowDelModal:true,
            topicId:id
        })
    }
    //子组件通知父组件改变isShowModal值
    noticeHomework(data,id){
        this.setState({
            isShowDelModal:data
        })
        if(id===''){
            return;
        }
        let quizId=this.props.params.exerciseId,
            questionIds=id,
            questionCount=1;
            this.delExerciseTopic.bind(this,loginToken,quizId,questionIds,questionCount)().then((data)=>{
                //删除之后更新题目
                this.getExerciseDetail.bind(this,loginToken,quizId,-1,-1)();
            })

    }
    //查看解析
    showParse(e){
        let datacheck=e.currentTarget.getAttribute('data-check'),
            isShow=e.currentTarget.getAttribute('data-showType');
            if(isShow=='none'){
                let items=this.state.exerciseList;
                    items.quizQuestionInfoList[datacheck].questionInfo.isShow='block';
                    this.setState({exerciseList:items,flag:!this.state.flag});
            }else{
                let items=this.state.exerciseList;
                    items.quizQuestionInfoList[datacheck].questionInfo.isShow='none';
                    this.setState({exerciseList:items,flag:!this.state.flag});
            }
    }
    //分页
    paginationSel(page){
        this.setState({
            loadingShow:'block',
            currentPage:page
        })
        let draftId=this.props.params.draftId,
            pageNumber=page-1,//第一页
            pageSize=5;//一页数据数
            this.getDefaultQuestionList.bind(this,loginToken,draftId,pageNumber,pageSize)();
    }

}

export default EditDetail
