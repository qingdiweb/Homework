/**
 * 课堂记录详情
 */
import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import { Link, hashHistory } from 'react-router'
import { fromJS } from 'immutable';
import { DraggableArea, DraggableAreasGroup} from 'react-draggable-tags';
import { Radio , Checkbox , Select , Icon , Input , message,Modal , Row , Col , Table,Button,Breadcrumb,Spin,Popover} from 'antd';
import { getExerciseDetail,delExerciseTopic,saveExerciseRemark} from '../../fetch/classroom-exercise/classroom-exercise'
import DelModal from '../../Components/DelModal';
import Pagination from '../../Components/Pagination';
import * as Constants from '../../Constants/store'

import './style.less'

const Option = Select.Option;
const loginToken=localStorage.getItem("loginToken");
class ClassroomRecordDetail extends React.Component {
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
            currentPage:1,
            columns: [
                {
                    title: '考察题数',
                    dataIndex: 'questionCount',
                    width: '10%',
                    align:'center'

                },
                {
                    title: '平均提交率',
                    dataIndex: 'commitRate',
                    width: '10%',
                    align:'center'
                },
                {
                    title: '平均正确率',
                    dataIndex: 'rightRate',
                    width: '10%',
                    align:'center'
                }
            ],
            catalogAna:[],
            questionColumns: [
                {
                    title: '题号',
                    dataIndex: 'questionIndex',
                    width: '10%',
                    align:'center'

                },
                {
                    title: '题目详情',
                    dataIndex: 'questionTitle',
                    width: '10%',
                    align:'center',
                    render:(e) => <div style={{width:'390px',height:'21px',overflow:'hidden','text-overflow':'ellipsis','white-space':'nowrap'}} dangerouslySetInnerHTML={{ __html: e}}></div>
                },
                {
                    title: '作答结果',
                    dataIndex: 'answerResult',
                    width: '10%',
                    align:'center',
                    render:(e) => <Link to={'classroom-record-topic-detail/'+this.props.params.exerciseId+'/'+e}>查看</Link>
                },
                {
                    title: '未交',
                    dataIndex: 'noCommit',
                    width: '10%',
                    align:'center',
                    render:(e) => <a href="javascript:;" data-text={e.text} data-id={e.id}  data-person={e.person} onClick={this.lookChildNoCommit.bind(this)}>{e.text}</a>

                }
            ],
            questionAna:[],
            noteDisable:false,
            visible:false,
            childQuestionInfoList:[],//查看子题未提交人数
            noCommitText:'',//区分弹窗内容
            noCommitStudentList:[]
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
                            exerciseListData.commitRate=Constants.isFormat(exerciseListData.commitRate,String) ? exerciseListData.commitRate+'%' : '0%';
                            exerciseListData.rightRate=Constants.isFormat(exerciseListData.rightRate,String) ? exerciseListData.rightRate+'%' : '0%';
                            questionInfoList=Constants.dealQuestion(questionInfoList,'questionInfo');
                            exerciseListData.newCreatedAt=Constants.dealTimestamp(exerciseListData.createdAt);
                            questionInfoList.forEach((item,index)=>{
                                item.key=index;
                                item.questionIndex=index+1;
                                item.questionTitle=item.questionInfo.title;
                                item.answerResult=item.questionId;
                                item.noCommit={text:Constants.isFormat(item.questionInfo.childQuestionInfoList,Array) ? '查看' : (exerciseListData.allCount-item.commitCount)+'人',id:item.questionId,person:exerciseListData.allCount-item.commitCount}
                            })
                            this.setState({
                                exerciseList:exerciseListData,
                                catalogAna:[exerciseListData],
                                questionAna:questionInfoList,
                                loadingShow:'none',//隐藏图标
                            },()=>{
                                window.MathJax.Hub.Queue(["Typeset",window.MathJax.Hub,"output"]);
                            });

                    }
                }).catch(ex => {0
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
    //保存课堂笔记
    saveExerciseRemark(loginToken,quizId,remark){
        const resultSaveExerciseRemark=saveExerciseRemark(loginToken,quizId,remark);
               resultSaveExerciseRemark.then(res => {
                  return res.json()
              }).then(json => {
                  // 处理获取的数据
                  const data = json
                  if (data.result) {
                    message.success('保存成功');
                    this.setState({
                        noteDisable:false
                    })
                  }else{
                    message.warning(data.error);
 11                 }
              }).catch(ex => {
                  // 发生错误
                  if (__DEV__) {
                    console.error('暂无数据, ', ex.message)
                  }
              })

    }

    render() {
        let exerciseList=this.state.exerciseList;
        return (
            <div className='classroom-record-detail'>
                <h1 className='header-nav'>
                    <Breadcrumb separator=">">
                        <Breadcrumb.Item><Link to='/classroom-record'>课堂记录</Link></Breadcrumb.Item>
                        <Breadcrumb.Item >查看记录</Breadcrumb.Item>
                    </Breadcrumb>
               </h1>
                <div style={{"display":this.state.loadingShow}}>
                    <Spin size="large" style={{"fontSize":"30px","display":'block','margin':'300px auto'}}/>
                </div>
               {
                    Constants.isFormat(exerciseList,Object)&&this.state.loadingShow=='none'&&<div className="exercise-info-title clear-fix">
                           <p className='common-sec-title sec-title'><span className='sec-title-line'></span><span>练习信息</span></p>
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
                                                    <span className='answer-state'>已完成</span>
                                                </p>
                                            </div>
                                        </div>
                                </div>
                        </div>
                }
                {
                    this.state.loadingShow=='none'&&<div className="record-detail clear-fix">
                           <p className='common-sec-title sec-title'><span className='sec-title-line'></span><span>练习报告</span></p>
                           <div className='detail-sec'>
                               <p style={{marginTop:'-5px'}}>章节详情:({exerciseList.catalogNames})</p>
                               <Table
                                    columns={this.state.columns}
                                    dataSource={this.state.catalogAna}
                                    bordered
                                    size="small"
                                    rowKey={item => item.id}
                                    pagination= {false}
                                >
                                </Table>
                                <p style={{marginTop:'30px'}}>答题详情:</p>
                                <Table
                                    columns={this.state.questionColumns}
                                    dataSource={this.state.questionAna}
                                    bordered
                                    size="small"
                                    rowKey={item => item.key}
                                    pagination= {false}
                                >
                                </Table>
                                <p style={{marginTop:'30px'}}>课堂笔记:</p>
                                <div className='class-notes'>
                                    <div id='note' className={this.state.noteDisable ? 'textarea' : 'textarea-disable'} contentEditable={this.state.noteDisable}>
                                        {Constants.isFormat(exerciseList,Object)&&Constants.isFormat(exerciseList.remark,String) ? exerciseList.remark : '暂无笔记'}
                                    </div>
                                    <div className='note-btn'>
                                        <span className='edit-btn' onClick={this.editNote.bind(this)}>
                                            编辑
                                        </span>
                                        <span className='save-btn' onClick={this.saveRemark.bind(this)}>
                                            保存
                                        </span>
                                    </div>
                                </div>
                           </div>
                        </div>
                }
                <Modal
                      title="未提交情况"
                      visible={this.state.visible}
                      className='questionNoCommitModal'
                      cancelText="取消"
                      okText="确定"
                      footer={null}
                      onCancel={this.handleCancel.bind(this)}
                    >
                    <div>
                        {
                            this.state.noCommitText=='查看' ? <div>
                           {
                            Constants.isFormat(this.state.childQuestionInfoList,Array) ? this.state.childQuestionInfoList.map((item,index)=>{
                                return <div className='nocommit-modal-box'>
                                    <div className='title' dangerouslySetInnerHTML={{ __html: item.title }}>

                                    </div>
                                    <div className='nocommit-person'>
                                        <div style={{float:'left'}}>
                                            未提交人数：
                                        </div>
                                        <div style={{marginLeft:'90px'}}>
                                            {
                                                Constants.isFormat(item.unCommitStudentInfoList4Quiz,Array) ? item.unCommitStudentInfoList4Quiz.map((ele,i)=>{
                                                    return <span key={i} style={{marginRight:'10px'}}>{Constants.isFormat(ele.nickname,String) ? ele.nickname : '欧拉学生' }</span>
                                                }) : '暂无'
                                            }
                                        </div>

                                    </div>
                                </div>
                            }) : ''
                           }
                             </div> : <div>
                                 {
                                     Constants.isFormat(this.state.noCommitStudentList,Array) ? this.state.noCommitStudentList.map((item,index)=>{
                                        return <span key={index} style={{marginRight:'10px'}}>{Constants.isFormat(item.nickname,String) ? item.nickname : '欧拉学生'}</span>
                                    }) :''
                                 }
                             </div>
                        }
                    </div>

                    </Modal>
            </div>
        )
    }
    //编辑笔记
    editNote(){
        this.setState({
            noteDisable:true
        },()=>{
            document.getElementById('note').focus();
        })

    }
    saveRemark(){
        let remark=document.getElementById('note').innerText,
            quizId=this.props.params.exerciseId;
            this.saveExerciseRemark.bind(this,loginToken,quizId,remark)()
    }
    //查看字体未提交人数
    lookChildNoCommit(e){
        let noCommit=e.currentTarget.getAttribute('data-text'),
            questionId=e.currentTarget.getAttribute('data-id'),
            personNum=e.currentTarget.getAttribute('data-person'),//人数
            questionList=this.state.exerciseList.quizQuestionInfoList,
            noCommitText='',
            noCommitStudentList=[],
            childQuestionInfoList=[];
            if(noCommit=='查看'){
                questionList.forEach((item,index)=>{
                    if(item.questionId==questionId){
                        childQuestionInfoList=item.questionInfo.childQuestionInfoList
                    }
                })
                this.setState({
                    visible:true,
                    noCommitText:'查看',
                    childQuestionInfoList:childQuestionInfoList
                })
            }else{
                if (personNum!=0) {//未交人数部位0的时候
                    questionList.forEach((item,index)=>{
                        if(item.questionId==questionId){
                            noCommitStudentList=item.questionInfo.unCommitStudentInfoList4Quiz
                        }
                    })
                    this.setState({
                        visible:true,
                        noCommitText:'',
                        noCommitStudentList:noCommitStudentList
                    })
                }


            }
    }
     handleCancel(){
         this.setState({
            visible:false
        })
    }
}

export default ClassroomRecordDetail
