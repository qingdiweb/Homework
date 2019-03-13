import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import { Link, hashHistory } from 'react-router'
import { Modal, message , Button , Input , Select ,DatePicker , Icon , Row , Col} from 'antd';
import { getMaterialListData,getMaterialCatalogData,saveExercise,getLastOperation,updateExercise} from '../../fetch/decorate-homework/decorate-homework';
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
class ExercisePublishModal extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
        this.state={
            visible: false,
            classInfo:[],
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
            defaultVersion:'', //默认版本
            defaultMaterial:'',//默认教材
            defaultCatalog:'',//默认章节
            choiceCatalogId:'',//手动选择的章节id
            exerciseNameVal:'',
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
          choiceCatalogId:nextProps.choiceData=='' ? '' : nextProps.choiceData.charAt(nextProps.choiceData.length-1),
        });
        //查询最后操作的教材id-将上一次操作的章节更新树结构上面去
        if(nextProps.choiceData!=''){
          let lastOperation=nextProps.choiceData.split(','),
              textbookInfoList=this.state.versionInfoList.find(e=>e.id==lastOperation[0]).textbookInfoList,//当前版本下的教材
              defaultMaterial=this.state.versionInfoList.find(e=>e.id==lastOperation[0]).textbookInfoList.find(e=>e.textbookId=lastOperation[1]).textbookName;
              //获取章节
              this.getMaterialCatalogData.bind(this,loginToken,lastOperation[1],'')()
              this.setState({
                textbookInfoList:textbookInfoList,//当前版本下的教材
                defaultVersion:lastOperation[0],
                defaultMaterial:defaultMaterial,
                defaultCatalog:nextProps.choiceCatalogIds,
                choiceCatalogId:nextProps.choiceCatalogIds=='' ? '' : nextProps.choiceCatalogIds.split(',').pop().toString()
              })
        }
    }
    componentWillMount(){
      let teacherInfo=JSON.parse(localStorage.getItem("teacherInfo")),
          stageId=teacherInfo.stageId,
          subjectId=teacherInfo.subjectId;
          //获取班级列表
          this.getClassList.bind(this)();
          //获取教材信息
          this.getMaterialListData.bind(this,stageId,subjectId,'')();
          //查询最后操作的教材id-将上一次操作的章节更新树结构上面去
          //this.getLastOperation.bind(this,loginToken)();
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
                              catalogList:catalogList,
                              flag:!this.state.flag
                            })
                    }
                }).catch(ex => {
                    // 发生错误
                    if (__DEV__) {
                        console.error('暂无数据, ', ex.message)
                    }
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
                    hashHistory.push('/exercise-detail'+'/'+this.props.exerciseId)
                    window.location.reload()
                    //将全局存储的题目id和章节id置空
                    window.noticeDecorateQuestionIds='';
                    window.catalogIds='';
                }else{
                    message.warning(data.error);
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
          <div className='exercise-modal'>
            <Modal
              title="创建练习"
              visible={this.state.visible}
              cancelText="取消"
              okText="确定"
              onOk={this.exerciseHandleOk.bind(this)}
              onCancel={this.exerciseHandleCancel.bind(this)}
            >
              <div className="exercise-info">
                  <span className="exercise-title">版本</span>
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
                </div>
              {/*错误提示*/}
              <p className="error-text" style={{"display":this.state.versionErrorShow}}><Icon type="close-circle-o" style={{color:'rgba(247, 79, 44, 1)'}} /><span>版本不能为空</span></p>
              <div className="exercise-info">
                  <span className="exercise-title">教材</span>
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
              </div> 
              {/*错误提示*/}
              <p className="error-text" style={{"display":this.state.materialErrorShow}}><Icon type="close-circle-o" style={{color:'rgba(247, 79, 44, 1)'}} /><span>教材不能为空</span></p>
              <div className="exercise-info">
                  <span className="exercise-title">章节</span>
                  <span className="editInfo">
                    <TreeSelect flag={this.state.flag} treeData={this.state.catalogList} defaultCatalog={this.state.defaultCatalog} placeholderName='请选择章节' noticeParent={this.noticeParent.bind(this)}/>
                  </span>
                </div>
              {/*错误提示*/}
              {/*<p className="error-text" style={{"display":this.state.catalogErrorShow}}><Icon type="close-circle-o" style={{color:'rgba(247, 79, 44, 1)'}} /><span>章节不能为空</span></p>
              <p className="publish-info">
                <span className="publish-title">练习名称</span>
                <span className="editInfo"><Input onChange={this.exerciseNameHandle.bind(this)}  placeholder="请输入2-16个字"/></span>
              </p>
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
                </span>
              </div>
              <p className="error-text" style={{"display":this.state.exerciseClassErrorShow}}><Icon type="close-circle-o" style={{color:'rgba(247, 79, 44, 1)'}} /><span>班级不能为空</span></p>*/}
            </Modal>
          </div>
        );
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
   /*   //练习名称不能为空
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
      }*/

      let quizId=this.props.exerciseId,//测验id
          questionIds=window.noticeDecorateQuestionIds,
          catalogIds=window.catalogIds,
          choiceCatalogId=this.state.choiceCatalogId,
          questionCount=questionIds=='' ? 0 : questionIds.split(',').length;
          this.updateExercise.bind(this,loginToken,quizId,catalogIds,questionIds,choiceCatalogId,questionCount)()
    }
    exerciseHandleCancel(){
        this.setState({
          visible: false,
        });
        //通知父组件设定为false
        this.props.noticeExerciseSel.bind(this,false)()
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

export default ExercisePublishModal