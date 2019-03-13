/**
 * 查看已选
 */
import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import { Link, hashHistory } from 'react-router'
import { fromJS } from 'immutable';
import { Modal , Button , Breadcrumb,Menu, Dropdown} from 'antd';
import { DraggableArea, DraggableAreasGroup} from 'react-draggable-tags';
import { saveDefault } from '../../../fetch/decorate-homework/decorate-homework'
import { delDraftListData } from '../../../fetch/no-publish-homework/no-publish-homework'
import DecorateList from '../../../components/DecorateList'
import PublishModal from '../../../components/PublishModal'
import Dialog from '../../../components/Dialog'


import './style.less'
const loginToken=localStorage.getItem("loginToken");
class DecorateListSel extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
        this.state = {
            parentType:1,//父组件类型-看是哪个父组件调用的作业列表子组件 0 是布置作业 1 查看已选
            draftSelNum:'',//查看已选-里面的题数
            flag:false,//用作filterDate对象深比较来触发子组件的更新
            visible:false,
            pusblishVisible:false,
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
            recordId:'',//记录当前拖拽的id
            recordIndex:'',//记录当前拖拽的id下标
            dialogFlag:false,
            leaveVisible:false,
        }
    }
    componentWillMount(){
      //通知左侧menu导航-当前在那个menu下
      localStorage.setItem('positionMenu',JSON.stringify(['1']));
    }
    componentDidMount() {
        this.setState({
            flag:!this.state.flag
        })
    }
    render() {
        const menu = (
          <Menu onClick={this.publishHomework.bind(this)}>
            <Menu.Item key="0" style='textAlign:center'>课堂作业</Menu.Item>
            <Menu.Item key="1">课后作业</Menu.Item>
          </Menu>
        );
        let storageObj=localStorage.storageObj!=null&&localStorage.storageObj!=''&&typeof(localStorage.storageObj)!='undefined' ? JSON.parse(localStorage.storageObj) : {};//主要用于再次编辑过来用的路由参数
        return (
            <div className="decorate-selected">
              <h1 className='header-nav'>
                {
                  this.props.params.isSelected==1 ? <Breadcrumb separator=">">
                      <Breadcrumb.Item onClick={this.breadcrumbLeave.bind(this)}><a href="javascript:;">布置</a></Breadcrumb.Item>
                      <Breadcrumb.Item >查看已选</Breadcrumb.Item>
                    </Breadcrumb> : ''
                }
                {
                  this.props.params.isSelected==2 ? <Breadcrumb separator=">">
                      <Breadcrumb.Item onClick={this.breadcrumbLeave.bind(this)}><a href="javascript:;">作业草稿</a></Breadcrumb.Item>
                      <Breadcrumb.Item >查看已选</Breadcrumb.Item>
                    </Breadcrumb> : ''
                }
                {
                  this.props.params.isSelected==3 ? <Breadcrumb separator=">">
                      <Breadcrumb.Item><Link to='/classroom-exercise'>课堂作业</Link></Breadcrumb.Item>
                      <Breadcrumb.Item ><Link to={/exercise-detail/+this.props.params.homeworkId}><a href="javascript:;">练习详情</a></Link></Breadcrumb.Item>
                      <Breadcrumb.Item >查看已选</Breadcrumb.Item>
                    </Breadcrumb> : ''
                }
                {
                  this.props.params.isSelected==4 ? <Breadcrumb separator=">">
                      {/*<Breadcrumb.Item ><Link to={/homework-detail/+this.props.params.homeworkId}>作业详情</Link></Breadcrumb.Item>*/}
                      <Breadcrumb.Item onClick={this.breadcrumbLeave.bind(this)}><a href="javascript:;">再次编辑</a></Breadcrumb.Item>
                      <Breadcrumb.Item >查看已选</Breadcrumb.Item>
                    </Breadcrumb> : ''
                }
              </h1>
              <div className="header-search clear-fix">
                    <Dropdown overlay={menu}>
                      <Button className="search-btn" type="primary">发布</Button>
                    </Dropdown>
                    <Button className="search-btn" onClick={this.saveDraft.bind(this)}>保存草稿</Button>
                    <Button className="search-btn add-btn"><Link to={"/decorate-homework/"+this.props.params.draftId+'/'+this.props.params.isSelected}>继续添加</Link></Button>
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
                  <DecorateList  flag={this.state.flag} parentType={this.state.parentType} draftId={this.props.params.draftId} highlight={this.state.highlight} stopHighlight={this.state.stopHighlight}  noticeTopicNumData={this.state.noticeTopicNumData} noticeTopicNum={this.noticeTopicNum.bind(this)} isSelected={this.props.params.isSelected}/>
              </div>
               <Modal
                  title="保存草稿"
                  visible={this.state.visible}
                  onOk={this.handleOk.bind(this)}
                  onCancel={this.handleCancel.bind(this)}
                  okText={'确定'}
                  cancelText={'取消'}
                >
                  <p style={{'text-align':'center','fontSize':'22px','color': 'rgba(60, 61, 65, 1)'}}>确定保存草稿到作业草稿</p>
                  <p style={{'text-align':'center','color': 'red'}}>(提示：保存后，页面跳转回作业列表页)</p>
                </Modal>
                <Modal
                  title="提示"
                  visible={this.state.noticeVisible}
                  onCancel={this.noticeHandleCancel.bind(this)}
                  okText={'确定'}
                  cancelText={'取消'}
                  footer={[<Button type="primary"style={{marginLeft:'0'}} onClick={this.noticeHandleOk.bind(this)}>确定</Button>]}
                >
                  <p style={{'text-align':'center','fontSize':'20px'}}>暂无已选题目</p>
                </Modal>
                <PublishModal pusblishVisible={this.state.pusblishVisible} publishType={this.state.publishType} draftId={this.props.params.draftId} isSelected={this.props.params.isSelected} noticeHomework={this.noticeHomework.bind(this)}/>
                <Dialog dialogFlag={this.state.dialogFlag} leaveVisible={this.state.leaveVisible} topicSel={this.state.noticeTopicNumDataLen} noticeLeaveOk={this.noticeLeaveOk.bind(this)} noticeLeaveCancel={this.noticeLeaveCancel.bind(this)}/>
            </div>
        )
    }
    //查看已选中点击面包屑离开提示
    breadcrumbLeave(){
      let isSelected=this.props.params.isSelected,//1布置过来的 2作业草稿过来的 4再次编辑过来的
          draftId=this.props.params.draftId,//草稿id
          homeworkId=this.props.params.homeworkId,//作业id
          storageObj=localStorage.storageObj!=null&&localStorage.storageObj!=''&&typeof(localStorage.storageObj)!='undefined' ? JSON.parse(localStorage.storageObj) : {},//主要用于再次编辑过来用的路由参数
          questionIdsLen=window.noticeDecorateQuestionIds=='' ? 0 : window.noticeDecorateQuestionIds.split(',').length,
          questionIds=window.noticeDecorateQuestionIds,
          catalogIds=window.catalogIds;
          if(isSelected==1){
              hashHistory.push('/decorate-homework/'+draftId+'/'+isSelected)
          }else if(isSelected==2){
              if(questionIdsLen==0){
                hashHistory.push('/no-publish-homework')
              }else{
                this.setState({
                  leaveVisible: true,
                  dialogFlag:!this.state.dialogFlag
                });
              }
          }else if(isSelected==4){
              if(questionIdsLen==0){
                hashHistory.push('/homework-edit-again/'+homeworkId+'/'+draftId+'/'+storageObj.jumpType+'/'+storageObj.type+'/'+storageObj.classId);
              }else{
                this.setState({
                  leaveVisible: true,
                  dialogFlag:!this.state.dialogFlag
                });
              }
          }
    }
    //离开确认
    noticeLeaveOk(e){
        let isSelected=this.props.params.isSelected,//1布置过来的 2作业草稿过来的 4再次编辑过来的
            draftId=this.props.params.draftId,
            currentQuestionIds=window.noticeDecorateQuestionIds,
            currentCatalogIds=window.catalogIds,
            questionCount=this.state.noticeTopicNumDataLen;
            this.saveDefaultInterface.bind(this,loginToken,draftId,currentQuestionIds,currentCatalogIds,questionCount)();
            if(isSelected==1){
              localStorage.setItem('positionMenu',JSON.stringify(['1']));
            }else if(isSelected==2){
                localStorage.setItem('positionMenu',JSON.stringify(['2']));
            }else if(isSelected==4){
                localStorage.setItem('positionMenu',JSON.stringify(['1']));
            }
            //通知头部
            this.props.noticeDecorate.bind(this,0,'','',draftId)()
    }
    //离开
    noticeLeaveCancel(e){
      let isSelected=this.props.params.isSelected,//1布置过来的 2作业草稿过来的 4再次编辑过来的
          draftId=this.props.params.draftId,//草稿id
          homeworkId=this.props.params.homeworkId,//作业id
          storageObj=localStorage.storageObj!=null&&localStorage.storageObj!=''&&typeof(localStorage.storageObj)!='undefined' ? JSON.parse(localStorage.storageObj) : {};//主要用于再次编辑过来用的路由参数
          if(isSelected==1){
              hashHistory.push('/decorate-homework/'+draftId+'/'+isSelected)
          }else if(isSelected==2){
              this.setState({
                leaveVisible: false,
                dialogFlag:!this.state.dialogFlag
              },()=>{
                  hashHistory.push('/no-publish-homework');
              });
          }else if(isSelected==4){
              this.setState({
                leaveVisible: false,
                dialogFlag:!this.state.dialogFlag
              },()=>{
                  hashHistory.push('/homework-edit-again/'+homeworkId+'/'+draftId+'/'+storageObj.jumpType+'/'+storageObj.type+'/'+storageObj.classId);
              });
          }
          //离开清空选题
          window.noticeDecorateQuestionIds='';//用作通知header组件离开当前页面保存草稿参数用
          window.catalogIds='';
          //通知头部
          this.props.noticeDecorate.bind(this,0,'','',draftId)()

    }
    //保存草稿
    saveDraft(){
      //若当前无已选题目-则提示
      if(this.state.noticeTopicNumDataLen==0){
         this.setState({
            noticeVisible:true
         })
      }else{
         let draftId=this.props.params.draftId,
            currentQuestionIds=window.noticeDecorateQuestionIds,
            currentCatalogIds=window.catalogIds,
            questionCount=this.state.noticeTopicNumDataLen;
            if(questionCount==0){
              message.warning('暂无试题 请先选题')
            }else{
              this.saveDefaultInterface.bind(this,loginToken,draftId,currentQuestionIds,currentCatalogIds,questionCount)();
            }
      }
    }
    //保存草稿接口
    saveDefaultInterface(loginToken,draftId,currentQuestionIds,currentCatalogIds,questionCount){
      const resultSaveDefault=saveDefault(loginToken,draftId,currentQuestionIds,currentCatalogIds,questionCount);
                   resultSaveDefault.then(res => {
                      return res.json()
                  }).then(json => {
                      // 处理获取的数据
                      const data = json
                      this.setState({
                        visible: false,
                      });
                      if (data.result) {
                          //保存成功之后-跳转回作业首页列表
                          hashHistory.push('/no-publish-homework');
                          window.location.reload()
                          //将布置作业id置空
                          window.noticeDecorateQuestionIds='';
                          window.catalogIds='';
                      }else{
                          message.warning(data.error);
                      }
                  }).catch(ex => {
                      // 发生错误
                      if (__DEV__) {

                          console.error('暂无数据, ', ex.message)
                      }
                  })
    }
    //发布作业
    publishHomework(e){
      //若当前无已选题目-则提示
      if(this.state.noticeTopicNumDataLen==0){
         this.setState({
            noticeVisible:true
         })
      }else{
        this.setState({
            pusblishVisible:true,
            publishType:e.key
        })
      }
    }
    //发布之后通知父组件
    noticeHomework(data,isRefresh){
        this.setState({
            pusblishVisible:data
        })
    }
    handleOk(e){
        console.log(e);
      }
    handleCancel(e){
        console.log(e);
        this.setState({
          visible: false,
        });
    }
    noticeHandleOk(){
      this.setState({
        noticeVisible:false
      })
    }
    noticeHandleCancel(){
      this.setState({
        noticeVisible:false
      })
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
        let isSelected=this.props.params.isSelected;//1 是布置作业过来的 0 是再次编辑过来的 2作业草稿编辑过来的
            if(dataLen==0){
              if(isSelected==1){
                hashHistory.push("/decorate-homework/"+this.props.params.draftId)
              }else if(isSelected==2){
                hashHistory.push('/no-publish-homework')
                //如果草稿中最后一道题删除-那么就删除这个草稿
                this.delDraftListData.bind(this,loginToken,this.props.params.draftId)()
              }else if(isSelected==4){
                hashHistory.push('/homework-edit-again/'+this.props.params.homeworkId+'/'+this.props.params.editDraftId)
              }
            }
      //通知父组件要离开时的题目数
      this.props.noticeDecorate.bind(this,window.noticeDecorateQuestionIds=='' ? 0 : window.noticeDecorateQuestionIds.split(',').length,window.noticeDecorateQuestionIds,window.catalogIds,this.props.params.draftId)()

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
      console.log(window.location.origin)
      localStorage.setItem('noticeDecorateQuestionIds',window.noticeDecorateQuestionIds)
      let href=window.location.origin+window.location.pathname+'#/pdf-preview/'+this.props.params.draftId+'/'+loginToken;
        window.open(href)
    }
}

export default DecorateListSel
