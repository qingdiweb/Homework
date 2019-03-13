/**
 * 布置作业
 */
import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import { Link, hashHistory } from 'react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Tabs , Radio , Breadcrumb , Select , message , Input,Icon,Spin} from 'antd';
import { getTypeDgreeData , delHomeworkList , getDefaultDraft , getDraftDetail , DefaultDraftAddQuestion , DefaultDraftDelQuestion , getDefaultQuestionList , saveDefault , getPaperSearchCondition,getCoachbookData} from '../../fetch/decorate-homework/decorate-homework'
import DecorateList from '../../components/DecorateList'
import ProjectList from '../../components/ProjectList'
import TreeList from '../../components/TreeList'
import $ from  'jquery'
import * as Constants from '../../Constants/store'
import './style.less'
const Option = Select.Option;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const TabPane = Tabs.TabPane;
const loginToken=localStorage.getItem("loginToken");
const teacherInfo=JSON.parse(localStorage.getItem("teacherInfo"));//教师信息
window.noticeDecorateQuestionIds='';//用作通知header组件离开当前页面保存草稿参数用
window.catalogIds='';//全局章节
window.catalogNames='';//全局章节名称
class DecorateHomework extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
        this.state={
            type:'1',
            specialInfoList:[],//专题
            degreeInfoList:[],//难度
            categoryInfoList:[],//题型
            parentType:0,//父组件类型-看是哪个父组件调用的作业列表子组件 0 是布置作业 1 查看已选
            flag:false,//用作filterDate对象深比较来触发子组件的更新
            filterData:{
                catalogId:"",//章节id
                coachbookCatalogId:'',//教辅id
                knowledgeId:"",//知识点id
                collectId:"",//习题集id
                paperId:'',//试卷id
                specialId:'',//专题
                categoryId:"",//题型id
                degree:"",//难度id
                keyword:'',//关键字
                loadingShow:'block'//加载loading
            },
            selNum:window.noticeDecorateQuestionIds!=='' ? window.noticeDecorateQuestionIds.split(',').length : 0,//查看已选
            draftId:'',//获取一个默认草稿id
            paperSearchData:[],//试卷筛选条件数据
            paperSearchObj:{//试卷筛选条件数据
                province:'',
                grade:'',
                year:'',
                type:'',
            },
            filterId:'',//此id为了给他取消高亮筛选时候用的
            defaultSpecial:'',//默认专题
            defaultType:'',//默认类型
            defaultDegree:'',//默认难度
            isShowProjectList:true,
            projectType:'',//专题类型
            coachbookInfoList:[],//教辅全部数据
            coachbookIndex:0,//教辅索引
            coachbookList:[],//教列表
            versionIndex:0,//版本索引值
            coachLoadingShow:'block',
            extParam:0,//扩展参数-用来防止连续调取接口，上一个接口返回慢导致数据不准确问题
            kaiguan:true
        }
    }
    componentWillMount(){
        //从查看已选页面继续添加过来呈现原来题目
        let stageId=this.props.teacherInfo.stageId,
            subjectId=this.props.teacherInfo.subjectId,
            draftId=this.props.params.draftId,// 为空是主页或menu跳转过来的 不为空是查看已选跳转过来的
            draftSelNum=this.props.params.draftSelNum,
            fromwhere=this.props.params.fromwhere;//0 布置过来的 1 布置-查看已选-布置过来的 2 草稿-查看已选-布置过来的 3 测验-查看已选-布置过来的 4 再次编辑-查看已选-布置过来的
            if(fromwhere!=0){
              /*  let filterData=JSON.parse(localStorage.getItem("filterData"));*/
                this.setState({
                   /* filterData:filterData,*/
                    draftId:draftId,
                    flag:!this.state.flag,
                    selNum:window.noticeDecorateQuestionIds!=''?window.noticeDecorateQuestionIds.split(',').length:0
                })
            }
            //获取草稿信息
      /*      const resultGetDraftDetail = getDraftDetail(loginToken,draftId)
                resultGetDraftDetail.then(res => {
                    return res.json()
                }).then(json => {
                    // 处理获取的数据
                    const data = json
                    if (data.result) {
                       let questionCount=data.data.questionCount;//已选数量
                            this.setState({
                                selNum:questionCount//从查看已选过来初始化给上多少道题
                            })
                    }
                }).catch(ex => {
                    // 发生错误
                    if (__DEV__) {
                        console.error('暂无数据, ', ex.message)
                    }
                })*/
            //获取题型难度
            const resultTypeDgree = getTypeDgreeData(stageId,subjectId)
                resultTypeDgree.then(res => {
                    return res.json()
                }).then(json => {
                    // 处理获取的数据
                    const data = json
                    if (data.result) {
                        let specialInfoList=data.data.questionTagInfoList,//专题
                            questionDegreeInfoList=data.data.questionDegreeInfoList,//难度
                            questionCategoryInfoList=data.data.questionCategoryInfoList;//题型
                            this.setState({
                                specialInfoList:specialInfoList,
                                degreeInfoList:questionDegreeInfoList,
                                categoryInfoList:questionCategoryInfoList
                            })
                    }
                }).catch(ex => {
                    // 发生错误
                    if (__DEV__) {
                        console.error('暂无数据, ', ex.message)
                    }
                })
            //请求教辅信息
            this.getCoachbookData.bind(this,stageId,subjectId,0)()
            //获取试卷筛选条件数据
            const resultPaperSearchCondition=getPaperSearchCondition(stageId,subjectId);
                  resultPaperSearchCondition.then(res=>{
                        return res.json()
                    }).then(json => {
                        // 处理获取的数据
                        const data = json
                        if (data.result) {
                                this.setState({
                                    paperSearchData:data.data,
                                })
                        }
                    }).catch(ex =>{
                        // 发生错误
                        if (__DEV__) {
                            console.error('暂无数据, ', ex.message)
                        }
                    })
            //通知左侧menu导航-当前在那个menu下
            localStorage.setItem('positionMenu',JSON.stringify(['1']));
    }
    componentDidMount() {
        // 如果是从查看已选跳转过来的-就不让他重新调取默认草稿
        let fromwhere=this.props.params.fromwhere,//0 布置过来的 1 布置-查看已选-布置过来的 2 草稿-查看已选-布置过来的 3 测验-查看已选-布置过来的 4 再次编辑-查看已选-布置过来的
            draftId=this.props.params.draftId;
            if(fromwhere!=0){
                this.setState({
                    flag:!this.state.flag,
                })

            }else{//查看已选过来-改变flag，使list列表走componentWillReceiveProps生命周期调取接口
                //获取默认草稿
                const resultDefaultDraft=getDefaultDraft(loginToken);
                      resultDefaultDraft.then(res=>{
                        return res.json()
                      }).then(json => {
                        // 处理获取的数据
                        const data = json
                        if (data.result) {
                            let draftId=data.data.id;
                                this.setState({
                                    draftId:draftId
                                })
                        }
                      }).catch(ex =>{
                        // 发生错误
                        if (__DEV__) {
                            console.error('暂无数据, ', ex.message)
                        }
                      })
                //凡是不是从查看已选-继续添加过来需要记录题目和章节-就让他每次置空
/*                window.noticeDecorateQuestionIds='';
                window.catalogIds='';*/
            }
            //通知主组件当前是否至少有一道题-如果是，离开提示
            this.props.noticeDecorate.bind(this,window.noticeDecorateQuestionIds=='' ? 0 : window.noticeDecorateQuestionIds.split(',').length,window.noticeDecorateQuestionIds,window.catalogIds,draftId)()
    }
    //请求教辅信息
    getCoachbookData(stageId,subjectId,extParam){
         //请求教辅数据
        const resultCoachbookData = getCoachbookData(stageId,subjectId,extParam)
              resultCoachbookData.then(res => {
                   return res.json()
               }).then(json => {
                   // 处理获取的数据
                   const data = json
                   if (data.result) {
                        let coachbookInfoList=data.data;
                            this.setState({
                                coachbookInfoList:coachbookInfoList,
                                coachbookList:coachbookInfoList[0].list
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
        console.log('试卷筛选',this.state.coachbookInfoList,this.state.coachbookInfoList)
        return (
            <div className="decorate-work">
            {
                this.state.isShowProjectList==true ? <div>
                    <h1 className='header-nav'><Breadcrumb separator=">"><Breadcrumb.Item >布置</Breadcrumb.Item></Breadcrumb></h1>
                    <Tabs className='filter-tap' defaultActiveKey="1" onChange={this.callback.bind(this)} >
                        <TabPane tab="教材同步" key="1"></TabPane>
                        <TabPane tab="配套教辅" key="5"></TabPane>
                        <TabPane tab="知识点" key="2"></TabPane>
                        <TabPane tab="试卷" key="4"></TabPane>
                        <TabPane tab="我的习题" key="3"></TabPane>
                    </Tabs>
                    <div className='filter-input-box'>
                        <Input className='filter-input' placeholder="输入想要查找的试题关键字" onChange={this.filterKeyword.bind(this)}/>
                        <span className='filter-seach-btn' onClick={this.filterKeywordClick.bind(this)}></span>
                    </div>
                    <div className="decorate-info"></div>
                    {
                        this.state.type=='4' ?  <div className="paper-filter">
                                                    <label htmlFor="" className="filter-label">地区</label>
                                                    <Select className="area-filter"  placeholder={this.state.paperSearchData.length>0 ? '全部' : '请选择省份'}  allowClear={false} data-type={0} onChange={this.paperProvinceFilter.bind(this)}>
                                                        <Option value='' key='0'>全部</Option>
                                                    {
                                                        this.state.paperSearchData.length>0 ? this.state.paperSearchData[0].searchListInfo.map((item,index)=>{

                                                            return  <Option value={item.value} key={index}>{item.title}</Option>
                                                        }) : ''
                                                    }
                                                    </Select>
                                                    <label htmlFor="" className="filter-label">年级</label>
                                                    <Select className="grade-filter" placeholder={this.state.paperSearchData.length>0 ? '全部' : "请选择年级"}  allowClear={false} onChange={this.paperGradeFilter.bind(this)}>
                                                        <Option value='' key='0'>全部</Option>
                                                    {
                                                        this.state.paperSearchData.length>0 ? this.state.paperSearchData[2].searchListInfo.map((item,index)=>{
                                                            return  <Option value={item.id} key={index}>{item.title}</Option>
                                                        }) : ''
                                                    }
                                                    </Select>
                                                    <label htmlFor="" className="filter-label">年份</label>
                                                    <Select className="grade-filter" placeholder={this.state.paperSearchData.length>0 ? '全部' : "请选择年份"}  allowClear={false} onChange={this.paperYearFilter.bind(this)}>
                                                        <Option value='' key='0'>全部</Option>
                                                    {
                                                        this.state.paperSearchData.length>0 ? this.state.paperSearchData[3].searchListInfo.map((item,index)=>{
                                                            return  <Option value={item.value} key={index}>{item.title}</Option>
                                                        }) : ''
                                                    }
                                                    </Select>
                                                    <label htmlFor="" className="filter-label">类型</label>
                                                    <Select className="grade-filter" placeholder={this.state.paperSearchData.length>0 ? '全部' : "请选择年类型"}  allowClear={false} onChange={this.paperTypeFilter.bind(this)}>
                                                        <Option value='' key='0'>全部</Option>
                                                    {
                                                        this.state.paperSearchData.length>0 ? this.state.paperSearchData[1].searchListInfo.map((item,index)=>{
                                                            return  <Option value={item.value} key={index}>{item.title}</Option>
                                                        }) : ''
                                                    }
                                                    </Select>
                                                </div> : ''
                    }
                    {
                        this.state.type=='5' ?  <div className="coachbook-filter">
                                                <div className='coachbook-version'>
                                                    <label htmlFor="" className='coachbook-version-name'>教材版本</label>
                                                    <div ref={(refNum)=>{this.version=refNum}} id='coachbook-version-box' className='coachbook-version-box'>
                                                    {
                                                        Constants.isFormat(this.state.coachbookInfoList,Array) ? this.state.coachbookInfoList.map((item,index)=>{
                                                            return <span key={item.editionId} data-index={index} onClick={this.coachbookVersionSel.bind(this)}>{item.edition}</span>
                                                        }) : <span>暂无版本</span>
                                                    }
                                                    </div>
                                                </div>
                                                <span className='coachbook-text'>配套教辅</span>
                                                    <Spin size="small" style={{"fontSize":"30px","display":this.state.coachLoadingShow,'margin':'50px auto 0px'}}/>

                                                    {
                                                        this.state.coachbookList.length!=0 ? <div id='coachbook-pic' className="coachbook-pic">
                                                            {
                                                                this.state.coachbookList.length>7&&<a href="javascript:;" className="left-arrow"  onClick={this.coachbookLeft.bind(this)}></a>
                                                            }
                                                            <ul  id="coachbook-ul" className="coachbook-ul">
                                                                {
                                                                    this.state.coachbookList.map((item,index)=>{
                                                                        return <li key={index} data-index={index} onClick={this.coachbookSel.bind(this)}>
                                                                            <img src={item.coverUrl} alt=""/>
                                                                            <span className='coach-name' title={item.name}>{item.name}</span>
                                                                        </li>
                                                                    })
                                                                }
                                                            </ul>
                                                            {
                                                                this.state.coachbookList.length>7&&<a href="javascript:;" className="right-arrow" onClick={this.coachbookRight.bind(this)}></a>
                                                            }
                                                        </div> : <div style={{'fontSize':'16px','textAlign':'center','margin':'60px auto 0',"display":this.state.coachLoadingShow=='block' ? 'none' : 'block'}}><Icon type="exclamation-circle" style={{marginRight:'5px',color:'rgba(255, 159, 0, 1)'}}/>暂无配套教辅~</div>
                                                    }

                                                </div> : ''
                    }
                    <div className='filter-conditions'>
                        <div className="filter-conditions-left">
                            <TreeList
                                ref={(treeControl) => {this.treeControl=treeControl}}
                                type={this.state.type}
                                noticeTree={this.noticeTree.bind(this)}
                                noticeTreeSel={this.noticeTreeSel.bind(this)}
                                noticeCoachbookData={this.noticeCoachbookData.bind(this)}
                                />
                        </div>
                        <div className="filter-conditions-right ">
                            {
                                this.state.type=='1' ? <p className='clear-fix' style={{width:'100%',marginBottom:'12px'}}>
                                    <div className='type-cont topic-type-cont'>
                                        {
                                             this.state.specialInfoList.map((item,index)=>{
                                                let classTem='';
                                                if(item.value==1){
                                                    classTem='topic-sec topic-sec-one'
                                                }else if(item.value==2){
                                                    classTem='topic-sec topic-sec-two'
                                                }else if(item.value==3){
                                                    classTem='topic-sec topic-sec-three'
                                                }else if(item.value==4){
                                                    classTem='topic-sec topic-sec-four'
                                                }
                                                return <div className={classTem} value={item.value} key={item.value} onClick={this.doProject.bind(this)}>
                                                            {item.title}
                                                        </div>
                                            })
                                        }
                                        <div className='topic-sec topic-sec-five' value='5' key='5' onClick={this.doProject.bind(this)}>
                                            推荐试题
                                        </div>
                                    </div>
                                </p>  : ''
                            }
                            {
                                this.state.type!='5' ? <div className='clear-fix' style={{width:'100%',marginBottom:'12px'}}>
                                        <span style={{fontWeight:'600'}}>题型</span>
                                        <div className='type-cont'>
                                            <RadioGroup onChange={this.onTypeChange.bind(this)} defaultValue={this.state.defaultType} >
                                                <RadioButton value="" className="typeNolimit">不限</RadioButton>
                                                {
                                                    this.state.categoryInfoList.map((item)=>{
                                                        return <RadioButton  value={item.id} key={item.id} style={{marginBottom:'10px'}}>{item.name}</RadioButton>
                                                    })
                                                }
                                            </RadioGroup>
                                        </div>
                                    </div> : ''
                            }
                            {
                                this.state.type!='5' ?  <div className='clear-fix' style={{width:'100%',marginBottom:'18px'}}>
                                        <span style={{fontWeight:'600'}}>难度</span>
                                        <div className='type-cont'>
                                            <RadioGroup onChange={this.onDegreeChange.bind(this)} defaultValue={this.state.defaultDegree}>
                                                <RadioButton  value="" className="degreeNolimit">不限</RadioButton>
                                               {
                                                    this.state.degreeInfoList.map((item)=>{
                                                        return <RadioButton  value={item.value} key={item.value}>{item.title}</RadioButton>
                                                    })
                                                }
                                            </RadioGroup>
                                        </div>
                                    </div> : ''
                            }

                            <DecorateList
                                ref={(decorateListTag) => { this.decorateList = decorateListTag;}}
                                flag={this.state.flag}
                                parentType={this.state.parentType}
                                draftId={this.state.draftId}
                                filterData={this.state.filterData}
                                noticeDecorateQuestionIds={window.noticeDecorateQuestionIds}
                                viewSel={this.viewSel.bind(this)}
                                />
                        </div>
                    </div>
                </div> : <ProjectList
                            flag={!this.state.flag}
                            catalogId={this.state.filterData.catalogId}
                            projectType={this.state.projectType}
                            returnInfo={this.returnInfo.bind(this)}
                            specialInfoList={this.state.specialInfoList}
                            viewSel={this.viewSel.bind(this)}>
                            </ProjectList>
            }
                <div className="viewSelected" onClick={this.jumpViewSel.bind(this)}>
                        <div className='auto-box'>
                            <p>已选试题</p>
                            <b ref={(refNum)=>{this.refNum=refNum}}>{this.state.selNum}</b>
                        </div>
                </div>
            </div>
        )
    }
    //教材同步 知识点 收藏 试卷点击
    callback(type){
        //教师信息
        let stageId=this.props.teacherInfo.stageId,
            subjectId=this.props.teacherInfo.subjectId,
            questionId=0,
            extParam=this.state.extParam+=1;
            if(type==1){
                this.treeControl.getMaterialListData(stageId,subjectId,extParam).then((versiondata)=>{
                    this.treeControl.getLastOperation(loginToken).then((data)=>{
                        let lastOperation=data,
                            lastTextbookId=Constants.isFormat(lastOperation.textbook,String) ? (stageId!=lastOperation.textbook.lastStageId||subjectId!=lastOperation.textbook.lastSubjectId) ? versiondata[0].textbookInfoList[0].textbookId : lastOperation.textbook.lastTextbookId : versiondata[0].textbookInfoList[0].textbookId;
                            this.treeControl.getMaterialCatalogData(loginToken,lastTextbookId,0)
                    })
                });
                this.state.kaiguan=true;//教辅版本开关
            }else if(type==5){
                this.treeControl.getCoachbookData(stageId,subjectId,extParam,0,0);
                this.setState({
                    coachLoadingShow:'block'
                })
            }else if(type==2){
                this.treeControl.getKnowledgeListData(stageId,subjectId,extParam)
                this.state.kaiguan=true;//教辅版本开关
            }else if(type==3){
                this.treeControl.getCollectListData(loginToken,questionId,extParam)
                this.state.kaiguan=true;//教辅版本开关
            }else if(type==4){
                this.treeControl.getPaperInfoData(stageId,subjectId,'','','','',extParam)
                this.state.kaiguan=true;//教辅版本开关
            }
            this.setState({
                type:type
            })
            //重置题型和难度筛选
            $('.typeNolimit').trigger('click');
            $('.degreeNolimit').trigger('click');
    }
    noticeCoachbookData(value){
        console.log('len',value)
        if(value.length!=0&&this.state.kaiguan){
            setTimeout(()=>{
                console.log('走这里')
                this.version.firstChild.click();
                this.state.kaiguan=false;//版本开关
            },300)
        }
    }
    //专题切换
    onSpecialChange(e){
        let specialId=e.target.value;
            //专题暂时传空字符串
            this.setState({object:this.state.filterData.specialId='',flag:!this.state.flag})
    }
    //题型切换
    onTypeChange(e){
        let typeId=e.target.value;
            this.setState({object:this.state.filterData.categoryId=typeId,flag:!this.state.flag})
    }
    //难度切换
    onDegreeChange(e){
        let degreeId=e.target.value;
            this.setState({object:this.state.filterData.degree=degreeId,flag:!this.state.flag});
    }
    //搜索关键字
    filterKeyword(e){
        console.log('value',e.target.value)
        this.state.filterData.keyword=e.target.value;
    }
    filterKeywordClick(){
        this.setState({flag:!this.state.flag})
    }
    //树结构子组件通知父组件方法
    noticeTree(type,id){
        console.log('接收数据',type,id)
        if(type==1){//教材同步
            if(this.decorateList){
               /* if(this.props.params.draftId==0){//当从查看选过来的就不让重置第一个教材点-以免冲突

                }*/
                this.decorateList.getDecorateParameter(id,'','','','',0);
                this.setState({
                    object:this.state.filterData.catalogId=id,
                    object:this.state.filterData.coachbookCatalogId='',
                    object:this.state.filterData.knowledgeId='',
                    object:this.state.filterData.collectId='',
                    object:this.state.filterData.paperId=''
                });
            }
        }else if(type==2){//知识点
            if(this.decorateList){
                this.decorateList.getDecorateParameter('','',id,'','',0);
                this.setState({
                    object:this.state.filterData.catalogId='',
                    object:this.state.filterData.coachbookCatalogId='',
                    object:this.state.filterData.knowledgeId=id,
                    object:this.state.filterData.collectId='',
                    object:this.state.filterData.paperId=''

                });
            }
        }else if(type==3){//习题集
            if(this.decorateList){
                this.decorateList.getDecorateParameter('','','',id,'',0);
                this.setState({
                    object:this.state.filterData.catalogId='',
                    object:this.state.filterData.coachbookCatalogId='',
                    object:this.state.filterData.knowledgeId='',
                    object:this.state.filterData.collectId=id,
                    object:this.state.filterData.paperId=''
                });
            }
        }else if(type==4){//试卷
            if(this.decorateList){
                this.decorateList.getDecorateParameter('','','','',id,0);
                this.setState({
                    object:this.state.filterData.catalogId='',
                    object:this.state.filterData.coachbookCatalogId='',
                    object:this.state.filterData.knowledgeId='',
                    object:this.state.filterData.collectId='',
                    object:this.state.filterData.paperId=id
                });
            }
        }else if(type==5){//教辅
           console.log('diaoyongjiaifu')
            if(this.decorateList){
                console.log('diaoyongjiaifu1')
                this.decorateList.getDecorateParameter('',id,'','','',0);
                this.setState({
                    object:this.state.filterData.catalogId='',
                    object:this.state.filterData.coachbookCatalogId=id,
                    object:this.state.filterData.knowledgeId='',
                    object:this.state.filterData.collectId='',
                    object:this.state.filterData.paperId=''
                });
            }
        }
    }
    noticeTreeSel(type,id,rememberFlag){
        //此id为了给他取消高亮筛选时候用的
        this.setState({
            filterId:id
        })
        if(type==0){//取消当前选题
            if(this.decorateList){
                    this.decorateList.getDecorateParameter(this.state.filterId,'','','','',rememberFlag);
                    this.setState({
                        object:this.state.filterData.catalogId=this.state.filterId,
                        object:this.state.filterData.coachbookCatalogId='',
                        object:this.state.filterData.knowledgeId='',
                        object:this.state.filterData.collectId='',
                        object:this.state.filterData.paperId='',
                        object:this.state.filterData.specialId='',
                        object:this.state.filterData.categoryId='',
                        object:this.state.filterData.degree='',
                        object:this.state.filterData.keyword='',
                      /*  flag:!this.state.flag,*/
                    });
                    $('.typeNolimit').trigger('click');
                    $('.degreeNolimit').trigger('click');
            }
        }else if(type==1){//教材同步
            console.log('教材同步')
            if(this.decorateList){
                    this.decorateList.getDecorateParameter(id,'','','','',rememberFlag);
                    this.setState({
                        object:this.state.filterData.catalogId=id,
                        object:this.state.filterData.coachbookCatalogId='',
                        object:this.state.filterData.knowledgeId='',
                        object:this.state.filterData.collectId='',
                        object:this.state.filterData.paperId='',
                        object:this.state.filterData.specialId='',
                        object:this.state.filterData.categoryId='',
                        object:this.state.filterData.degree='',
                        //object:this.state.filterData.keyword='',
                       /* flag:!this.state.flag,*/
                    });
                    $('.typeNolimit').trigger('click');
                    $('.degreeNolimit').trigger('click');
            }
        }else if(type==2){//知识点
            if(this.decorateList){
                this.decorateList.getDecorateParameter('','',id,'','',rememberFlag);
                this.setState({
                    object:this.state.filterData.catalogId='',
                    object:this.state.filterData.coachbookCatalogId='',
                    object:this.state.filterData.knowledgeId=id,
                    object:this.state.filterData.collectId='',
                    object:this.state.filterData.paperId='',
                    object:this.state.filterData.specialId='',
                    object:this.state.filterData.categoryId='',
                    object:this.state.filterData.degree='',
                    //object:this.state.filterData.keyword='',
                    /*flag:!this.state.flag*/
                });
                $('.typeNolimit').trigger('click');
                $('.degreeNolimit').trigger('click');
            }
        }else if(type==3){//习题集
            if(this.decorateList){
                this.decorateList.getDecorateParameter('','','',id,'',rememberFlag);
                this.setState({
                    object:this.state.filterData.catalogId='',
                    object:this.state.filterData.coachbookCatalogId='',
                    object:this.state.filterData.knowledgeId='',
                    object:this.state.filterData.collectId=id,
                    object:this.state.filterData.paperId='',
                    object:this.state.filterData.specialId='',
                    object:this.state.filterData.categoryId='',
                    object:this.state.filterData.degree='',
                    //object:this.state.filterData.keyword='',
                   /* flag:!this.state.flag*/
                });
                $('.typeNolimit').trigger('click');
                $('.degreeNolimit').trigger('click');
            }
        }else if(type==4){//试卷
            if(this.decorateList){
                this.decorateList.getDecorateParameter('','','','',id,rememberFlag);
                this.setState({
                    object:this.state.filterData.catalogId='',
                    object:this.state.filterData.coachbookCatalogId='',
                    object:this.state.filterData.knowledgeId='',
                    object:this.state.filterData.collectId='',
                    object:this.state.filterData.paperId=id,
                    object:this.state.filterData.specialId='',
                    object:this.state.filterData.categoryId='',
                    object:this.state.filterData.degree='',
                    //object:this.state.filterData.keyword='',
                   /* flag:!this.state.flag*/
                });
                $('.typeNolimit').trigger('click');
                $('.degreeNolimit').trigger('click');
            }
        }else if(type==5){//教辅
            if(this.decorateList){
                this.decorateList.getDecorateParameter('',id,'','','',rememberFlag);
                this.setState({
                    object:this.state.filterData.catalogId='',
                    object:this.state.filterData.coachbookCatalogId=id,
                    object:this.state.filterData.knowledgeId='',
                    object:this.state.filterData.collectId='',
                    object:this.state.filterData.paperId='',
                    object:this.state.filterData.specialId='',
                    object:this.state.filterData.categoryId='',
                    object:this.state.filterData.degree='',
                    //object:this.state.filterData.keyword='',
                  /*  flag:!this.state.flag*/
                });
                $('.typeNolimit').trigger('click');
                $('.degreeNolimit').trigger('click');
            }
        }
    }
    //跳转查看已选页面
    jumpViewSel(){
        //存储下当前筛选条件-以便从查看已选页面继续添加过来呈现原来题目
        localStorage.setItem("filterData",JSON.stringify(this.state.filterData));
        //跳转
        if(Number(this.refNum.innerText)>0){
            let fromwhere=this.props.params.fromwhere;//0 布置过来的 1 布置-查看已选-布置过来的 2 草稿-查看已选-布置过来的 3 测验-查看已选-布置过来的 4 再次编辑-查看已选-布置过来的
            if(fromwhere==0||fromwhere==1){
                hashHistory.push("/decorate-selected/"+this.state.draftId+'/0'+'/0'+'/1');
            }else if(fromwhere==2){
                hashHistory.push("/decorate-selected/"+this.state.draftId+'/0'+'/0'+'/2');
            }else if(fromwhere==3){
                hashHistory.push('/exercise-selected/'+'0'+'/'+this.state.draftId+'/3')
            }else if(fromwhere==4){
                hashHistory.push("/decorate-selected/"+this.state.draftId+'/0'+'/0'+'/4');
            }
       /*   const resultUpdateQuestion=saveDefault(loginToken,this.state.draftId,window.noticeDecorateQuestionIds,this.state.selNum);
                  resultUpdateQuestion.then(res=>{
                    return res.json()
                  }).then(json => {
                    // 处理获取的数据
                    const data = json
                    if (data.result) {

                    }
                  }).catch(ex =>{
                    // 发生错误
                    if (__DEV__) {
                        console.error('暂无数据, ', ex.message)
                    }
                  }) */

        }else{
            message.warning('请选择题目');
        }
        //重置-点击查看进去重置题目数未0，不做是否判断让不让切换menu
        //this.props.noticeDecorate.bind(this,0,this.state.noticeDecorateQuestionIds.substring(0,this.state.noticeDecorateQuestionIds.length-1),draftId)()

    }
    //查看已选-题目列表勾选通知方法
    viewSel(isShow,questionId){
        let draftId=this.state.draftId,//草稿id
            currentCatalogId=this.state.filterData.catalogId;//记录当前章节，方便选题时记录到数组window.catalogIds中
            if(isShow==true){//增加题目
                let newQuestionIds=window.noticeDecorateQuestionIds,
                        newQuestion=questionId.toString().split(','),
                        newCatalogIds=window.catalogIds;
                        newQuestion.forEach((item,index)=>{
                            if(!newQuestionIds.match(item)){
                                newQuestionIds+=(','+item);
                                //如果当前题目有章节就记录当前题目对应下的章节否则记作0
                                if(currentCatalogId!=''){
                                    newCatalogIds+=(','+currentCatalogId);
                                }else{
                                    newCatalogIds+=(','+'0');
                                }
                            }
                        })
                    if(newQuestionIds.substring(0,1)==','){
                        window.noticeDecorateQuestionIds=newQuestionIds.substring(1,newQuestionIds.length);
                        window.catalogIds=newCatalogIds.substring(1,newCatalogIds.length);
                    }else{
                        window.noticeDecorateQuestionIds=newQuestionIds;
                        window.catalogIds=newCatalogIds;
                    }
                    if(this.refNum){
                        this.refNum.innerText=window.noticeDecorateQuestionIds.split(',').length;
                    }
                    //通知主组件当前是否至少有一道题-如果是，离开提示
                    this.props.noticeDecorate.bind(this,window.noticeDecorateQuestionIds=='' ? 0 : window.noticeDecorateQuestionIds.split(',').length,window.noticeDecorateQuestionIds,window.catalogIds,draftId)()

            }else{//删除题目
                let newQuestionIds=window.noticeDecorateQuestionIds,//全局所选题目
                    newCatalogIds=window.catalogIds.split(','),//全局所选章节
                    newQuestion=questionId.toString().split(','),
                    currentIndex=newQuestionIds.split(',').indexOf(questionId.toString());////所选题目在全局所选题目中索引值
                        newQuestion.forEach((item,index)=>{
                            if(newQuestionIds.match(item)){
                                newQuestionIds=newQuestionIds.replace(','+item,'');//不是第一个
                                newQuestionIds=newQuestionIds.replace(item,'');//是第一个
                                //如果当前取消题目对应下章节就也要取消掉
                                newCatalogIds.splice(currentIndex,1);
                            }
                        })
                    if(newQuestionIds.substring(0,1)==','){
                        window.noticeDecorateQuestionIds=newQuestionIds.substring(1,newQuestionIds.length);
                        window.catalogIds=newCatalogIds.join(',');
                    }else{
                        window.noticeDecorateQuestionIds=newQuestionIds;
                        window.catalogIds=newCatalogIds.join(',');
                    }
                    if(this.refNum){
                        this.refNum.innerText=window.noticeDecorateQuestionIds!='' ? window.noticeDecorateQuestionIds.split(',').length : 0;
                    }
                    //通知主组件当前是否至少有一道题-如果是，离开提示
                    this.props.noticeDecorate.bind(this,window.noticeDecorateQuestionIds=='' ? 0 : window.noticeDecorateQuestionIds.split(',').length,window.noticeDecorateQuestionIds,window.catalogIds,draftId)()
            }
    }
    //浅拷贝对象-以便能监听到对象变化
    copy(obj){
        var newobj = {};
        for ( var attr in obj) {
            newobj[attr] = obj[attr];
        }
        return newobj;
    }
    //试卷筛选
    paperProvinceFilter(value){
        let provinceobj=this.copy.bind(this,this.state.paperSearchObj)();
            provinceobj.province=value;
            this.setState({
                paperSearchObj:provinceobj
            },()=>{
                 this.treeControl.getPaperInfoData(this.props.teacherInfo.stageId,this.props.teacherInfo.subjectId,value,'','','')
            })
    }
    paperGradeFilter(value){
        let gradeobj=this.copy.bind(this,this.state.paperSearchObj)();
            gradeobj.grade=value;
           this.setState({
                paperSearchObj:gradeobj
            },()=>{
                 this.treeControl.getPaperInfoData(this.props.teacherInfo.stageId,this.props.teacherInfo.subjectId,'',value,'','')
            })
    }
    paperYearFilter(value){
        let yearobj=this.copy.bind(this,this.state.paperSearchObj)();
            yearobj.year=value;
            this.setState({
                paperSearchObj:yearobj
            },()=>{
                 this.treeControl.getPaperInfoData(this.props.teacherInfo.stageId,this.props.teacherInfo.subjectId,'','',value,'')
            })
    }
    paperTypeFilter(value){
        let typeobj=this.copy.bind(this,this.state.paperSearchObj)();
            typeobj.type=value;
            this.setState({
                paperSearchObj:typeobj
            },()=>{
                 this.treeControl.getPaperInfoData(this.props.teacherInfo.stageId,this.props.teacherInfo.subjectId,'','','',value)
            })
    }
    //专题
    doProject(e){
        console.log(e.target)
        console.log('专题type1',e.target.getAttribute('value'))
        this.setState({
            projectType:e.target.getAttribute('value'),
            isShowProjectList:false
        })
    }
    //专题返回通知信息
    returnInfo(data){
        this.setState({
            isShowProjectList:true
        })
    }

    //配套教辅无缝滚动
    coachbookLeft(){
        //配套教辅无缝滚动-向左
        this.move.bind(this,130)();
    }
    coachbookRight(){
        //配套教辅无缝滚动-向右
        this.move.bind(this,-130)();
    }
    move(speed) {
        var oDiv = document.getElementById("coachbook-pic");
        var oUl = document.getElementById("coachbook-ul");
        var oLi = document.getElementsByTagName("li");
        var leftLimit='';
        leftLimit=-(oUl.offsetWidth-7*130);
        if(speed<0){
            if(oUl.offsetLeft!=leftLimit){
                oUl.style.left = oUl.offsetLeft + speed + "px";
            }
        }else{
            if(oUl.offsetLeft!=0){
               oUl.style.left = oUl.offsetLeft + speed + "px";
            }

        }
    }
    //版本选择
    coachbookVersionSel(e){
        let dataIndex=e.currentTarget.getAttribute('data-index'),
            coachbookInfoList=this.state.coachbookInfoList,
            currenNode=e.currentTarget,
            siblingsNode=[...e.currentTarget.parentNode.children].filter((child)=>child!==e.currentTarget);
            //教辅版本选中效果
            currenNode.classList.add('versionSel');
            for (let value of siblingsNode) {
                value.classList.remove('versionSel');
            }
            this.setState({
                coachLoadingShow:'none',
                coachbookList:coachbookInfoList[dataIndex].list,
                versionIndex:dataIndex
            },()=>{
                //每次切换到教辅-计算当前宽度
                setTimeout(()=>{
                    var oDiv = document.getElementById("coachbook-pic");
                    var oUl = document.getElementById("coachbook-ul");
                    var oLi = oUl.getElementsByTagName("li");
                    oUl.style.width = oLi.length *(oLi[0].offsetWidth+30)+ "px";
                    oDiv.style.width = oLi.length *(oLi[0].offsetWidth+30)+30+ "px";
                    console.log('无缝滚动',oUl.offsetWidth,oLi.length,oLi[0].offsetWidth)
                    oLi[0].click()
                },300)
            })
    }
    //教辅选择
    coachbookSel(e){
        let dataIndex=e.currentTarget.getAttribute('data-index'),
            stageId=this.props.teacherInfo.stageId,
            subjectId=this.props.teacherInfo.subjectId,
            versionIndex=this.state.versionIndex,
            currenNode=e.currentTarget,
            siblingsNode=[...e.currentTarget.parentNode.children].filter((child)=>child!==e.currentTarget),
            extParam=this.state.extParam+=1;
            this.treeControl.getCoachbookData(stageId,subjectId,extParam,versionIndex,dataIndex);
            //教辅选中效果
            currenNode.classList.add('sel-coachbook');
            for (let value of siblingsNode) {
                value.classList.remove('sel-coachbook');
            }

    }
}

// -------------------redux react 绑定--------------------
function mapStateToProps(state) {
    return {
        userinfo: state.userinfo
    }
}

function mapDispatchToProps(dispatch) {
    return {
    }
}
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DecorateHomework)
