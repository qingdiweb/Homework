import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import { Tree, Input ,Icon,Modal,Radio,Spin} from 'antd';
import { getMaterialListData, getMaterialCatalogData,getKnowledgeListData, getCollectListData , getPaperData,getCoachbookData,getLastOperation} from '../../fetch/decorate-homework/decorate-homework'
import './style.less'
import * as Constants from '../../Constants/store'

const DirectoryTree = Tree.DirectoryTree;
const TreeNode = Tree.TreeNode;
const RadioGroup = Radio.Group;
const loginToken=localStorage.getItem("loginToken");
class TreeList extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
        this.state = {
            gData:[],
            expandedKeys: [],
            selectedKeys:[],
            versionInfoList:[],//版本
            textbookInfoList:[],//教材同步
            catalogList:[],//章节
            coachbookInfoList:[],//教辅
            knowledgeInfoList:[],//知识点
            collectInfoList:[],//习题集
            paperInfoList:[],//试卷
            flag:true,
            treeLoading:true,
            textbookLoading:true,
            switchVisible:false,
            materialSelVal:'',
            coachbookCollection:{},
            lastOperation:{},//查询最后操作的教材(教辅)和章节
            defaultExpandedKeys:[],
            defaultSelectedKeys:[],
            coachbookDefaultExpandedKeys:[],
            coachbookDefaultSelectedKeys:[],
            timeStamp:(new Date()).getTime(),
            extParam:0//扩展参数-用来防止连续调取接口，上一个接口返回慢导致数据不准确问题
          }
    }
    componentWillMount() {
        console.log('teacherInfo',teacherInfo)
        //教师信息
        let teacherInfo=JSON.parse(localStorage.getItem("teacherInfo")),//教师信息
            stageId=teacherInfo.stageId,//学段
            subjectId=teacherInfo.subjectId,//学科
            type=this.props.type,//1 教材同步 2 知识点 3 收藏
            questionId=0,
            extParam=this.state.extParam;
            //获取教材信息
            this.getMaterialListData.bind(this,stageId,subjectId,extParam)().then((versiondata)=>{
                //查询最后操作的教材id-将上一次操作的章节更新树结构上面去
                this.getLastOperation.bind(this,loginToken)().then((data)=>{
                    let lastOperation=data,
                        lastTextbookId=Constants.isFormat(lastOperation.textbook,String) ? (stageId!=lastOperation.textbook.lastStageId||subjectId!=lastOperation.textbook.lastSubjectId) ? versiondata[0].textbookInfoList[0].textbookId : lastOperation.textbook.lastTextbookId : versiondata[0].textbookInfoList[0].textbookId;
                        this.getMaterialCatalogData.bind(this,loginToken,lastTextbookId,0)()

                })
            });
    }
    componentDidMount(){
    }
    //获取版本教材信息
    getMaterialListData(stageId,subjectId,extParam){
        this.state.extParam=extParam;
        //每次先置空树结构数据
        this.state.gData=[];
        this.state.treeLoading=true;
        //获取教材数据
        return new Promise((resolve,reject)=>{
            const resultTextbook = getMaterialListData(stageId,subjectId,extParam)
                resultTextbook.then(res => {
                    return res.json()
                }).then(json => {
                    // 处理获取的数据
                    const data = json
                    if (data.result) {
                        let extParam=data.extParam,
                            versionInfoList=data.data;
                            if(extParam==this.state.extParam){
                                resolve(data.data)
                                this.setState({
                                    versionInfoList:versionInfoList
                                })
                            }
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
        let teacherInfo=JSON.parse(localStorage.getItem("teacherInfo")),//教师信息
            stageId=teacherInfo.stageId,//学段
            subjectId=teacherInfo.subjectId;//学科
            const resultTextbookCatalog = getMaterialCatalogData(loginToken,textbookId,extParam)
                resultTextbookCatalog.then(res => {
                    return res.json()
                }).then(json => {
                    // 处理获取的数据
                    const data = json
                    if (data.result) {
                        let catalogList=data.data,
                            gData=this.dealrenderTreeNodes(catalogList,'catalogInfoList'),
                            extParam=data.extParam;
                            //必须满足有教材的情况下
                            if(Constants.isFormat(catalogList,Array)){
                                if(extParam==0){//初始化展示上次选择章节高亮
                                    //查询最后操作的教材(教辅)和章节
                                    this.getLastOperation.bind(this,loginToken)().then((data)=>{
                                        let lastOperation=data,
                                            defaultExpandedKeys=Constants.isFormat(lastOperation.textbook,String) ? (stageId!=lastOperation.textbook.lastStageId||subjectId!=lastOperation.textbook.lastSubjectId) ? [gData[0].id.toString()] : [...lastOperation.textbook.lastCatalogIds.split(',')] : [gData[0].id.toString()],
                                            textbookShift=Constants.isFormat(lastOperation.textbook,String) ? (stageId!=lastOperation.textbook.lastStageId||subjectId!=lastOperation.textbook.lastSubjectId) ? gData[0].id.toString() : lastOperation.textbook.lastCatalogIds.split(',').shift() : gData[0].id.toString(),
                                            textbookPop=Constants.isFormat(lastOperation.textbook,String) ? (stageId!=lastOperation.textbook.lastStageId||subjectId!=lastOperation.textbook.lastSubjectId) ? gData[0].id.toString() : lastOperation.textbook.lastCatalogIds.split(',').pop() : gData[0].id.toString();
                                           /* textbookIndex=gData.findIndex((e)=>e.id==textbookShift);//查出上次教材id所在教材目录中的索引，找出那本教材*/
                                            this.props.noticeTree.bind(this,1,textbookPop)();
                                            this.setState({
                                                gData:gData.length!=0 ? gData : [],
                                                catalogList:gData,
                                                defaultExpandedKeys:defaultExpandedKeys,
                                                defaultSelectedKeys:[textbookPop],
                                                treeLoading:false,
                                                timeStamp:(new Date()).getTime()
                                            }) 
                                            //全局存储当前章节名字
                                            let catalogNames=Constants.recursiveName(catalogList,'catalogInfoList',textbookPop);
                                                window.catalogNames=catalogNames
                                                

                                    }).catch((ex)=>{
                                        console.log("暂无数据 "+ex.message)
                                    }) 
                                }else{//弹窗选择教材
                                    this.props.noticeTree.bind(this,1,gData[0].id)();
                                    this.setState({
                                        gData:gData.length!=0 ? gData : [],
                                        catalogList:gData,
                                        defaultExpandedKeys:[gData[0].id.toString()],
                                        defaultSelectedKeys:[gData[0].id.toString()],
                                        treeLoading:false,
                                        timeStamp:(new Date()).getTime()
                                    })
                                }
                            }else{
                                this.props.noticeTree.bind(this,1,'')();
                            }
                            

                    }
                }).catch(ex => {
                    // 发生错误
                    if (__DEV__) {
                        console.error('暂无数据, ', ex.message)
                    }
                })
    }
    //请求教辅信息
    getCoachbookData(stageId,subjectId,extParam,versionIndex,index){
        this.state.extParam=extParam;
        //每次先置空树结构数据
        this.state.gData=[];
        this.state.treeLoading=true;
         //请求教辅数据
        const resultCoachbookData = getCoachbookData(stageId,subjectId,extParam)
              resultCoachbookData.then(res => {
                   return res.json()
               }).then(json => {
                   // 处理获取的数据
                   const data = json
                   if (data.result) {
                        let coachbookCollection=data.data,
                            coachbookInfoList=Constants.isFormat(coachbookCollection,Array) ? coachbookCollection[versionIndex].list[index].coachbookInfoList : [],
                            gData=[],
                            expandedKeys=[],
                            extParam=data.extParam;
                            if(coachbookInfoList.length==0){
                                gData=[];
                            }else{
                                gData=this.dealrenderTreeNodes(coachbookInfoList,'catalogInfoList');
                            }
                            //通知父组件教辅
                            this.props.noticeCoachbookData.bind(this,coachbookInfoList,coachbookCollection)()
                            //必须满足有教辅的情况下
                            if(Constants.isFormat(coachbookInfoList,Array)){
                                if(extParam==this.state.extParam){
                                    this.setState({
                                        gData:gData.length!=0 ? [gData[0]] : [],
                                        coachbookInfoList:gData,
                                        coachbookCollection:Constants.isFormat(coachbookCollection,Array) ? coachbookCollection[versionIndex].list[index] : [],
                                        treeLoading:false,
                                    })
                                    //查询最后操作的教材(教辅)和章节
                                    this.getLastOperation.bind(this,loginToken)().then((data)=>{
                                        let lastOperation=data,
                                            defaultExpandedKeys=Constants.isFormat(lastOperation.coachbook,null) ? [...lastOperation.coachbook.lastCatalogIds.split(',')] : [coachbookInfoList[0].id.toString()],
                                            coachbookShift=Constants.isFormat(lastOperation.coachbook,null) ? lastOperation.coachbook.lastCatalogIds.split(',').shift() : coachbookInfoList[0].id.toString(),
                                            coachbookPop=Constants.isFormat(lastOperation.coachbook,null) ? lastOperation.coachbook.lastCatalogIds.split(',').pop() : coachbookInfoList[0].id.toString();
                                            //教辅中切换-比对最后一次选题的顶级结构id是否与当前教辅树结构顶级结构id相同（不相同就传顶级id查题，如果相同的话就用上次last选过题目id查题）
                                            if(coachbookInfoList[0].id==coachbookShift){
                                                this.props.noticeTree.bind(this,5,coachbookPop)();
                                                this.setState({
                                                    coachbookDefaultExpandedKeys:defaultExpandedKeys,
                                                    coachbookDefaultSelectedKeys:[coachbookPop],
                                                    timeStamp:(new Date()).getTime()
                                                })
                                            }else{
                                                this.props.noticeTree.bind(this,5,coachbookInfoList[0].id)();
                                                this.setState({
                                                    coachbookDefaultExpandedKeys:[coachbookInfoList[0].id.toString()],
                                                    coachbookDefaultSelectedKeys:[coachbookInfoList[0].id.toString()],
                                                    timeStamp:(new Date()).getTime()
                                                })
                                            }
                                            //全局存储当前章节名字
                                            let catalogNames=Constants.recursiveName(coachbookInfoList,'catalogInfoList',coachbookPop);
                                                window.catalogNames=catalogNames
                                    }).catch((ex)=>{
                                        console.log("暂无数据 "+ex.message)
                                    }) 
                                }
                            }else{
                                this.props.noticeTree.bind(this,5,'')();
                                this.setState({
                                    treeLoading:false
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
    
    //获取知识点信息
    getKnowledgeListData(stageId,subjectId,extParam){
        this.state.extParam=extParam;
        //每次先置空树结构数据
        this.state.gData=[];
        this.state.treeLoading=true;
        //获取知识点数据
        const resultKnowledge = getKnowledgeListData(stageId,subjectId,extParam)
            resultKnowledge.then(res => {
                return res.json()
            }).then(json => {
                // 处理获取的数据
                const data = json
                if (data.result) {
                    let knowledgeInfoList=data.data.knowledgeInfoList,
                        gData=[],
                        expandedKeys=[],
                        extParam=data.extParam;
                        gData=this.dealrenderTreeNodes(knowledgeInfoList,'knowledgeInfoList');
                        //必须满足有知识点的情况下
                        if(Constants.isFormat(knowledgeInfoList,Array)){
                            if(extParam==this.state.extParam){
                                this.setState({
                                    gData:gData.length!=0 ? gData : [],
                                    knowledgeInfoList:gData.length!=0 ? gData : [],
                                    treeLoading:false,
                                    expandedKeys:gData.length!=0 ? [gData[0].id.toString()] : [],
                                    selectedKeys:gData.length!=0 ? [gData[0].id.toString()] : [],
                                    timeStamp:(new Date()).getTime()
                                })
                                //初始化加载将知识点id传给子组件
                                let id=gData.length>0 ? gData[0].title : '';
                                    this.props.noticeTree.bind(this,2,id.toString())();
                            }
                        }else{
                             this.props.noticeTree.bind(this,2,'')();
                             this.setState({
                                treeLoading:false
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
    //获取试卷信息
    getPaperInfoData(stageId,subjectId,provinceId,gradeId,yearInt,type,extParam){
        this.state.extParam=extParam;
        //每次先置空树结构数据
        this.state.gData=[];
        this.state.treeLoading=true;
        //获取试卷列表
        const resultPaper = getPaperData(stageId,subjectId,provinceId,gradeId,yearInt,type,extParam)
            resultPaper.then(res => {
                return res.json()
            }).then(json => {
                // 处理获取的数据
                const data = json
                if (data.result) {
                    let paperInfoList=data.data.content,
                        gData=[],
                        expandedKeys=[],
                        extParam=data.extParam;
                        for (var i = 0; i < paperInfoList.length; i++) {
                            gData.push({});
                            gData[i].title=paperInfoList[i].id;
                            gData[i].key=paperInfoList[i].name;
                            gData[i].children=[];
                        }
                        //必须满足有试卷的情况下
                        if(Constants.isFormat(paperInfoList,Array)){
                            if(extParam==this.state.extParam){
                                this.setState({
                                    paperInfoList:gData.length!=0 ? gData : [],
                                    gData:gData.length!=0 ? gData : [],
                                    treeLoading:false,
                                    expandedKeys:gData.length!=0 ? [gData[0].title.toString()] : [],
                                    selectedKeys:gData.length!=0 ? [gData[0].title.toString()] : [],
                                    timeStamp:(new Date()).getTime()
                                })
                                //初始化加载将收藏id传给子组件
                                let paperId=gData.length>0 ? gData[0].title : '';
                                    this.props.noticeTree.bind(this,4,paperId.toString())();
                            }
                        }else{
                            this.props.noticeTree.bind(this,4,'')();
                            this.setState({
                                treeLoading:false
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
    //获取习题列表信息
    getCollectListData(loginToken,questionId,extParam){
        this.state.extParam=extParam;
        //每次先置空树结构数据
        this.state.gData=[];
        this.state.treeLoading=true;
        //获取收藏列表
        const resultCollect = getCollectListData(loginToken,questionId,extParam)
            resultCollect.then(res => {
                return res.json()
            }).then(json => {
                // 处理获取的数据
                const data = json
                if (data.result) {
                    let collectInfoList=data.data,
                        gData=[],
                        expandedKeys=[],
                        extParam=data.extParam;
                        for (var i = 0; i < collectInfoList.length; i++) {
                            gData.push({});
                            gData[i].title=collectInfoList[i].id;
                            gData[i].key=collectInfoList[i].name;
                            gData[i].children=[];
                        }
                        //必须满足有习题的情况下
                        if(Constants.isFormat(collectInfoList,Array)){
                            if(extParam==this.state.extParam){
                                this.setState({
                                    gData:gData.length!=0 ? gData : [],
                                    collectInfoList:gData.length!=0 ? gData : [],
                                    treeLoading:false,
                                    expandedKeys:gData.length!=0 ? [gData[0].title.toString()] : [],
                                    selectedKeys:gData.length!=0 ? [gData[0].title.toString()] : [],
                                    timeStamp:(new Date()).getTime()
                                })
                                //初始化加载将收藏id传给子组件
                                let id=gData.length>0 ? gData[0].title : '';
                                    this.props.noticeTree.bind(this,3,id.toString())();
                            }
                        }else{
                            this.props.noticeTree.bind(this,3,'')();
                            this.setState({
                                treeLoading:false
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
    //查询最后操作的教材(教辅)和章节
    getLastOperation(loginToken){
        return new Promise((resolve,reject)=>{
            const resultLastOperation = getLastOperation(loginToken);
                    resultLastOperation.then(res => {
                        return res.json()
                    }).then(json => {
                        // 处理获取的数据
                        const data = json
                        if (data.result) {
                            let lastOperation=data.data;
                            this.setState({
                                lastOperation:lastOperation
                            })
                            resolve(lastOperation)
                         }   
                    }).catch(ex => {
                        // 发生错误
                        if (__DEV__) {
                            reject("暂无数据 "+ex.message)
                        }
                    }) 
        })
           
    }
    
    //调出弹窗
    switchMaterial(){
        let teacherInfo=JSON.parse(localStorage.getItem("teacherInfo")),//教师信息
            stageId=teacherInfo.stageId,//学段
            subjectId=teacherInfo.subjectId;//学科
            this.setState({
              switchVisible:true
            },()=>{
                if(this.props.type==1){//教材
                    let myEvent = new Event('click'),
                        versiontag=document.getElementById('left-sec').getElementsByTagName('span');
                        //找到当前版本和教材高亮     
                        this.getLastOperation.bind(this,loginToken)().then((data)=>{
                            let lastOperation=data,
                                lastTextbookId=Constants.isFormat(lastOperation.textbook,String) ? (stageId!=lastOperation.textbook.lastStageId||subjectId!=lastOperation.textbook.lastSubjectId) ? this.state.catalogList[0].textbookId : lastOperation.textbook.lastTextbookId : this.state.catalogList[0].textbookId;
                                this.state.versionInfoList.forEach((item,index)=>{
                                    item.textbookInfoList.forEach((ele,i)=>{
                                        if(ele.textbookId==lastTextbookId){//能在弹窗列表中找到
                                            versiontag[index].click();
                                        }else{//不能在弹窗列表中找到(可能切换了版本和科目)
                                            versiontag[0].click();
                                        }
                                    })
                                })
                                this.setState({
                                    materialSelVal:parseInt(lastTextbookId)
                                })
                        }).catch((ex)=>{
                            console.log("暂无数据 "+ex.message)
                        })                
                        
                }else{//教辅
                    this.setState({
                        materialSelVal:this.state.gData.length!=0 ? this.state.gData[0].title : ''
                    })
                }
            });
    }
    //切换版本
    versionSel(e){
        let self=e.currentTarget,
            editionId=self.getAttribute('data-id'),
            siblingsNode=[...self.parentNode.children].filter((child)=>child!==self),
            textbookInfoList=this.state.versionInfoList.find((e)=>e.editionId==editionId).textbookInfoList;
            self.classList.add('modalversionSel');
            for (let value of siblingsNode) { 
                value.classList.remove('modalversionSel');
            }
            this.setState({
                textbookInfoList:textbookInfoList,
                textbookLoading:true
            },()=>{
                setTimeout(()=>{
                    this.setState({
                        textbookLoading:false
                    })
                },100)
            })
    }
    //切换教材
    switchMaterialOk(e){
        if(this.props.type==1){//教材
            this.getMaterialCatalogData.bind(this,loginToken,this.state.materialSelVal,1)()
            this.setState({
                switchVisible:false
            })
        }else{//教辅
            this.state.coachbookInfoList.forEach((item,index)=>{
                if(item.title==this.state.materialSelVal){
                    this.setState({
                        gData:[item],
                        treeLoading:false,
                        switchVisible:false
                    },()=>{
                        let id=this.state.gData.length>0 ? this.state.gData[0].title : '';
                            this.props.noticeTree.bind(this,this.props.type,id.toString())();
                            //每次切换教辅下教材的时候就高亮选中当前顶级树结构
                            this.setState({
                                coachbookDefaultExpandedKeys:[id.toString()],
                                coachbookDefaultSelectedKeys:[id.toString()],
                                timeStamp:(new Date()).getTime()
                            })
                    })
                }
            })
        }
    }
    switchMaterialCancel(e){
        this.setState({
          switchVisible:false
        });
    }
    //选择教材
    materialSel(e){
        console.log('选择教材',e.target.value)
        this.setState({
          materialSelVal: e.target.value,
        });
    }
    render() {
        this.state.versionInfoList.forEach((item,index)=>{
            item.label=item.edition;
            item.value=item.editionId;
        })
        this.state.textbookInfoList.length!=0&&this.state.textbookInfoList.forEach((item,index)=>{
            item.label=item.textbookName;
            item.value=item.textbookId;
        })
        this.state.coachbookInfoList.forEach((item,index)=>{
            item.label=item.key;
            item.value=item.title;
        })
        return (
            <div className='tree-content'>
                {
                    this.props.type==1||this.props.type==5 ? <span className='switch-material' onClick={this.switchMaterial.bind(this)}><span>{this.props.type==1 ? '切换教材' : '切换教辅'}</span><b></b></span> : ''
                }
                {
                    this.state.treeLoading&&<Spin size="small" style={{"fontSize":"30px","display":'block','margin':'30px auto 0px'}}/>
                }
                {
                  this.state.gData.length!=0 ?  <DirectoryTree
                        key={this.state.timeStamp}
                        defaultExpandedKeys={this.props.type==1 ? this.state.defaultExpandedKeys : this.props.type==5 ? this.state.coachbookDefaultExpandedKeys : this.state.expandedKeys}
                        defaultSelectedKeys={this.props.type==1 ? this.state.defaultSelectedKeys : this.props.type==5 ? this.state.coachbookDefaultSelectedKeys : this.state.selectedKeys}
                        showIcon={false}
                        multiple
                        onSelect={this.onSelect.bind(this)}
                      >
                        {this.renderTreeNodes(this.state.gData)}
                      </DirectoryTree> : !this.state.treeLoading&&<div style={{textAlign:'center',margin:'70px auto'}}>
                      <Icon type="exclamation-circle" style={{marginRight:'5px',color:'rgba(255, 159, 0, 1)'}}/>暂无数据</div>
                }
                <Modal
                  title={this.props.type==1 ? "切换教材" : '切换教辅'}
                  className={this.props.type==1 ? 'swich-materia-modal' : 'swich-coachbook-modal'}
                  visible={this.state.switchVisible}
                  cancelText="取消"
                  okText="确定"
                  width='440px'
                  onOk={this.switchMaterialOk.bind(this)}
                  onCancel={this.switchMaterialCancel.bind(this)}
                >
                <div>
                    {
                        this.props.type==1 ? <div className='material-sel'>
                            <div id="left-sec" className='left-sec'>
                            {
                                this.state.versionInfoList.map((item,index)=>{
                                    return <span className="versiontag" title={item.title} key={item.value} data-id={item.value} onClick={this.versionSel.bind(this)}>{item.label}</span>
                                })
                            }
                            </div>
                            <div className='right-sec'>
                                {
                                    this.state.textbookLoading&&<Spin size="small" style={{"fontSize":"30px","display":'block','margin':'100px auto 0px'}}/>
                                }
                                {
                                    this.state.textbookInfoList.length!=0&&!this.state.textbookLoading ? <RadioGroup options={this.state.textbookInfoList} value={this.state.materialSelVal}  onChange={this.materialSel.bind(this)} /> : !this.state.textbookLoading&&<div style={{textAlign:'center',clear:'both',marginBottom:'10px'}}>
                                    <Icon type="exclamation-circle" style={{margin:'100px auto',display:'block',color:'rgba(255, 159, 0, 1)'}}/>该版本下暂无教材</div>
                                }
                            </div>    
                            
                      </div> : <div className='coachbook-sel'>
                            {
                             this.props.type==5&&<span className='coachbook-modal-name'>{Object.keys(this.state.coachbookCollection)!=0 ? this.state.coachbookCollection.name : ''}</span>
                            }
                            {
                                this.state.coachbookInfoList.length!=0 ? <RadioGroup options={this.state.coachbookInfoList} value={this.state.materialSelVal}  onChange={this.materialSel.bind(this)} /> : <div style={{textAlign:'center',clear:'both',marginBottom:'10px'}}>
                                 <Icon type="exclamation-circle" style={{marginRight:'5px',color:'rgba(255, 159, 0, 1)'}}/>该教辅下暂无数据</div>
                            }
                      </div>
                    }
                </div>
                  
                </Modal>

            </div>
          
        );
    }
    onSelect(id,info){
        let rememberFlag=1,//只有手动选择的时候才记录此次选择的题目的记录-方便下次再切换回来显示之前展开数据
            catalogNames='';//存储章节名字
            catalogNames+=(','+info.selectedNodes[info.selectedNodes.length-1].props.title);
            if(id.length==0){//取消当前选题-type传0
                this.props.noticeTreeSel.bind(this,0,id.toString(),rememberFlag)();
            }else{//选择当前题
                this.props.noticeTreeSel.bind(this,this.props.type,id.toString(),rememberFlag)();
            }
            //存储章节名字
            window.catalogNames=catalogNames.substring(1,catalogNames.length)
    }
  renderTreeNodes(data){
    return data.map((item) => {
      if (item.children) {
        return (
          <TreeNode title={item.key} key={item.title} dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode {...item} dataRef={item} />;
    });
  }
   dealrenderTreeNodes(datavalue,childvalue){
        datavalue.map((item) => {
            item.title=item.id;
            item.key=item.name;
            if (item[childvalue]) {
                item.children=item[childvalue];
                this.dealrenderTreeNodes(item[childvalue],childvalue)
            }else{
                item.children=[];
            }
        });
        return datavalue
    }
}


export default TreeList