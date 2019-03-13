import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import { Link, hashHistory } from 'react-router'
import { Modal, message , Button , Input , Select ,DatePicker , Icon , Row , Col} from 'antd';
import { getTopicListData , DefaultDraftDelQuestion , publishHomework , addClass , getMaterialListData,getMaterialCatalogData,saveExercise,getLastOperation} from '../../fetch/decorate-homework/decorate-homework';
import { delHomeworkList , getClassList } from '../../fetch/index-homework/index-homework';
import TreeSelect from '../TreeSelect' 
import * as Constants from '../../Constants/store'
import datalocale from 'antd/lib/date-picker/locale/zh_CN';
import moment from 'moment';
import $ from  'jquery'
import './style.less'

const Option = Select.Option;
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD HH:mm';
const loginToken=localStorage.getItem("loginToken");
moment.locale('zh-cn');
class PublishModal extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
        this.state={
            visible: false,
            classInfo:[],
            defaultPublishTime:'',//默认发布时间
            defaultAsofTime:'',//默认截止时间
            homeworkNameVal:'',//作业名称
            homeworkNameError:"",//作业名称错误提示
            homeworkClassVal:'',//班级名称
            publishDate:Date.parse(new Date()),//发布时间
            asofDate:"",//截止时间
            homeworkNameErrorShow:'none',
            homeworkClassErrorShow:'none',
            homeworkPublishDateErrorShow:'none',
            homeworkAsofDateErrorShow:'none',
            asGreaterPublishErrorShow:'none',
            newProblemName:'',//添加新班级名字
            isAddclassShow:false,//是否显示添加班级输入框
            classPrompt:false,//添加班级为空提示 
            flag:true,
            defaultClass:[],//默认班级
            timeStamp:'',
            versionTimeStamp:'',
            materialTimeStamp:'',
            publishMaskShow:true,
            publishType:'',//发布类型 0 是随堂练习发布 1 课后作业发布
            versionInfoList:[],//版本-教材-章节
            textbookInfoList:[],//教材
            catalogList:[],//章节
            versionValue:'',//版本value
            materialValue:'',//教材value
            defaultVersion:undefined, //默认版本
            defaultMaterial:undefined,//默认教材
            defaultCatalog:'',//默认章节
            choiceCatalogId:'',//手动选择的章节id
            exerciseNameVal:window.catalogNames=='' ? '' : window.catalogNames.split(',').pop(),
            exerciseClassVal:'',//练习班级名称
            versionErrorShow:'none',
            materialErrorShow:'none',
            catalogErrorShow:'none',
            exerciseNameErrorShow:'none',
            exerciseClassErrorShow:'none'
        }
    }
    componentWillReceiveProps(nextProps){
        this.setState({
          visible: nextProps.pusblishVisible,
          publishType:nextProps.publishType,
          flag:!this.state.flag
        },()=>{
          setTimeout(()=>{
            this.setState({
              flag:!this.state.flag
            })
          })
        });
        
    }
    componentWillMount(){
      let teacherInfo=JSON.parse(localStorage.getItem("teacherInfo")),
          stageId=teacherInfo.stageId,
          subjectId=teacherInfo.subjectId, 
          now = new Date(),
          year = now.getFullYear(), //得到年份
          month = now.getMonth()+1,//得到月份
          date = now.getDate(),//得到日期
          hours = now.getHours(),//时
          minute=now.getMinutes(), //分
          second=now.getSeconds(), //秒
          publishTime=year+'-'+month+'-'+date+' '+hours+":"+minute+":"+second,
          asofTime=year+'-'+month+'-'+date+' '+'23:59',
          asofTimeStamp=new Date(asofTime).getTime();
          this.setState({
            defaultPublishTime:publishTime,
            defaultAsofTime:asofTime,
            asofDate:asofTimeStamp
          })
          //获取班级列表
          this.getClassList.bind(this)();
          //获取教材信息
          this.getMaterialListData.bind(this,stageId,subjectId,'')();
          //查询最后操作的教材id-将上一次操作的章节更新树结构上面去
          this.getLastOperation.bind(this,loginToken)();
    }
    //获取班级列表
    getClassList(){
      const resultGetClassList=getClassList(loginToken);
            resultGetClassList.then(res=>{
              return res.json()
            }).then(json=>{
                // 处理获取的数据
                const data = json
                if (data.result) {
                    this.setState({
                      classInfo:data.data.content
                    })
                }
            }).catch(ex => {
                // 发生错误
                if (__DEV__) {

                    console.error('暂无数据, ', ex.message)
                }
            })
    }
    //获取版本-教材-章节
    getMaterialListData(stageId,subjectId,extParam){
        //获取教材数据
        return new Promise((resolve,reject)=>{
            const resultTextbook = getMaterialListData(stageId,subjectId,extParam)
                resultTextbook.then(res => {
                    return res.json()
                }).then(json => {
                    // 处理获取的数据
                    const data = json
                    if (data.result) {
                        let versionInfoList=data.data;
                            versionInfoList.forEach((item,index)=>{
                                item.id=item.editionId;
                                item.name=item.edition;
                                item.textbookInfoList.forEach((ele,i)=>{
                                  ele.id=ele.textbookId;
                                  ele.name=ele.textbookName;
                                  
                              })
                            })
                            this.setState({
                                versionInfoList:versionInfoList
                            })
                    }
                }).catch(ex => {
                    // 发生错误
                    reject(ex.message)
                    if (__DEV__) {
                        console.error('暂无数据, ', ex.message)
                    }
                })
        })
    }
    //获取教材下章节信息
    getMaterialCatalogData(loginToken,textbookId,extParam){//extParam 0 初始化展示上次选择章节高亮 1 就是每次切换时的章节
            const resultTextbookCatalog = getMaterialCatalogData(loginToken,textbookId,extParam)
                resultTextbookCatalog.then(res => {
                    return res.json()
                }).then(json => {
                    // 处理获取的数据
                    const data = json
                    if (data.result) {
                        let catalogList=data.data;
                            this.setState({
                              catalogList:catalogList
                            })
                    }
                }).catch(ex => {
                    // 发生错误
                    if (__DEV__) {
                        console.error('暂无数据, ', ex.message)
                    }
                })
    }
    //发布作业
    publishHomework(loginToken,draftId,name,publishAt,abortAt,classIds,currentQuestionIds){
      const resultPublishhomework=publishHomework(loginToken,draftId,name,publishAt,abortAt,classIds,currentQuestionIds);
                 resultPublishhomework.then(res => {
                    return res.json()
                }).then(json => {
                    // 处理获取的数据
                    const data = json
                    this.setState({
                      visible: false,
                    });
                    if (data.result) {
                        //保存成功之后-跳转回作业首页列表
                        hashHistory.push('/index-homework')
                        window.location.reload()
                        //通知父组件设定为false
                        this.props.noticeHomework.bind(this,false,true)()
                        //将全局存储的题目id和章节id置空
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
    //创建练习
    saveExercise(loginToken,draftId,classIds,name,catalogIds,questionIds,choiceCatalogId,questionCount){
      const resultSaveExercise=saveExercise(loginToken,draftId,classIds,name,catalogIds,questionIds,choiceCatalogId,questionCount);
            resultSaveExercise.then(res=>{
              return res.json()
            }).then(json=>{
                // 处理获取的数据
                const data = json
                this.setState({
                  visible: false,
                });
                if (data.result) {
                    //保存成功之后-跳转回作业首页列表
                    hashHistory.push('/classroom-exercise')
                    window.location.reload()
                    //通知父组件设定为false
                    this.props.noticeHomework.bind(this,false,true)()
                    //将全局存储的题目id和章节id置空
                    window.noticeDecorateQuestionIds='';
                    window.catalogIds='';
                }else{
                    message.warning(data.error);
                    this.props.noticeHomework.bind(this,false,true)()
                }
            })
    }
    //查询最后操作的教材(教辅)和章节
    getLastOperation(loginToken){
        const resultLastOperation = getLastOperation(loginToken);
                resultLastOperation.then(res => {
                    return res.json()
                }).then(json => {
                    // 处理获取的数据
                    const data = json
                    if (data.result) {
                        let lastOperation=data.data,
                            textbookInfoList=this.state.versionInfoList.find(e=>e.id==lastOperation.textbook.lastEditionId).textbookInfoList,//当前版本下的教材
                            defaultMaterial=this.state.versionInfoList.find(e=>e.id==lastOperation.textbook.lastEditionId).textbookInfoList.find(e=>e.textbookId=lastOperation.textbook.lastTextbookId).textbookName;
                            //获取章节
                            this.getMaterialCatalogData.bind(this,loginToken,lastOperation.textbook.lastTextbookId,'')()
                            this.setState({
                              textbookInfoList:textbookInfoList,//当前版本下的教材
                              defaultVersion:lastOperation.textbook.lastEditionId,
                              defaultMaterial:defaultMaterial,
                              defaultCatalog:lastOperation.textbook.lastCatalogIds,
                              choiceCatalogId:lastOperation.textbook.lastCatalogId,
                            })
                     }   
                }).catch(ex => {
                    // 发生错误
                    if (__DEV__) {
                      console.error('暂无数据, ', ex.message)
                    }
                }) 
    }
    //查询最后操作的教材(教辅)和章节
    getLastOperation(loginToken){
        let teacherInfo=JSON.parse(localStorage.getItem("teacherInfo")),
            stageId=teacherInfo.stageId,
            subjectId=teacherInfo.subjectId;
            const resultLastOperation = getLastOperation(loginToken);
                    resultLastOperation.then(res => {
                        return res.json()
                    }).then(json => {
                        // 处理获取的数据
                        const data = json
                        if (data.result) {
                            let lastOperation=data.data,
                                lastStageId=Constants.isFormat(lastOperation.textbook,String) ? lastOperation.textbook.lastStageId : '',
                                lastSubjectId=Constants.isFormat(lastOperation.textbook,String) ? lastOperation.textbook.lastSubjectId : '',
                                lastEditionId=Constants.isFormat(lastOperation.textbook,String) ? (stageId!=lastStageId||subjectId!=lastSubjectId) ? '' : lastOperation.textbook.lastEditionId : '',
                                lastTextbookId=Constants.isFormat(lastOperation.textbook,String) ? (stageId!=lastStageId||subjectId!=lastSubjectId) ? '' : lastOperation.textbook.lastTextbookId : '',
                                lastCatalogId=Constants.isFormat(lastOperation.textbook,String) ? (stageId!=lastStageId||subjectId!=lastSubjectId) ? '' : lastOperation.textbook.lastCatalogId : '',
                                lastCatalogIds=Constants.isFormat(lastOperation.textbook,String) ? (stageId!=lastStageId||subjectId!=lastSubjectId) ? '' : lastOperation.textbook.lastCatalogIds : '',
                                textbookInfoList=lastEditionId!='' ? this.state.versionInfoList.find(e=>e.id==lastEditionId).textbookInfoList : [],//当前版本下的教材
                                defaultMaterial=lastEditionId!='' ?  this.state.versionInfoList.find(e=>e.id==lastEditionId).textbookInfoList.find(e=>e.textbookId=lastOperation.textbook.lastTextbookId).textbookName : '';
                                //获取章节
                                if(lastTextbookId!=''){
                                    this.getMaterialCatalogData.bind(this,loginToken,lastTextbookId,'')()
                                }
                                this.setState({
                                  textbookInfoList:textbookInfoList,//当前版本下的教材
                                  defaultVersion:lastEditionId!='' ? lastEditionId : undefined,
                                  defaultMaterial:defaultMaterial!='' ? defaultMaterial : undefined,
                                  defaultCatalog:lastCatalogIds,
                                  choiceCatalogId:lastCatalogId,
                                  timeStamp:(new Date()).getTime()*Math.random(),
                                  materialTimeStamp:(new Date()).getTime()*Math.random()
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
      console.log('练习中',this.state.defaultVersion)
      let isBool=true;
        //如果当前currentCatalogIds不为undefind则是保存草稿-调用弹窗-进而检查currentCatalogIds是否满足全为0无章节状态
        if(Constants.isFormat(this.props.currentCatalogIds,undefined)){
          if(Constants.isHasCatalog(this.props.currentCatalogIds)){
            isBool=false;
          }else{
            isBool=true;
          }
        }else{//如果当前currentCatalogIds为undefind则是布置-查看已选-调用弹窗-进而检查window.catalogIds里面是否有章节
          if(Constants.isHasCatalog(window.catalogIds)){
            isBool=false;
          }else{
            isBool=true;
          }
        }
        return (
          <div className='publish-modal'>
          {
            this.state.publishType==0 ? <Modal
              title="创建练习"
              visible={this.state.visible}
              cancelText="取消"
              okText="确定"
              onOk={this.exerciseHandleOk.bind(this)}
              onCancel={this.exerciseHandleCancel.bind(this)}
            >
              {

                isBool ? <div className="publish-info">
                  <span className="publish-title">版本</span>
                  <span className="editInfo">
                    <Select
                        style={{ width: '100%' }}
                        key={this.state.timeStamp}
                        placeholder="请选择版本"
                        showArrow={true}
                        defaultValue={this.state.defaultVersion}
                        onChange={this.versionSelected.bind(this)}
                      >
                        {
                          this.state.versionInfoList.map((item,index)=>{
                              return <Option key={item.id}>{item.name}</Option>
                          })
                        }
                      </Select>
                  </span>
                </div> : ''
              }
              {/*错误提示*/}
              <p className="error-text" style={{"display":this.state.versionErrorShow}}><Icon type="close-circle-o" style={{color:'rgba(247, 79, 44, 1)'}} /><span>版本不能为空</span></p>
              {
                isBool ? <div className="publish-info">
                  <span className="publish-title">教材</span>
                  <span className="editInfo">
                    <Select
                        style={{ width: '100%' }}
                        key={this.state.materialTimeStamp}
                        placeholder="请选择教材"
                        showArrow={true}
                        defaultValue={this.state.defaultMaterial}
                        onChange={this.materialSelected.bind(this)}
                      >
                        {
                          this.state.textbookInfoList.map((item,index)=>{
                              return <Option key={item.id}>{item.name}</Option>
                          })
                        }
                      </Select>
                  </span>
                </div> : ''
              }
              {/*错误提示*/}
              <p className="error-text" style={{"display":this.state.materialErrorShow}}><Icon type="close-circle-o" style={{color:'rgba(247, 79, 44, 1)'}} /><span>教材不能为空</span></p>
              {
                isBool ? <div className="publish-info">
                  <span className="publish-title">章节</span>
                  <span className="editInfo">
                    <TreeSelect flag={this.state.flag} treeData={this.state.catalogList} defaultCatalog={this.state.defaultCatalog} placeholderName='请选择章节' noticeParent={this.noticeParent.bind(this)}/>
                  </span>
                </div> : ''
              }
              {/*错误提示*/}
              <p className="error-text" style={{"display":this.state.catalogErrorShow}}><Icon type="close-circle-o" style={{color:'rgba(247, 79, 44, 1)'}} /><span>章节不能为空</span></p>
              <p className="publish-info">
                <span className="publish-title">练习名称</span>
                <span className="editInfo"><Input defaultValue={window.catalogNames=='' ? undefined : window.catalogNames.split(',').pop()} onChange={this.exerciseNameHandle.bind(this)}  placeholder="请输入2-16个字"/></span>
              </p>
              {/*错误提示*/}
              <span className="error-text" style={{"display":this.state.exerciseNameErrorShow}}><Icon type="close-circle-o" style={{color:'rgba(247, 79, 44, 1)'}} /><span>{this.state.exerciseNameError}</span></span>
              <div className="publish-info" style={{position:'relative'}}>
                <span className="publish-title">选择班级</span><span className="editInfo">
                  <Select
                    mode="multiple"
                    style={{ width: '100%' }}
                    className='selClass'
                    key={this.state.timeStamp}
                    placeholder="请选择班级"
                    showArrow={true}
                    defaultValue={this.state.defaultClass}
                    onChange={this.exerciseClassSelected.bind(this)}
                  >
                    {
                      this.state.classInfo.map((item,index)=>{
                          return <Option key={item.id}>{item.name}</Option>
                      })
                    }
                  </Select>
                  <Icon type="down" className='downSel' onClick={this.dianji.bind(this)}/>
                </span>
              </div>
              {/*错误提示*/}
              <p className="error-text" style={{"display":this.state.exerciseClassErrorShow}}><Icon type="close-circle-o" style={{color:'rgba(247, 79, 44, 1)'}} /><span>班级不能为空</span></p>
            </Modal> : <Modal
              title="发布作业"
              visible={this.state.visible}
              cancelText="取消"
              okText="确定"
              onOk={this.handleOk.bind(this)}
              onCancel={this.handleCancel.bind(this)}
            >
              <p className="publish-info">
                <span className="publish-title">作业名称</span>
                <span className="editInfo"><Input onChange={this.homeworkNameHandle.bind(this)}  placeholder="请输入2-16个字"/></span>
              </p>
              {/*错误提示*/}
              <span className="error-text" style={{"display":this.state.homeworkNameErrorShow}}><Icon type="close-circle-o" style={{color:'rgba(247, 79, 44, 1)'}} /><span>{this.state.homeworkNameError}</span></span>
              <div className="publish-info" style={{position:'relative'}}>
                <span className="publish-title">选择班级</span><span className="editInfo">
                  <Select
                    mode="multiple"
                    style={{ width: '100%' }}
                    className='selClass'
                    key={this.state.timeStamp}
                    placeholder="请选择班级"
                    showArrow={true}
                    defaultValue={this.state.defaultClass}
                    onChange={this.classSelected.bind(this)}
                  >
                    {
                      this.state.classInfo.map((item,index)=>{
                          return <Option key={item.id}>{item.name}</Option>
                      })
                    }
                  </Select>
                  <Icon type="down" className='downSel' onClick={this.dianji.bind(this)}/>
                </span>
                <Row gutter={8} style={{marginTop:'20px'}}> 
                      <Col span={5} offset={1}>
                        <span style={{color: 'rgba(45, 187, 85, 1)',fontSize: '14px',cursor:'pointer'}} onClick={this.addClassBtn.bind(this)}>+添加班级</span>
                      </Col>
                      {
                        this.state.isAddclassShow==true ? <Row>
                                                            <Col span={11} offset={0}>
                                                                <Input placeholder="请输入班级名称" onChange={this.classInput.bind(this)}/>
                                                                <span style={{color:'#f5222d',display:this.state.classPrompt ? 'block' : 'none' }}>请输入2-16个字班级名称</span>
                                                            </Col>
                                                            <Col span={6}  style={{margin:'-5px 0px 0px 10px'}}>
                                                                <p style={{float:'left',marginTop:'10px',fontSize: '14px',color:'rgba(51,51,51,1)'}}>
                                                                    <span style={{marginRight:'8px',color: 'rgba(45, 187, 85, 1)',cursor:'pointer'}} onClick={this.saveClassBtn.bind(this)}>保存</span><span style={{cursor:'pointer'}} onClick={this.cancelClassBtn.bind(this)}>取消</span>
                                                                </p>
                                                            </Col>
                                                          </Row> : ''
                      }
                  </Row>
              </div>
              {/*错误提示*/}
              <p className="error-text" style={{"display":this.state.homeworkClassErrorShow}}><Icon type="close-circle-o" style={{color:'rgba(247, 79, 44, 1)'}} /><span>班级不能为空</span></p>
              <div className="publish-info">
                <span className="publish-title">发布时间</span>
                <span className="editInfo">
                  <DatePicker locale={datalocale}  format="YYYY-MM-DD HH:mm" disabledDate={this.disabledDate.bind(this)} disabledTime={this.disabledDateTime.bind(this)} showTime={{ hideDisabledOptions: true, defaultValue:moment(this.state.defaultPublishTime, dateFormat)}} className="datepicker"  placeholder="立即发布"  onChange={this.publishDateHandle.bind(this)} />
                </span>
              </div>
              {/*错误提示*/}
              <p className="error-text" style={{"display":this.state.homeworkPublishDateErrorShow}}><Icon type="close-circle-o" style={{color:'rgba(247, 79, 44, 1)'}} /><span>发布时间不能为空</span></p>
              <div className="publish-info">
                <span className="publish-title">截止时间</span>
                <span className="editInfo">
                  <DatePicker locale={datalocale} format="YYYY-MM-DD HH:mm" disabledDate={this.disabledDate.bind(this)} disabledTime={this.disabledAsOfDateTime.bind(this)}  showTime={{ defaultValue: moment('00:00', 'HH:mm') }} className="datepicker" className="datepicker" placeholder="请输入截止时间" defaultValue={moment(this.state.defaultAsofTime, dateFormat)} onChange={this.asofDateHandle.bind(this)} />
                </span>
              </div>
              {/*错误提示*/}
              <p className="error-text" style={{"display":this.state.homeworkAsofDateErrorShow}}><Icon type="close-circle-o" style={{color:'rgba(247, 79, 44, 1)'}} /><span>截止时间不能为空</span></p>
              <p className="error-text" style={{"display":this.state.asGreaterPublishErrorShow}}><Icon type="close-circle-o" style={{color:'rgba(247, 79, 44, 1)'}} /><span>截止时间不能小于发布时间</span></p>
            </Modal>
          }
            
          </div>
        );
    }
    //发布作业
    handleOk(e){
        if(this.state.homeworkNameVal==''){
          this.setState({
            homeworkNameError:'作业名称不能为空',
            homeworkNameErrorShow:'block'
          })
          return;
        }else if(this.state.homeworkNameVal.length<2||this.state.homeworkNameVal.length>16){
          this.setState({
            homeworkNameError:'请输入2-16个字',
            homeworkNameErrorShow:'block'
          })
          return;
        }
        if(this.state.homeworkClassVal==''){
          this.setState({
            homeworkClassErrorShow:'block'
          })
          return;
        }
        if(!this.state.publishDate){
          this.setState({
            homeworkPublishDateErrorShow:'block'
          })
          return;
        }
        if(!this.state.asofDate){
          this.setState({
            homeworkAsofDateErrorShow:'block'
          })
          return;
        }
        if(this.state.asofDate<this.state.publishDate){
          this.setState({
            asGreaterPublishErrorShow:'block'
          })
          return;
        }
        //发布作业
        let draftId=this.props.draftId,//草稿id
            name=this.state.homeworkNameVal,//作业名称
            publishAt=this.state.publishDate,//发布时间
            abortAt=this.state.asofDate,//截止时间
            classIds=this.state.homeworkClassVal,//选择班级
            questionIds=!!this.props.currentQuestionIds&&this.props.currentQuestionIds!='' ? this.props.currentQuestionIds : window.noticeDecorateQuestionIds;
            this.publishHomework.bind(this,loginToken,draftId,name,publishAt,abortAt,classIds,questionIds)()
    }
    handleCancel(e){
        this.setState({
          visible: false,
        });
        //通知父组件设定为false
        this.props.noticeHomework.bind(this,false,false)()
    }
    addClassBtn(){
        this.setState({
            isAddclassShow:true,
            newProblemName:'',//重置
            classPrompt:false
        })
    }
     //添加班级-取消
    cancelClassBtn(){
        this.setState({
            isAddclassShow:false
        })
    }
    classInput(e){
        //实时监测输入框内容变化
        if(e.target.value.length>1&&e.target.value.length<17){
          this.setState({
            newProblemName:e.target.value,
            classPrompt:false
          }) 
        }else{
          this.setState({
            newProblemName:e.target.value,
            classPrompt:true
          }) 
        }
    }
    //添加班级-保存
    saveClassBtn(){
        let name=this.state.newProblemName;//新班级名字
        //如果输入框为空-提示
        if(this.state.newProblemName==''||this.state.classPrompt===true){
          this.setState({
            classPrompt:true
          }) 
          return;
        }
        this.setState({
          isAddclassShow:false
        })
        const resultAddClass = addClass(loginToken,name);
                resultAddClass.then(res => {
                    return res.json()
                }).then(json => {
                    // 处理获取的数据
                    const data = json
                    if (data.result) {
                      let classId=data.data.id;
                        //添加成功之后重新渲染一下班级列表
                          this.getClassList.bind(this)();
                          this.setState({
                              defaultClass:[...this.state.defaultClass,name],
                              homeworkClassVal:this.state.homeworkClassVal=='' ? `${classId}` : `${this.state.homeworkClassVal},${classId}`,
                              timeStamp:(new Date()).getTime(),
                              flag:!this.state.flag
                          },()=>{
                            console.log('defaultClass',this.state.homeworkClassVal)
                          })
                    }    
                }).catch(ex => {
                    // 发生错误
                    if (__DEV__) {
                        console.error('暂无数据, ', ex.message)
                    }
                })

    } 
    //作业名称
    homeworkNameHandle(e){
      this.setState({
        homeworkNameVal:e.target.value
      })
      if(e.target.value.length>1&&e.target.value.length<17){
        this.setState({
            homeworkNameErrorShow:'none'
          })
      }
    }
    //选择班级
    classSelected(value){
      this.setState({
        homeworkClassVal:value.toString()
      })
      if(value.toString()!==''){
        this.setState({
          homeworkClassErrorShow:'none',
        })
      }
      
    }
    //选择发布时间
    publishDateHandle(date, dateString){
      let publishDateStamp=new Date(dateString).getTime();
         this.setState({
                publishDate:publishDateStamp,
                homeworkPublishDateErrorShow:'none',
                publishMaskShow:false
              },()=>{
                if(this.state.asofDate>publishDateStamp){
                    this.setState({
                      asGreaterPublishErrorShow:'none'
                    })
                }
              })
      }    
    //选择截止时间
    asofDateHandle(date, dateString){
      let asofDateStamp=new Date(dateString).getTime();
          this.setState({
            asofDate:asofDateStamp,
            homeworkAsofDateErrorShow:'none'
          },()=>{
            if(asofDateStamp>this.state.publishDate){
              this.setState({
                asGreaterPublishErrorShow:'none'
              })
            }
          })
          
    }
    range(start, end) {
      const result = [];
      for (let i = start; i < end; i++) {
        result.push(i);
      }
      return result;
    }

    disabledDate(current) {
      return current && current < moment().startOf('day');
    }

    disabledDateTime() {
      let now = new Date(),
           year = now.getFullYear(), //得到年份
           month = now.getMonth()+1,//得到月份
           day = now.getDate(),//得到日期
           hours = now.getHours(),//时
           minute=now.getMinutes(), //分
           second=now.getSeconds(), //秒
           nowTime=year+'-'+month+'-'+day+' '+"23:59",
           nowStamp=new Date(nowTime).getTime();
            return {
              disabledHours: () => this.state.publishDate>nowStamp ? this.range(0, 24).splice(0, 0) : this.range(0, 24).splice(0, hours),
              disabledMinutes: () => this.range(30, 60).splice(0, 0),
              disabledSeconds: () => this.range(30, 60).splice(0, 0),
            };
    }
    disabledAsOfDateTime() {
      let now = new Date(),
           year = now.getFullYear(), //得到年份
           month = now.getMonth()+1,//得到月份
           day = now.getDate(),//得到日期
           hours = now.getHours(),//时
           minute=now.getMinutes(), //分
           second=now.getSeconds(), //秒
           nowTime=year+'-'+month+'-'+day+' '+"23:59",
           nowStamp=new Date(nowTime).getTime();
            return {
              disabledHours: () => this.state.asofDate>nowStamp ? this.range(0, 24).splice(0, 0) : this.range(0, 24).splice(0, hours),
              disabledMinutes: () => this.range(30, 60).splice(0, 0),
              disabledSeconds: () => this.range(30, 60).splice(0, 0),
            };
    }
    dianji(){
      $('.selClass').trigger('click')
    }
    //选择版本
    versionSelected(value){
      let textbookInfoList=this.state.versionInfoList.find(e=>e.editionId==value).textbookInfoList;//当前版本下的教材
        this.setState({
          versionValue:value.toString(),
          textbookInfoList:textbookInfoList,
          defaultMaterial:[],
          defaultCatalog:'',
          choiceCatalogId:'',
          materialTimeStamp:(new Date()).getTime(),
          versionErrorShow:'none',
          flag:!this.state.flag
        })
      
    }
    //教材选择
    materialSelected(value){
      this.getMaterialCatalogData.bind(this,loginToken,value,'')()
      this.setState({
        materialValue:value.toString(),
        materialErrorShow:'none',
        defaultCatalog:'',
        choiceCatalogId:'',
        flag:!this.state.flag
      })
    }
    //章节选择
    noticeParent(value){
      this.setState({
        choiceCatalogId:value,
        catalogErrorShow:'none'
      })
    }
    //发布练习
    exerciseHandleOk(){
      if(Constants.isFormat(this.props.currentCatalogIds,undefined) ? this.props.currentCatalogIds==''&&window.catalogIds=='' : window.catalogIds==''){
        //版本不能为空
        if(this.state.versionValue==''){
            this.setState({
              versionErrorShow:'block'
            })
          return;
        }
        //教材不能为空
        if(this.state.materialValue==''){
            this.setState({
              materialErrorShow:'block'
            })
          return;
        }
        //章节不能为空
        if(this.state.choiceCatalogId==''){
            this.setState({
              catalogErrorShow:'block'
            })
          return;
        }
      }
      //练习名称不能为空
      if(this.state.exerciseNameVal==''){
          this.setState({
            exerciseNameError:'练习名称不能为空',
            exerciseNameErrorShow:'block'
          })
        return;
      }else if(this.state.exerciseNameVal.length<2||this.state.exerciseNameVal.length>16){
        this.setState({
          exerciseNameError:'请输入2-16个字',
          exerciseNameErrorShow:'block'
        })
        return;
      }
      //练习班级不能为空
      if(this.state.exerciseClassVal==''){
        this.setState({
          exerciseClassErrorShow:'block'
        })
        return;
      }
      let draftId=this.props.draftId,//草稿id
          classIds=this.state.exerciseClassVal,//选择班级 
          name=this.state.exerciseNameVal,//练习名称
          questionIds=!!this.props.currentQuestionIds&&this.props.currentQuestionIds!='' ? this.props.currentQuestionIds : window.noticeDecorateQuestionIds,
          catalogIds=!!this.props.currentCatalogIds&&this.props.currentCatalogIds!='' ? this.props.currentCatalogIds : window.catalogIds,
          choiceCatalogId=questionIds=='' ? '' : this.state.choiceCatalogId,
          questionCount=questionIds=='' ? 0 : questionIds.split(',').length;
          this.saveExercise.bind(this,loginToken,draftId,classIds,name,catalogIds,questionIds,choiceCatalogId,questionCount)()
    }
    exerciseHandleCancel(){
        this.setState({
          visible: false,
        });
        //通知父组件设定为false
        this.props.noticeHomework.bind(this,false,false)()
    }
    //练习名称
    exerciseNameHandle(e){
      this.setState({
        exerciseNameVal:e.target.value
      })
      if(e.target.value.length>1&&e.target.value.length<17){
        this.setState({
            exerciseNameErrorShow:'none'
          })
      }
    }
    //练习选择班级
    exerciseClassSelected(value){
      this.setState({
        exerciseClassVal:value.toString()
      })
      if(value.toString()!==''){
        this.setState({
          exerciseClassErrorShow:'none',
        })
      }
      
    }
}

export default PublishModal