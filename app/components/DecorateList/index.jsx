import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import { Link, hashHistory } from 'react-router'
import { fromJS } from 'immutable';
import { DraggableArea, DraggableAreasGroup} from 'react-draggable-tags';
import { Radio , Checkbox , Select , Icon , Input , Modal , Row , Col,Spin,message} from 'antd';
import { getTopicListData ,delectCollectQuestion, getDefaultQuestionList , collectSearchList , addorcancelCollect , addProblem,getProjectList,getRecommendList,findQuestion,saveDefault,updateExercise} from '../../fetch/decorate-homework/decorate-homework'
import { getCollectTopic} from '../../fetch/homework-collect/homework-collect'
import Pagination from '../../Components/Pagination';
import DelModal from '../../Components/DelModal';
import * as Constants from '../../Constants/store'
import './style.less'

const noCollectImg=require("../../static/img/default-sel.png");
const collectImg=require("../../static/img/collect-sel.png");
const Option = Select.Option;
const loginToken=localStorage.getItem("loginToken");
class DecorateList extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
        this.state={
            topicList:[],//题目列表
            topicListLen:'',//数据条数
            flag:false,
            isCheck:'block',//判断列表什么时候显示可选题目按钮
            isShowDelModal:false,//是否显示删除弹窗
            draftSelNum:"",//查看已选-里面的题数
            draftSelData:{//查看已选-通知父组件的数据
                objectiveNum:0,
                subjectiveNum:0
            },
            collectVisible:false,//是否显示收藏弹窗
            isAddcollectShow:false,//是否显示添加习题集输入框
            collectProblemData:'',//选择的习题集
            defaultCollectProblemData:[],//默认此题目下的习题集
            collectList:[],//收藏习题集列表
            newProblemName:'',//添加新习题集名字
            collectQustionId:'',//收藏习题集列表所需题目id
            loadingShow:'block',//加载图标
            topicId:'',//题目id
            parentType:1,
            dragKey:0,
            timeStamp:'',
            cancelCollectVisible:false,
            currentPage:1,
            extParam:0,//扩展参数-用来防止连续调取接口，上一个接口返回慢导致数据不准确问题
            recordId:'',//记录当前拖拽的id
            recordIndex:''//记录当前拖拽的id下标
        }

    }
    //当组件接收到新的 props 时，会触发该函数。在改函数中，通常可以调用 this.setState 方法来完成对 state 的修改。
    componentWillReceiveProps(nextProps){
        if(this.props.parentType==0){//布置作业调用
            let filterData=this.props.filterData,//从父组件获取的参数对象集合
                catalogId=!!filterData.catalogId ? filterData.catalogId : '',//章节id
                coachbookCatalogId=!!filterData.coachbookCatalogId ? filterData.coachbookCatalogId : '',//教辅id
                knowledgeId=!!filterData.knowledgeId ? filterData.knowledgeId : '',//知识点id
                collectId=!!filterData.collectId ? filterData.collectId : '',//收藏id
                paperId=!!filterData.paperId ? filterData.paperId : '',//试卷id
                tagId=!!filterData.specialId ? filterData.specialId : '',//专题id
                categoryId=!!filterData.categoryId ? filterData.categoryId : '',//题型id
                degree=!!filterData.degree ? filterData.degree : '',//难度id
                keyword=!!filterData.keyword ? filterData.keyword : '',//关键字
                draftId=!!this.props.draftId ? this.props.draftId : '',//草稿id
                extParam=this.state.extParam+1,
                rememberFlag=0,
                pageNumber=0,//第一页
                pageSize=5,//一页数据数
                totalSize=0;
                if(nextProps.flag!=this.props.flag){
                    this.setState({
                        loadingShow:filterData.loadingShow,
                        currentPage:1,//每次刷新数据页数默认第一页
                        extParam:this.state.extParam+1
                    })
                    console.log('totalSize',totalSize)
                    this.getTopiclistData.bind(this,loginToken,catalogId,coachbookCatalogId,knowledgeId,collectId,paperId,tagId,categoryId,degree,keyword,draftId,extParam,rememberFlag,pageNumber,pageSize,totalSize)();
                }
        }else if(this.props.parentType==1){//查看已选调用
            let draftId=!!this.props.draftId ? this.props.draftId : '',//从父组件获取的参数对象集合
                pageNumber=0,//第一页
                pageSize=5;//一页数据数
                if(nextProps.flag!=this.props.flag){
                    this.getDefaultQuestionList.bind(this,loginToken,window.noticeDecorateQuestionIds)();
                    this.setState({
                        currentPage:1//每次刷新数据页数默认第一页
                    })
                }
                //拖拽右侧预览框里面的题顺序，通知子组件题目列表同时改变顺序
                if(nextProps.noticeTopicNumData.length!=0){
                    this.setState({
                        topicList:nextProps.noticeTopicNumData
                    })
                    //给拖拽题目列表key标识-渲染刷新
                    if(this.state.dragKey==0){
                        this.state.dragKey=1;
                    }else{
                        this.state.dragKey=0;
                    }
                }

        }else if(this.props.parentType==2){//习题集调用
            let collectId=!!this.props.collectId ? this.props.collectId : '',
                degree=this.props.fileData.degreeValue,
                categoryId=this.props.fileData.categoryValue,
                keyword=this.props.fileData.keywordValue,
                pageNumber=0,//第一页
                pageSize=5;//一页数据数
                if(nextProps.flag!=this.props.flag){
                    this.getCollectTopic.bind(this,loginToken,collectId,degree,categoryId,keyword,pageNumber,pageSize)();
                    this.setState({
                        currentPage:1//每次刷新数据页数默认第一页
                    })
                }
        }/*else if(this.props.parentType==3){//专题列表调用
            if(nextProps.flag!=this.props.flag){
                //通知是否应该全选
                console.log('通知专题')
                this.noticeIsAllCheck.bind(this)()
            }

        }*/
    }
    componentDidMount(){
        if(this.props.parentType==3){
            //通知是否应该全选
            this.noticeIsAllCheck.bind(this)()
        }
    }
    componentDidUpdate(){
        console.log('更新完成')
    }
    //获取题目数据
    getTopiclistData(loginToken,catalogId,coachbookCatalogId,knowledgeId,collectId,paperId,tagId,categoryId,degree,keyword,draftId,extParam,rememberFlag,pageNumber,pageSize,totalSize){
        this.setState({
            loadingShow:'block',
            topicList:[]
        })
        const resultTextbook = getTopicListData(loginToken,catalogId,coachbookCatalogId,knowledgeId,collectId,paperId,tagId,categoryId,degree,keyword,draftId,extParam,rememberFlag,pageNumber,pageSize,totalSize);
                resultTextbook.then(res => {
                    return res.json()
                }).then(json => {
                    // 处理获取的数据
                    const data = json
                    if (data.result) {
                        let topicListData=data.data.content;
                        for (var i = 0; i < topicListData.length; i++) {
                            if(typeof(topicListData[i].options)=='string'&&topicListData[i].options.indexOf('[')>-1){
                               topicListData[i].options=JSON.parse(topicListData[i].options);
                            }else if(topicListData[i].options==null||topicListData[i].options==''){
                                topicListData[i].options=[];
                            }
                            topicListData[i].knowledges=topicListData[i].knowledges==null||topicListData[i].knowledges==''  ? [] : topicListData[i].knowledges.split(',');//处理考点
                            topicListData[i].isShow='none';//初始化不显示解析
                            //给题目列表添加序列号
                            topicListData[i].topicIndex=pageNumber*5+i+1;
                        }
                        //extParam-只有返回和字段和传入的参数一致才渲染数据
                        if(this.state.extParam==parseInt(data.extParam)){
                            this.setState({
                                topicList:topicListData,
                                isCheck:'block',
                                loadingShow:'none'
                            },()=>{
                                window.MathJax.Hub.Queue(["Typeset",window.MathJax.Hub,"output"]);
                            });
                        }
                        //只有筛选时重新刷新记录总页数，分页是不记录
                        if(totalSize==0){
                            this.setState({
                                topicListLen:data.data.pageable.totalSize/5
                            });
                        }
                    }
                }).catch(ex => {
                    // 发生错误
                    if (__DEV__) {
                        console.error('暂无数据, ', ex.message)
                    }
                })
    }
    //查看已选-获取题目数据
    getDefaultQuestionList(loginToken,questionIds){
        this.setState({
            loadingShow:'block',
            topicList:[],
            topicListLen:0
        })
        const resultFindQuestion = findQuestion(loginToken,questionIds);
                resultFindQuestion.then(res => {
                    return res.json()
                }).then(json => {
                    // 处理获取的数据
                    const data = json
                    if (data.result) {
                        let topicListData=data.data,
                            objectiveNum=0,
                            subjectiveNum=0,
                            isSelected=this.props.isSelected;//判断是哪来到查看已选的 2 是草稿来的
                            //如果是作业草稿来的-查询完题目之后就清空全局变量以免造成选题误差
                          /*  if(isSelected==2){
                                window.noticeDecorateQuestionIds='';
                                window.catalogIds='';
                            }*/
                            topicListData=Constants.dealQuestion(topicListData,'');
                            for (var i = 0; i < topicListData.length; i++) {
                                //给题目列表添加序列号
                                topicListData[i].topicIndex=i+1;
                                //查出客观题和主观题的数量
                                if(topicListData[i].canAnswer==1){
                                    objectiveNum+=1;
                                }else{
                                    subjectiveNum+=1;
                                }
                            }
                            this.setState({
                                topicList:topicListData,
                                draftSelNum:topicListData.length,
                                topicListLen:0,
                                isCheck:'none',
                                loadingShow:'none',//隐藏图标
                                object:this.state.draftSelData.objectiveNum=objectiveNum,//暂存一下-给拖拽用
                                object:this.state.draftSelData.subjectiveNum=subjectiveNum//暂存一下-给拖拽用
                            },()=>{
                                window.MathJax.Hub.Queue(["Typeset",window.MathJax.Hub,"output"]);
                            });
                            //通知查看已选父组件-有多少道题目是否为空
                            this.props.noticeTopicNum.bind(this,topicListData,topicListData.length,objectiveNum,subjectiveNum)()
                    }
                }).catch(ex => {
                    // 发生错误
                    if (__DEV__) {
                        console.error('暂无数据, ', ex.message)
                    }
                })
    }
    //习题集调用题目
    getCollectTopic(loginToken,collectId,degree,categoryId,keyword,pageNumber,pageSize){
        this.setState({
            loadingShow:'block',
            topicList:[],
            topicListLen:0
        })
        const resultCollect = getCollectTopic(loginToken,collectId,degree,categoryId,keyword,pageNumber,pageSize);
                resultCollect.then(res => {
                    return res.json()
                }).then(json => {
                    // 处理获取的数据
                    const data = json
                    if (data.result) {
                        let topicListData=data.data.content;
                        for (var i = 0; i < topicListData.length; i++) {
                            if(typeof(topicListData[i].options)=='string'&&topicListData[i].options.indexOf('[')>-1){
                               topicListData[i].options=JSON.parse(topicListData[i].options);
                            }else if(topicListData[i].options==null||topicListData[i].options==''){
                                topicListData[i].options=[];
                            }
                            topicListData[i].knowledges=topicListData[i].knowledges==null||topicListData[i].knowledges==''  ? [] : topicListData[i].knowledges.split(',');//处理考点
                            topicListData[i].isShow='none';//初始化不显示解析
                            //给题目列表添加序列号
                            topicListData[i].topicIndex=pageNumber*5+i+1;
                        }
                        this.setState({
                            topicList:topicListData,
                            topicListLen:data.data.pageable.totalSize/5,
                            isCheck:'none',
                            loadingShow:'none'
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
    //获取专题列表
    getProjectList(loginToken,catalogId,tagType,pageNumber,pageSize){
        this.setState({
            loadingShow:'block'
        })
        const resultTextbook = getProjectList(loginToken,catalogId,tagType,pageNumber,pageSize);
                resultTextbook.then(res => {
                    return res.json()
                }).then(json => {
                    // 处理获取的数据
                    const data = json
                    if (data.result) {
                        let topicListData=data.data.content;
                            topicListData=Constants.dealQuestion(topicListData,'');
                            for (var i = 0; i < topicListData.length; i++) {
                                //给题目列表添加序列号
                                topicListData[i].topicIndex=pageNumber*5+i+1;
                            }
                            this.setState({
                                topicList:topicListData,
                                loadingShow:'none'
                            },()=>{
                                this.noticeIsAllCheck.bind(this)();
                                window.MathJax.Hub.Queue(["Typeset",window.MathJax.Hub,"output"]);
                            })
                    }
                }).catch(ex => {
                    // 发生错误
                    if (__DEV__) {
                        console.error('暂无数据, ', ex.message)
                    }
                })
    }
    //获取推荐列表
    getRecommendList(loginToken,catalogId,excludeIds,pageNumber,pageSize){
        this.setState({
            loadingShow:'block'
        })
        const resultTextbook = getRecommendList(loginToken,catalogId,excludeIds,pageNumber,pageSize);
                resultTextbook.then(res => {
                    return res.json()
                }).then(json => {
                    // 处理获取的数据
                    const data = json
                    if (data.result) {
                        let topicListData=data.data.content;
                            topicListData=Constants.dealQuestion(topicListData,'');
                            for (var i = 0; i < topicListData.length; i++) {
                                //给题目列表添加序列号
                                topicListData[i].topicIndex=pageNumber*5+i+1;
                            }
                            this.setState({
                                topicList:topicListData,
                                loadingShow:'none'
                            },()=>{
                                this.noticeIsAllCheck.bind(this)();
                                window.MathJax.Hub.Queue(["Typeset",window.MathJax.Hub,"output"]);
                            })
                    }
                }).catch(ex => {
                    // 发生错误
                    if (__DEV__) {
                        console.error('暂无数据, ', ex.message)
                    }
                })
    }
    //更新题目
    updateDefault(loginToken,draftId,currentQuestionIds,currentCatalogIds,questionCount){
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
                          //hashHistory.push('/no-publish-homework');
                          //window.location.reload()
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

                }else{
                    message.warning(data.error);
                }
            })
    }
    render() {
        console.log('render题目列表',this.state.topicList)
        let topicList=this.state.topicList;
        //debugger
        return (
            <div id="decorate-list" className="clear-fix">
                <Spin size="large" style={{"fontSize":"30px","display":this.state.loadingShow,'margin':'250px auto'}}/>
                {
                    topicList.length>0&&this.state.loadingShow=='none' ? <div>
                    {
                        /*查看已调用题目列表-拖拽*/
                       this.props.parentType==1 ? <DraggableArea
                                                        isList
                                                        initialTags={topicList}
                                                        key={this.state.dragKey}
                                                        render={({tag}) => {
                                                            let degreeData="",//难度展示
                                                            degreeTxt=tag.degree/20,
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

                                                            //根据不同跳转入口来定义展示什么视图
                                                            if(this.props.parentType==0||this.props.parentType==3){
                                                                showSec=<Checkbox  style={{'display':this.state.isCheck}} checked={this.props.noticeDecorateQuestionIds.match(item.id) ? true : false} dataId={tag.id} dataIndex={index} onChange={this.onChange.bind(this)}></Checkbox>
                                                            }else if(this.props.parentType==1){
                                                                showSec=<div style={{ fontSize:14,color:'#555',lineHeight:'42px',cursor:'pointer','display':this.state.isCheck=='block' ? 'none' : 'block'}} data-id={tag.id} onClick={this.delTopic.bind(this)}><Icon type="delete"style={{ fontSize: 16,marginRight:8,color:'#555','display':'inline-block'}}/>删除</div>
                                                            }else if(this.props.parentType==2){
                                                                showSec=''
                                                            }
                                                          return(<div key={tag.id} className="topic-sec topic-sec-drag" style={{background:this.props.stopHighlight=='false'&&this.props.highlight==tag.topicIndex-1 ? 'rgba(45, 187, 85, 0.15)' : ''}} data-highlight={tag.topicIndex-1} data-id={tag.id} onMouseDown={this.handleStart.bind(this)}>
                                                                    <div className="topic-sec-cont">
                                                                        <div className="option-cont">
                                                                            <h1 className='cont-title'><span>{tag.topicIndex}、</span><span className="topic-type">({tag.category})</span><span dangerouslySetInnerHTML={{ __html: tag.title }}></span></h1>
                                                                            <div>
                                                                                {
                                                                                    (tag.type==0||tag.type==1)&&tag.options.length>0 ? tag.options.map((ele,i)=>{
                                                                                        return <p key={i}><span className="option">{optionsNub[i]}</span><span className="option-text" dangerouslySetInnerHTML={{ __html: ele }}></span></p>
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
                                                                                    tag.knowledges.length>0 ? <p>
                                                                                        <span className="title">考点</span>
                                                                                        {
                                                                                            tag.knowledges.map((ele,i)=>{
                                                                                                return <span className="exam-site" key={i}>{ele}</span>
                                                                                            })
                                                                                        }
                                                                                    </p> : ''
                                                                                }
                                                                             </div>

                                                                        </div>
                                                                        <h1 className="topic-sec-head">
                                                                            <p className="show-parse" data-check={tag.topicIndex-1} data-showType={tag.isShow} onClick={this.showParse.bind(this)}>
                                                                                {
                                                                                    tag.isShow=='none' ? <Icon type="eye-o" style={{width:'16px',marginRight:'8px',color: '#CECECE' }} /> : <Icon type="eye" style={{width:'16px',marginRight:'8px',color: '#2dbb55' }} />
                                                                                }
                                                                                显示解析
                                                                            </p>
                                                                            <p className="collect" data-id={tag.id} data-collected={tag.whetherCollected} onClick={this.collectHandle.bind(this)}><img src={tag.whetherCollected==true ?  collectImg : noCollectImg} alt="" />{tag.whetherCollected==true ?  '已收藏' : '收藏'}</p>
                                                                            <p className="sel-btn">
                                                                                {showSec}
                                                                            </p>
                                                                        </h1>
                                                                         <div className="parse-cont" style={{'display':tag.isShow}} data-flagValue={this.state.flag}>
                                                                            {
                                                                                tag.answerDetail!=''&&tag.answerDetail!=null ? <p><span className="title">答案</span><span className="text" dangerouslySetInnerHTML={{ __html: tag.answerDetail}}></span></p> : ''
                                                                            }
                                                                            {
                                                                                tag.answerParsing!=''&&tag.answerParsing!=null ? <p><span className="title">解析</span><span className="text" dangerouslySetInnerHTML={{ __html: tag.answerParsing}}></span></p> : ''
                                                                            }
                                                                            {
                                                                                /*tag.source!=''&&tag.source!=null ? <p><span className="title">题源</span><span className="text" dangerouslySetInnerHTML={{ __html: tag.source}}></span></p> : ''*/
                                                                            }
                                                                            {
                                                                                degreeData!=''&&degreeData!=null ? <p>
                                                                                    <span className="title">难度</span>
                                                                                    <span className="degree">{degreeData}</span>
                                                                                </p> : ''
                                                                            }
                                                                            {
                                                                                tag.knowledges.length!=0 ? <p>
                                                                                <span className="title ">考点</span>
                                                                                    {
                                                                                        tag.knowledges.map((ele,i)=>{
                                                                                            return <span className="exam-site" key={i}>{ele}</span>
                                                                                        })
                                                                                    }
                                                                                </p> : ''
                                                                            }

                                                                        </div>
                                                                    </div>
                                                            </div>
                                                      )}}
                                                      onChange={(tags) => {
                                                            let currentQuestionIds='';
                                                            tags.map((tag,tagIndex)=>{
                                                                tag.topicIndex=tagIndex+1;
                                                                currentQuestionIds+=tag.id+',';
                                                            })
                                                            this.setState({
                                                                topicList:tags,
                                                            },()=>{
                                                                 this.props.noticeTopicNum.bind(this,tags,tags.length,this.state.draftSelData.objectiveNum,this.state.draftSelData.subjectiveNum)()
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
                                                        }
                                                    }
                                                    /> : topicList.map((item,index)=>{
                                                            let degreeData="",//难度展示
                                                                degreeTxt=item.degree/20,
                                                                showSec="",
                                                                optionsNub=['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
                                                                if (0<degreeTxt && degreeTxt<=1)
                                                                {
                                                                    degreeData ='容易';
                                                                }
                                                                else if (1<degreeTxt && degreeTxt<=2)
                                                                {
                                                                    degreeData ='较容易';
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
                                                                //根据不同跳转入口来定义展示什么视图
                                                                if(this.props.parentType==0||this.props.parentType==3){
                                                                    showSec=<Checkbox  style={{'display':this.state.isCheck}} checked={this.props.noticeDecorateQuestionIds.match(item.id) ? true : false} dataId={item.id} dataIndex={index} onChange={this.onChange.bind(this)}></Checkbox>
                                                                }else if(this.props.parentType==1){
                                                                    showSec=<div style={{ fontSize:14,color:'#555',lineHeight:'42px',cursor:'pointer','display':this.state.isCheck=='block' ? 'none' : 'block'}} data-id={tag.id} onClick={this.delTopic.bind(this)}><Icon type="delete"style={{ fontSize: 16,marginRight:8,color:'#555','display':'inline-block'}}/>删除</div>
                                                                }else if(this.props.parentType==2){
                                                                    showSec=''
                                                                }
                                                            return  <div key={index} className="topic-sec" >
                                                                        <div className="topic-sec-cont">
                                                                            <div className="option-cont">
                                                                                <h1 className='cont-title'><span>{item.topicIndex}、</span><span className="topic-type">({item.category})</span><span dangerouslySetInnerHTML={{ __html: item.title}}></span></h1>
                                                                                <div>
                                                                                    {
                                                                                        (item.type==0||item.type==1)&&item.options.length>0 ? item.options.map((ele,i)=>{
                                                                                            return <p key={i}><span className="option">{optionsNub[i]}</span><span className="option-text" dangerouslySetInnerHTML={{ __html: ele }}></span></p>
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
                                                                                        item.knowledges.length>0 ? <p>
                                                                                            <span className="title">考点</span>
                                                                                            {
                                                                                                item.knowledges.map((ele,i)=>{
                                                                                                    return <span className="exam-site" key={i}>{ele}</span>
                                                                                                })
                                                                                            }
                                                                                        </p> : ''
                                                                                    }
                                                                                </div>

                                                                            </div>
                                                                            <h1 className="topic-sec-head">
                                                                                <p className="show-parse" data-check={index} data-showType={item.isShow} onClick={this.showParse.bind(this)}>
                                                                                    {
                                                                                        item.isShow=='none' ? <Icon type="eye-o" style={{width:'16px',marginRight:'8px',color: '#CECECE' }} /> : <Icon type="eye" style={{width:'16px',marginRight:'8px',color: '#2dbb55' }} />
                                                                                    }
                                                                                    显示解析
                                                                                </p>
                                                                                <p className="collect" data-id={item.id} data-collected={item.whetherCollected} onClick={this.collectHandle.bind(this)}><img src={item.whetherCollected==true ?  collectImg : noCollectImg} alt="" />{item.whetherCollected==true ?  '已收藏' : '收藏'}</p>
                                                                                <p className="sel-btn">
                                                                                    {showSec}
                                                                                </p>
                                                                            </h1>
                                                                             <div className="parse-cont" style={{'display':item.isShow}} data-flagValue={this.state.flag}>
                                                                                {
                                                                                    item.answerDetail!=''&&item.answerDetail!=null ? <p><span className="title">答案</span><span className="text" dangerouslySetInnerHTML={{ __html: item.answerDetail}}></span></p> : ''
                                                                                }
                                                                                {
                                                                                    item.answerParsing!=''&&item.answerParsing!=null ? <p><span className="title">解析</span><span className="text" dangerouslySetInnerHTML={{ __html: item.answerParsing}}></span></p> : ''
                                                                                }
                                                                                {
                                                                                    /*item.source!=''&&item.source!=null ? <p><span className="title">题源</span><span className="text" dangerouslySetInnerHTML={{ __html: item.source}}></span></p> : ''*/
                                                                                }
                                                                                {
                                                                                    degreeData!=''&&degreeData!=null ? <p>
                                                                                        <span className="title">难度</span>
                                                                                        <span className="degree">{degreeData}</span>
                                                                                    </p> : ''
                                                                                }
                                                                                {
                                                                                    item.knowledges.length!=0 ? <p>
                                                                                    <span className="title ">考点</span>
                                                                                        {
                                                                                            item.knowledges.map((ele,i)=>{
                                                                                                return <span className="exam-site" key={i}>{ele}</span>
                                                                                            })
                                                                                        }
                                                                                    </p> : ''
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                            })
                    }
                    </div>
                    : <div style={{'fontSize':'16px','textAlign':'center','margin':'300px auto',"display":this.state.loadingShow=='block' ? 'none' : 'block'}}><Icon type="exclamation-circle" style={{marginRight:'5px',color:'rgba(255, 159, 0, 1)'}}/>暂无数据~</div>
                }
                <DelModal isShowModal={this.state.isShowDelModal} parentType={this.state.parentType} draftId={this.props.draftId} topicId={this.state.topicId} noticeHomework={this.noticeHomework.bind(this)}/>
                {
                    this.state.loadingShow=='block' ? '' : <Pagination currentPage={this.state.currentPage} topicListLen={this.state.topicListLen} paginationSel={this.paginationSel.bind(this)}/>
                }

                <Modal
                  title="收藏试题"
                  visible={this.state.collectVisible}
                  cancelText="取消"
                  okText="确定"
                  width='420px'
                  onOk={this.collectHandleOk.bind(this)}
                  onCancel={this.collectHandleCancel.bind(this)}
                >
                  <Row gutter={8}>
                    <Col span={4} offset={2}>
                        <span>收藏至:</span>
                    </Col>
                    <Col span={6}>
                        <Select
                            mode="multiple"
                            placeholder="请选择习题集"
                            key={this.state.timeStamp}
                            defaultValue={this.state.defaultCollectProblemData}
                            style={{ width: '244px' ,marginTop:'-10px'}}
                            onChange={this.collectSel.bind(this)}>
                            {
                                this.state.collectList.map((item,index)=>{
                                    return <Option key={item.id} value={item.name}>{item.name}</Option>
                                })
                            }
                        </Select>
                    </Col>
                    <Icon type="down" style={{position: 'absolute',top:'6px',right: '42px'}}/>
                  </Row>
                  <Row gutter={8} style={{marginTop:'20px'}}>
                    <Col span={16} offset={2}>
                        <span style={{color: 'rgba(45, 187, 85, 1)',fontSize: '14px',cursor:'pointer'}} onClick={this.addColletBtn.bind(this)}>+添加习题集</span>
                    </Col>
                  </Row>
                  {
                    this.state.isAddcollectShow==true ? <Row gutter={8} style={{marginTop:'20px'}}>
                                                            <Col span={5} offset={2}>
                                                                <span>题集名称</span>
                                                            </Col>
                                                        </Row> : ''
                  }
                  {
                    this.state.isAddcollectShow==true ? <Row gutter={8} style={{marginTop:'20px'}}>
                                                            <Col span={16} offset={2}>
                                                                <Input placeholder="请输入习题集名称" onChange={this.collectInput.bind(this)}/>
                                                            </Col>
                                                            <Col span={6}  style={{marginTop:'-5px'}}>
                                                                <p style={{float:'left',marginTop:'10px',fontSize: '14px',color:'rgba(51,51,51,1)'}}>
                                                                    <span style={{marginRight:'8px',color: 'rgba(45, 187, 85, 1)',cursor:'pointer'}} onClick={this.saveCollectBtn.bind(this)}>保存</span><span style={{cursor:'pointer'}} onClick={this.cancelCollectBtn.bind(this)}>取消</span>
                                                                </p>
                                                            </Col>
                                                        </Row> : ''
                  }
                </Modal>
                <Modal
                  title="提示"
                  visible={this.state.cancelCollectVisible}
                  cancelText="取消"
                  okText="确定"
                  width='400px'
                  onOk={this.cancelCollectSure.bind(this)}
                  onCancel={this.cancelCollectCancel.bind(this)}
                >
                  <p>是否确定要取消收藏？</p>
                </Modal>
            </div>
        )
    }
    //选中题目
    onChange(e){
        let isShow=e.target.checked,//是否选择当前题
            questionId=e.target.dataId;//当前题选择的id
            if(isShow==true){
                this.props.viewSel.bind(this,isShow,questionId)();
            }else{
                this.props.viewSel.bind(this,isShow,questionId)();
            }
            if(this.props.parentType==3){
                //通知是否应该全选
                this.noticeIsAllCheck.bind(this)()
            }

    }
    //通知是否应该全选
    noticeIsAllCheck(){
            if(window.noticeDecorateQuestionIds!=''){
                console.log('谁-列表',this.state.topicList)
                for (var i = 0; i < this.state.topicList.length; i++) {
                    let item=this.state.topicList[i];
                     if(!window.noticeDecorateQuestionIds.match(item.id)){
                        console.log('谁-全部',window.noticeDecorateQuestionIds)
                        console.log('谁',item.id)
                        this.props.noticeCheckall.bind(this,false)();
                        return;
                    }
                }
                console.log('谁-全部111',window.noticeDecorateQuestionIds)
                if(this.state.topicList.length!=0){
                    this.props.noticeCheckall.bind(this,true)();
                }
            }
    }
    //查看解析
    showParse(e){
        let datacheck=e.currentTarget.getAttribute('data-check'),
            isShow=e.currentTarget.getAttribute('data-showType');
            if(isShow=='none'){
                let items=this.state.topicList;
                    items[datacheck].isShow='block';
                    this.setState({topicList:items,flag:!this.state.flag});
                    console.log(this.state.topicList)
            }else{
                let items=this.state.topicList;
                    items[datacheck].isShow='none';
                    this.setState({topicList:items,flag:!this.state.flag});
            }
    }
    //分页
    paginationSel(page){
        this.setState({
            loadingShow:'block',
            currentPage:page
        })
        let parentType=this.props.parentType;//0 布置作业调用 1 查看已选调用
            if(this.props.parentType==0){//布置作业调用
                let filterData=this.props.filterData,//从父组件获取的参数对象集合
                    catalogId=!!filterData.catalogId ? filterData.catalogId : '',//章节id
                    coachbookCatalogId=!!filterData.coachbookCatalogId ? filterData.coachbookCatalogId : '',//教辅id
                    knowledgeId=!!filterData.knowledgeId ? filterData.knowledgeId : '',//知识点id
                    collectId=!!filterData.collectId ? filterData.collectId : '',//收藏id
                    paperId=!!filterData.paperId ? filterData.paperId : '',//试卷id
                    tagId=!!filterData.specialId ? filterData.specialId : '',//专题id
                    categoryId=!!filterData.categoryId ? filterData.categoryId : '',//题型id
                    degree=!!filterData.degree ? filterData.degree : '',//难度id
                    keyword=!!filterData.keyword ? filterData.keyword : '',//关键字
                    draftId=!!this.props.draftId ? this.props.draftId : '',//草稿id
                    extParam=this.state.extParam+1,
                    rememberFlag=0,
                    pageNumber=page-1,//第一页
                    pageSize=5,//一页数据数
                    totalSize=-1;
                    this.state.extParam=this.state.extParam+1;
                    this.getTopiclistData.bind(this,loginToken,catalogId,coachbookCatalogId,knowledgeId,collectId,paperId,tagId,categoryId,degree,keyword,draftId,extParam,rememberFlag,pageNumber,pageSize,totalSize)();
            }else if(this.props.parentType==1){//查看已选调用
                let draftId=this.props.draftId,//从父组件获取的参数对象集合
                    pageNumber=page-1,//第一页
                    pageSize=5;//一页数据数
                    this.getDefaultQuestionList.bind(this,loginToken,window.noticeDecorateQuestionIds)();
            }else if(this.props.parentType==2){//习题集调用
                let collectId=!!this.props.collectId ? this.props.collectId : '',
                    degree=this.props.fileData.degreeValue,
                    categoryId=this.props.fileData.categoryValue,
                    keyword=this.props.fileData.keywordValue,
                    pageNumber=page-1,//第一页
                    pageSize=5;//一页数据数
                    this.getCollectTopic.bind(this,loginToken,collectId,degree,categoryId,keyword,pageNumber,pageSize)();
            }
    }
    //查看已选-删除已选题目
    delTopic(e){
        let id=e.target.getAttribute('data-id');
        this.setState({
            isShowDelModal:true,
            topicId:id
        })
    }
    //删除之后-子组件通知父组件改变isShowModal值
    noticeHomework(data,id){
        this.setState({
            isShowDelModal:data
        })
        if(id===''){
            return;
        }
        let draftId=this.props.draftId,//草稿id
            exerciseId=this.props.exerciseId,//练习id
            noticeDecorateQuestionIds=window.noticeDecorateQuestionIds.split(","),//题目
            currentCatalogIds=window.catalogIds.split(","),//题目对应下章节
            choiceCatalogId=Constants.isHasCatalog(window.catalogIds) ? '' : Constants.isFormat(this.props.choiceData,undefined) ? this.props.choiceData.charAt(this.props.choiceData.length-1) : '',//检查所有章节是否全有为0
            questionCount=this.state.topicList.length;//章节ids
            noticeDecorateQuestionIds.splice(noticeDecorateQuestionIds.indexOf(id),1);
            currentCatalogIds.splice(noticeDecorateQuestionIds.indexOf(id),1);
            window.noticeDecorateQuestionIds=noticeDecorateQuestionIds.toString();//题目ids
            window.catalogIds=currentCatalogIds.toString();
            if(noticeDecorateQuestionIds.length!=0){
                this.getDefaultQuestionList.bind(this,loginToken,window.noticeDecorateQuestionIds)();
                //如果isSelected为3说明是练习已选调用此组件，练习没有草稿概念所以不用更新草稿
                if(this.props.isSelected==3){
                    //删除之后更新练习题目
                    this.updateExercise.bind(this,loginToken,exerciseId,window.catalogIds,window.noticeDecorateQuestionIds,choiceCatalogId,questionCount)()
                }else{
                    //删除之后更新作业题目
                    this.updateDefault.bind(this,loginToken,draftId,window.noticeDecorateQuestionIds,window.catalogIds,questionCount)()
                }
                // setTimeout(()=>{
                //     //通知查看已选父组件-有多少道题目是否为空
                //     this.props.noticeTopicNum.bind(this,this.state.topicList,this.state.topicList.length,this.state.draftSelData.objectiveNum,this.state.draftSelData.subjectiveNum)()
                // },500)
            }else{//当前只有一道题也删除
                //如果isSelected为3说明是练习已选调用此组件，练习没有草稿概念所以不用更新草稿
                if(this.props.isSelected==3){
                   //删除之后更新练习题目
                   this.updateExercise.bind(this,loginToken,exerciseId,window.catalogIds,window.noticeDecorateQuestionIds,choiceCatalogId,0)()
                }else{
                    //删除之后更新作业题目
                    this.updateDefault.bind(this,loginToken,draftId,window.noticeDecorateQuestionIds,window.catalogIds,0)()
                }
                this.setState({
                    topicList:[]
                },()=>{
                    this.props.noticeTopicNum.bind(this,this.state.topicList,this.state.topicList.length,0,0)()
                })
            }
    }
    //获取习题集列表
    getCollectList(collectQustionId,whetherCollected){
        const resultCollectSearchList = collectSearchList(loginToken,collectQustionId);
                resultCollectSearchList.then(res => {
                    return res.json()
                }).then(json => {
                    // 处理获取的数据
                    const data = json
                    if (data.result) {
                        let collectList=data.data;
                            //每次调出收藏弹窗，默认选中已存在的习题集
                            let defaultCollectProblemData=[];
                                for (var i = 0; i < collectList.length; i++) {
                                    if(collectList[i].questionId==collectQustionId){
                                        defaultCollectProblemData.push(collectList[i].name);
                                    }
                                }
                                this.setState({
                                    collectList:collectList,
                                    flag:!this.state.flag
                                })
                                //当前题目是否是已收藏的-默认是否为空
                                if(whetherCollected=='true'){
                                    console.log('收藏参数耶',(new Date()).getTime(),defaultCollectProblemData)
                                    this.setState({
                                        defaultCollectProblemData:defaultCollectProblemData,
                                        timeStamp:(new Date()).getTime(),
                                        flag:!this.state.flag
                                    })
                                }else if(whetherCollected=='false'){
                                    console.log('收藏false')
                                    this.setState({
                                        defaultCollectProblemData:[],
                                        timeStamp:(new Date()).getTime(),
                                        flag:!this.state.flag
                                    })
                                }
                    }
                }).catch(ex => {
                    // 发生错误
                    if (__DEV__) {
                        console.error('暂无数据, ', ex.message)
                    }
                })

    }
    //保存收藏update
    collectUpdate(loginToken,collectIds,questionId){
        return new Promise((resolve,reject) =>{
            const resultAddorcancelCollect = addorcancelCollect(loginToken,collectIds,questionId);
                        resultAddorcancelCollect.then(res => {
                            return res.json()
                        }).then(json => {
                            // 处理获取的数据
                            const data = json
                            if (data.result) {
                                resolve(data.data.whetherCollected);
                                let whetherCollected=data.data.whetherCollected,
                                    topicList=this.state.topicList;
                                    for (var i = 0; i < topicList.length; i++) {
                                        if(topicList[i].id==questionId){
                                            topicList[i].whetherCollected=whetherCollected;
                                        }
                                    }
                                    this.setState({
                                        topicList:topicList,
                                        flag:!this.state.flag
                                    })
                                if(collectIds!=''){
                                    message.success('已收藏至我的习题中');
                                }else{
                                    message.success('已取消收藏');
                                }
                            }
                            this.setState({
                                collectVisible:false
                            })
                        }).catch(ex => {
                            // 发生错误
                            if (__DEV__) {
                                reject(ex.message)
                                console.error('暂无数据, ', ex.message)
                            }
                        })

        })

    }
    //收藏
    collectHandle(e){
        let collectQustionId=e.currentTarget.getAttribute('data-id'),
            whetherCollected=e.currentTarget.getAttribute('data-collected');
            this.getCollectList.bind(this,collectQustionId,whetherCollected)();
            this.setState({
                collectQustionId:collectQustionId
            })
            if(this.props.parentType==2){
                if(whetherCollected=='true'){
                    this.setState({
                        cancelCollectVisible:true
                    })
                }else if(whetherCollected=='false'){
                    this.setState({
                        collectVisible:true
                    })
                }
            }else{
                this.setState({
                    collectVisible:true
                })
            }
    }
    //取消收藏
    cancelCollectSure(){
        const resultAddorcancelCollect = delectCollectQuestion(loginToken,this.props.collectId,this.state.collectQustionId);
        resultAddorcancelCollect.then(res => {
            return res.json()
        }).then(json => {
            // 处理获取的数据
            const data = json
            if (data.result) {
                message.success('已取消收藏');
                if(this.props.parentType==2){
                    let collectId=!!this.props.collectId ? this.props.collectId : '',
                        degree=this.props.fileData.degreeValue,
                        categoryId=this.props.fileData.categoryValue,
                        keyword=this.props.fileData.keywordValue,
                        pageNumber=0,//第一页
                        pageSize=5;//一页数据数
                    this.getCollectTopic.bind(this,loginToken,collectId,degree,categoryId,keyword,pageNumber,pageSize)();
                }
            }
        }).catch(ex => {
            // 发生错误
            if (__DEV__) {
                reject(ex.message)
                console.error('暂无数据, ', ex.message)
            }
        })
        this.setState({
            cancelCollectVisible:false
        })
    }
    cancelCollectCancel(){
        this.setState({
            cancelCollectVisible:false
        })
    }
    //选择收藏习题集
    collectSel(value){
        console.log('删除习题集')
      let collectList=this.state.collectList,
          defaultCollectProblemData=[],
          valueId=[];
          for (var i = 0; i < collectList.length; i++) {
              for (var j = 0; j < value.length; j++) {
                  if(collectList[i].name==value[j]){
                        valueId.push(collectList[i].id);
                      defaultCollectProblemData.push(collectList[i].name);
                   }
              }

          }
          this.state.collectProblemData=valueId.toString();
          this.state.defaultCollectProblemData=defaultCollectProblemData;
    }
    //输入习题集名称
    collectInput(e){
        this.setState({
            newProblemName:e.target.value
        })
    }
    //添加新习题集-显示
    addColletBtn(){
        this.setState({
            isAddcollectShow:true
        })
    }

    //添加习题集-保存
    saveCollectBtn(){
        let name=this.state.newProblemName;//新习题集名字
        const resultAddProblem = addProblem(loginToken,name);
                resultAddProblem.then(res => {
                    return res.json()
                }).then(json => {
                    // 处理获取的数据
                    const data = json
                    if (data.result) {
                        //添加成功之后重新渲染一下收藏习题集列表
                        let collectQustionId=this.state.collectQustionId;
                            this.getCollectList.bind(this,collectQustionId,0)();
                            this.setState({
                                collectProblemData:`${this.state.collectProblemData},${data.data.id}`.replace(/(^\,*)|(\,*$)/g, ""),
                                defaultCollectProblemData:[...this.state.defaultCollectProblemData,name],
                                isAddcollectShow:false,
                                timeStamp:(new Date()).getTime(),
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
    //添加习题集-取消
    cancelCollectBtn(){
        this.setState({
            isAddcollectShow:false
        })
    }
    //收藏确定
    collectHandleOk(){
        console.log('保存收藏',this.state.collectProblemData)
        let collectIds=this.state.collectProblemData,
            questionId=this.state.collectQustionId;
            this.collectUpdate.bind(this,loginToken,collectIds,questionId)();

    }
    //取消收藏
    collectHandleCancel(){
        this.setState({
            collectVisible:false
        })
    }
    //方法-接收父组件参数(子组件树组件给父组件传值-父组件在通过这个方法给本组件传值)
    getDecorateParameter(catalogId,coachbookCatalogId,knowledgeId,collectId,paperId,rememberFlag){
       let filterData=this.props.filterData,//从父组件获取的参数对象集合
            tagId=!!filterData.specialId ? filterData.specialId : '',//专题id
            categoryId=!!filterData.categoryId ? filterData.categoryId : '',//题型id
            degree=!!filterData.degree ? filterData.degree : '',//难度id
            keyword=!!filterData.keyword ? filterData.keyword : '',//难度id
            draftId=!!this.props.draftId ? this.props.draftId : '',//草稿id
            extParam=this.state.extParam+1,
            pageNumber=0,//第一页
            pageSize=5,//一页数据数
            totalSize=0;
            this.state.extParam=this.state.extParam+1;
            this.setState({
                topicList:[]
            })
            if(catalogId==''&&coachbookCatalogId==''&&knowledgeId==''&&collectId==''&&paperId==''){//如果都为空-则意味着取消当前筛选题-清空列表
                this.setState({
                    topicList:[]
                })
            }else{
                this.getTopiclistData.bind(this,loginToken,catalogId,coachbookCatalogId,knowledgeId,collectId,paperId,tagId,categoryId,degree,keyword,draftId,extParam,rememberFlag,pageNumber,pageSize,totalSize)();
            }
            //每次刷新数据页数默认第一页
            this.setState({
                currentPage:1
            })
    }
    //获取子组件所有id
    getChildQuestions(){
        let questionIds='';
            this.state.topicList.forEach((item,index)=>{
                questionIds+=item.id+','
            })
            return questionIds.substring(0,questionIds.length-1)
    }
    //拖拽开始
    handleStart(e){
      let recordId=e.currentTarget.getAttribute('data-id'),//记录当前拖拽的id
          recordIndex=window.noticeDecorateQuestionIds.split(',').indexOf(recordId);//记录当前拖拽的id下标
          this.setState({
            recordId:recordId,
            recordIndex:recordIndex
          })
    }
}

export default DecorateList
