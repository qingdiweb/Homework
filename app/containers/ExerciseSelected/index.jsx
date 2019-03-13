/**
 * 课堂练习已选
 */
import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import { Link, hashHistory } from 'react-router'
import { fromJS } from 'immutable';
import { DraggableArea, DraggableAreasGroup} from 'react-draggable-tags';
import { Modal , Button , Breadcrumb,Menu, Dropdown,message} from 'antd';
import { saveDefault , updateExercise} from '../../fetch/decorate-homework/decorate-homework'
import { delDraftListData } from '../../fetch/no-publish-homework/no-publish-homework'
import { getExerciseDetail} from '../../fetch/classroom-exercise/classroom-exercise'
import DecorateList from '../../components/DecorateList'
import ExercisePublishModal from '../../components/ExercisePublishModal'

import * as Constants from '../../Constants/store'

import './style.less'
const loginToken=localStorage.getItem("loginToken");
class ExerciseSel extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
        this.state = {
            parentType:1,//父组件类型-看是哪个父组件调用的作业列表子组件 0 是布置作业 1 查看已选
            draftSelNum:'',//查看已选-里面的题数
            flag:false,//用作filterDate对象深比较来触发子组件的更新
            visible:false,
            noticeTopicNumData:[],
            noticeTopicNumDataLen:'',//查看已选当前有多少道题
            highlight:'',//通知子组件列表拖拽是哪个高亮
            stopHighlight:'',//取消高亮
            noticeVisible:false,
            previewStatis:{
              totalSize:0,
              objectiveNum:0,
              subjectiveNum:0
            },
            dragKey:0,
            noticeHightData:{
              highlight:'',
              stopHighlight:true
            },
            publishType:'',//发布类型 0 是随堂练习发布 1 课后作业发布
            choiceData:'',//手动数据带有版本 教材 最后一章节
            choiceCatalogIds:'',//章节顺序
            recordId:'',//记录当前拖拽的id
            recordIndex:''//记录当前拖拽的id下标
        }
    }
    componentWillMount(){
      //通知左侧menu导航-当前在那个menu下
      localStorage.setItem('positionMenu',JSON.stringify(['1']));
      //获取测验下版本，教材 章节
      let exerciseId=this.props.params.exerciseId,
          pageNumber=-1,//第一页
          pageSize=-1;//一页数据数
          this.getExerciseDetail.bind(this,loginToken,exerciseId,pageNumber,pageSize)().then((data)=>{
              let choiceData=data.choiceCatalogId!='' ? data.choiceEditionId+','+data.choiceTextbookId+','+data.choiceCatalogId : '',
                  choiceCatalogIds=data.choiceCatalogIds;
                  this.setState({
                    choiceData,
                    choiceCatalogIds
                  })
          }).catch((ex)=>{
              console.log(ex)
          })
    }
    componentDidMount() {
        this.setState({
            flag:!this.state.flag
        })
    }
    //获取练习题目数据
    getExerciseDetail(loginToken,exerciseId,pageNumber,pageSize){
        return new Promise((resolve,reject)=>{
            const resultExerciseDetail = getExerciseDetail(loginToken,exerciseId,pageNumber,pageSize);
                    resultExerciseDetail.then(res => {
                        return res.json()
                    }).then(json => {
                        // 处理获取的数据
                        const data = json
                        if (data.result) {
                            let exerciseListData=data.data;
                                resolve(exerciseListData)
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
    //更新练习
    updateExercise(loginToken,quizId,catalogIds,questionIds,choiceCatalogId,questionCount){
      const resultUpdateExercise=updateExercise(loginToken,quizId,catalogIds,questionIds,choiceCatalogId,questionCount);
            resultUpdateExercise.then(res=>{
              return res.json()
            }).then(json=>{
                // 处理获取的数据
                const data = json
                this.setState({
                  visible: false,
                });
                if (data.result) {
                    //保存成功之后-跳转回作业首页列表
                    hashHistory.push('/exercise-detail'+'/'+this.props.params.exerciseId)
                    window.location.reload()
                    //通知父组件设定为false
                   /* this.props.noticeHomework.bind(this,false,true)()*/
                    //将全局存储的题目id和章节id置空
                    window.noticeDecorateQuestionIds='';
                    window.catalogIds='';
                }else{
                    message.warning(data.error);
                }
            })
    }
    //删除指定草稿
    delDraftListData(loginToken,draftId){
      const resultDelDraft=delDraftListData(loginToken,draftId);
                resultDelDraft.then(res=>{
                  return res.json()
                }).then(json => {
                  // 处理获取的数据
                  const data = json
                  this.setState({
                    visible: false,
                  });
                  if (data.result) {
                  }
                  else{
                      message.warning(data.error);
                  }
                }).catch(ex =>{
                  // 发生错误
                  if (__DEV__) {
                      console.error('暂无数据, ', ex.message)
                  }
                })
    }
    render() {
        return (
            <div className="exercise-selected">
              <h1 className='header-nav'>
                <Breadcrumb separator=">">
                  <Breadcrumb.Item><Link to='/classroom-exercise'>课堂作业</Link></Breadcrumb.Item>
                  <Breadcrumb.Item ><Link to={/exercise-detail/+this.props.params.exerciseId}>练习详情</Link></Breadcrumb.Item>
                  <Breadcrumb.Item >查看已选</Breadcrumb.Item>
                </Breadcrumb>
              </h1>
              <div className="header-search clear-fix">
                    <Button type='primary' className="search-btn" onClick={this.updateExerciseBtn.bind(this)}>保存</Button>
                    <Button className="search-btn add-btn"><Link to={"/decorate-homework/"+this.props.params.exerciseId+'/'+this.props.params.isSelected}>继续添加</Link></Button>
              </div>
              <div className="homework-list">
                  <div className="preview-export">
                      <div className="total-num">
                          总题数： {this.state.previewStatis.totalSize}
                      </div>
                      <div className="question-box">
                        <div className="objective-subjective-title">
                            客观题:<span style={{color:'rgba(45, 187, 85, 1)',margin:'0px 16px 0px 8px'}}>{this.state.previewStatis.objectiveNum}</span> 主观题:<span style={{color:'rgba(45, 187, 85, 1)',marginLeft:'8px'}}>{this.state.previewStatis.subjectiveNum}</span>
                        </div>
                        <div className="question-selected">
                        {
                          this.state.noticeTopicNumData.length>0 ? <DraggableArea
                                                                            initialTags={this.state.noticeTopicNumData}
                                                                            key={this.state.dragKey}
                                                                            render={({tag}) =>(
                                                                              <span key={tag.topicIndex} className='question-circle clear-fix'  data-highlight={tag.topicIndex-1} data-id={tag.id} onMouseDown={this.handleStart.bind(this)} onMouseUp={this.handleStop.bind(this)} >{tag.topicIndex}</span>
                                                                            )}
                                                                            onChange={(tags) =>{
                                                                               let currentQuestionIds='';
                                                                               for (var i = 0; i < tags.length; i++) {
                                                                                 tags[i].topicIndex=i+1;
                                                                                 currentQuestionIds+=tags[i].id+','
                                                                               }
                                                                               this.setState({
                                                                                  object:this.state.noticeTopicNumData=tags,
                                                                               })
                                                                               //处理题目顺序
                                                                               window.noticeDecorateQuestionIds=currentQuestionIds.substring(0,currentQuestionIds.length-1);
                                                                               //处理拖拽后题目对应的章节顺序
                                                                               let temp='',//临时存放数据
                                                                                   draggableIndex=window.noticeDecorateQuestionIds.split(',').indexOf(this.state.recordId),//拖拽之后的索引
                                                                                   catalogIdsArr=window.catalogIds.split(',');
                                                                                   temp=catalogIdsArr[this.state.recordIndex];
                                                                                   catalogIdsArr[this.state.recordIndex]=catalogIdsArr[draggableIndex];
                                                                                   catalogIdsArr[draggableIndex]=temp;
                                                                                   window.catalogIds=catalogIdsArr.join(',');
                                                                            }}
                                                                          /> : ''

                        }
                        </div>
                        <Button className="preview-export-btn" onClick={this.previewExport.bind(this)}>预览导出</Button>
                      </div>
                  </div>
                  <DecorateList  flag={this.state.flag} parentType={this.state.parentType} draftId={this.props.params.draftId} exerciseId={this.props.params.exerciseId} choiceData={this.state.choiceData} highlight={this.state.highlight} stopHighlight={this.state.stopHighlight}  noticeTopicNumData={this.state.noticeTopicNumData} noticeTopicNum={this.noticeTopicNum.bind(this)} isSelected={this.props.params.isSelected}/>
              </div>
              <ExercisePublishModal flag={!this.state.flag} pusblishVisible={this.state.visible} exerciseId={this.props.params.exerciseId} choiceData={this.state.choiceData} choiceCatalogIds={this.state.choiceCatalogIds} noticeExerciseSel={this.noticeExerciseSel.bind(this)}/>
            </div>
        )
    }
    //保存练习
    updateExerciseBtn(){
      if(Constants.isHasCatalog(window.catalogIds)){//如果当前所选操作的题目带有章节就直接保存
        let quizId=this.props.params.exerciseId,//测验id
            questionIds=window.noticeDecorateQuestionIds,
            catalogIds=window.catalogIds,
            choiceCatalogId='',
            questionCount=questionIds=='' ? 0 : questionIds.split(',').length;
            this.updateExercise.bind(this,loginToken,quizId,catalogIds,questionIds,choiceCatalogId,questionCount)()
      }else{
        this.setState({
            visible:true
        })
      }

    }
    //保存草稿/发布作业时判断当前是否有题目，没有就给提示
    noticeTopicNum(data,dataLen,objectiveNum,subjectiveNum){
        this.setState({
          noticeTopicNumData:data,
          noticeTopicNumDataLen:dataLen,
          object:this.state.previewStatis.totalSize=dataLen,
          object:this.state.previewStatis.objectiveNum=objectiveNum,
          object:this.state.previewStatis.subjectiveNum=subjectiveNum
        })
        //给拖拽题目列表key标识-渲染刷新
        this.setState({
          dragKey:this.state.dragKey==1 ? 0 : 1
        })
        //删除操作-如果监听到题目个数为0就自动跳转至布置作业
        let isSelected=this.props.params.isSelected;//0 是测验详情过来的 1 是草稿过来的
            if(dataLen==0){
              hashHistory.push("/exercise-detail/"+this.props.params.exerciseId)
            }
    }

    //通知父已选界面
    noticeExerciseSel(data){
      this.setState({
        visible:data
      })
    }
    //拖拽开始
    handleStart(e){
      let highlight=e.target.getAttribute('data-highlight'),
          recordId=e.target.getAttribute('data-id'),//记录当前拖拽的id
          recordIndex=window.noticeDecorateQuestionIds.split(',').indexOf(recordId);//记录当前拖拽的id下标
          //this.state.highlight=highlight;
          this.setState({
            highlight:highlight,
            stopHighlight:'false',
            recordId:recordId,
            recordIndex:recordIndex
          })
    }
    //拖拽结束
    handleStop(e){
      let stopHighlight=e.target.getAttribute('data-highlight');
      this.setState({
        stopHighlight:'true'
      })
    }
    //预览导出
    previewExport(){
      localStorage.setItem('noticeDecorateQuestionIds',window.noticeDecorateQuestionIds)
      let href=window.location.origin+window.location.pathname+'#/pdf-preview/'+this.props.params.draftId+'/'+loginToken;
        window.open(href)
    }
}

export default ExerciseSel
