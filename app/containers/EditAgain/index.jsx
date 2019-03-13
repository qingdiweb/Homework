/**
 * 课后作业 - 再次编辑
 */
import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import { Link, hashHistory } from 'react-router'
import { fromJS } from 'immutable';
import { DraggableArea, DraggableAreasGroup} from 'react-draggable-tags';
import { Radio , Checkbox , Select , Icon , Input , Modal , Row , Col , Button,Breadcrumb,Spin} from 'antd';
import { getDefaultQuestionList , toDraft} from '../../fetch/decorate-homework/decorate-homework'
import Pagination from '../../Components/Pagination';

import './style.less'

const Option = Select.Option;
const loginToken=localStorage.getItem("loginToken");
class EditAgain extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
        this.state={
            topicList:[],//题目列表
            topicListLen:'',//数据条数
            flag:false,
            loadingShow:'block',//加载图标
            topicId:'',//题目id
            currentPage:1
        }

    }

    componentWillMount(){
       let draftId=this.props.params.draftId,
            pageNumber=-1,//第一页
            pageSize=-1;//一页数据数
            this.getDefaultQuestionList.bind(this,loginToken,draftId,pageNumber,pageSize)();

    }
    //获取题目数据
    getDefaultQuestionList(loginToken,draftId,pageNumber,pageSize){
        const resultTextbook = getDefaultQuestionList(loginToken,draftId,pageNumber,pageSize);
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
                                //topicListData[i].topicIndex=pageNumber*5+i+1;

                            }
                            this.setState({
                                topicList:topicListData,
                                topicListLen:data.data.pageable.totalSize,
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
    render() {
        console.log('render题目列表',this.state.topicList)
        let jumpType=this.props.params.jumpType,//存储类型-判断是从哪个页面跳转到作业再次编辑
            type=this.props.params.type,//存储类型-判断是从哪个页面跳转到再次编辑
            classId=this.props.params.classId,//存储类型-判断是从哪个页面跳转到再次编辑
            breadcrumbTxt="";//面包屑
            if(jumpType==0){//作业首页过来的
                if(type==0){
                    breadcrumbTxt=<Breadcrumb separator=">">
                                    <Breadcrumb.Item><Link to='/index-homework'>课后作业</Link></Breadcrumb.Item>
                                    <Breadcrumb.Item><Link to={/homework-detail/+this.props.params.homeworkId+'/'+jumpType+'/0'}>作业批改</Link></Breadcrumb.Item>
                                    <Breadcrumb.Item >再次编辑</Breadcrumb.Item>
                                </Breadcrumb>
                }else{
                    breadcrumbTxt=<Breadcrumb separator=">">
                                    <Breadcrumb.Item><Link to='/index-homework'>课后作业</Link></Breadcrumb.Item>
                                    <Breadcrumb.Item><Link to={/homework-statistical/+this.props.params.homeworkId+'/'+jumpType+'/0'}>作业报告</Link></Breadcrumb.Item>
                                    <Breadcrumb.Item >再次编辑</Breadcrumb.Item>
                                </Breadcrumb>
                }
            }else if(jumpType==2){//我的班级过来的
                if(type==0){
                    breadcrumbTxt=<Breadcrumb separator=">">
                                      <Breadcrumb.Item>
                                        <Link to='/homework-class'>我的班级</Link>
                                      </Breadcrumb.Item>
                                      <Breadcrumb.Item>
                                        <Link to={'/homework-class-detail/'+classId}>班级详情</Link>
                                      </Breadcrumb.Item>
                                      <Breadcrumb.Item>
                                        <Link to={/homework-detail/+this.props.params.homeworkId+'/'+jumpType+'/'+classId}>作业批改</Link>
                                      </Breadcrumb.Item>
                                      <Breadcrumb.Item >再次编辑</Breadcrumb.Item>
                                  </Breadcrumb>
                }else{
                    breadcrumbTxt=<Breadcrumb separator=">">
                                      <Breadcrumb.Item>
                                        <Link to='/homework-class'>我的班级</Link>
                                      </Breadcrumb.Item>
                                      <Breadcrumb.Item>
                                        <Link to={'/homework-class-detail/'+classId}>班级详情</Link>
                                      </Breadcrumb.Item>
                                      <Breadcrumb.Item>
                                        <Link to={/homework-statistical/+this.props.params.homeworkId+'/'+jumpType+'/'+classId}>作业报告</Link>
                                      </Breadcrumb.Item>
                                      <Breadcrumb.Item >再次编辑</Breadcrumb.Item>
                                  </Breadcrumb>
                }

            }
        return (
            <div className='edit-again'>
                <h1 className='header-nav'>
                    {
                        breadcrumbTxt
                    }
                  </h1>
                <div className="edit-search clear-fix">
                    <Button className="edit-again-btn" onClick={this.editAgain.bind(this)}>再次编辑</Button>
                </div>
                <div id="decorate-list" className="clear-fix">
                    <div style={{"display":this.state.loadingShow}}>
                        <Spin size="large" style={{"fontSize":"30px","display":'block','margin':'300px auto'}}/>
                    </div>
                    {
                        this.state.topicList.length>0 ? this.state.topicList.map((item,index)=>{
                                                                let degreeData="",//难度展示
                                                                    degreeTxt=item.degree/20,
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
                                                                                    <h1 className='cont-title'><span>{index+1}、</span><span className="topic-type">({item.category})</span><span dangerouslySetInnerHTML={{ __html: item.title }}></span></h1>
                                                                                    <div>
                                                                                        {
                                                                                            item.options.length>0 ? item.options.map((ele,i)=>{
                                                                                                return <p key={i}><span className="option">{optionsNub[i]}</span><span className='option-cont-html' dangerouslySetInnerHTML={{ __html: ele }}></span></p>
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
                                                                                </h1>
                                                                                 <div className="parse-cont" style={{'display':item.isShow}} data-flagValue={this.state.flag}>
                                                                                    {
                                                                                        item.answerDetail!=''&&item.answerDetail!=null ? <p><span className="title">答案</span><span className="text" dangerouslySetInnerHTML={{ __html: item.answerDetail}}></span></p> : ''
                                                                                    }
                                                                                    {
                                                                                        item.answerParsing!=''&&item.answerParsing!=null ? <p><span className="title">解析</span><span className="text" dangerouslySetInnerHTML={{ __html: item.answerParsing}}></span></p> : ''
                                                                                    }
                                                                                    {/*<p><span className="title">题源</span><span className="text" dangerouslySetInnerHTML={{ __html: item.source}}></span></p>*/}
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
                                                                })  : <div style={{'fontSize':'16px','textAlign':'center','margin':'300px auto',"display":this.state.loadingShow=='block' ? 'none' : 'block'}}><Icon type="exclamation-circle" style={{marginRight:'5px',color:'rgba(255, 159, 0, 1)'}}/>暂无数据~</div>
                    }
                    {/*<Pagination currentPage={this.state.currentPage} topicListLen={this.state.topicListLen} paginationSel={this.paginationSel.bind(this)}/>*/}
                </div>
            </div>
        )
    }
    //生成草稿
    toDraft(loginToken,homeworkId){
        const resultToDraft = toDraft(loginToken,homeworkId);
                resultToDraft.then(res => {
                    return res.json()
                }).then(json => {
                    // 处理获取的数据
                    const data = json
                    if (data.result) {
                        let draftId=data.data.id,
                            filterData={
                                catalogId:"",//章节id
                                knowledgeId:"",//知识点id
                                collectId:"",//习题集id
                                paperId:'',//试卷id
                                specialId:'',//专题
                                categoryId:"",//题型id
                                degree:"",//难度id
                                loadingShow:'block'//加载loading
                            };
                            localStorage.setItem("filterData",JSON.stringify(filterData));
                            hashHistory.push('/decorate-selected/'+draftId+'/'+this.props.params.homeworkId+'/'+this.props.params.draftId+'/4')
                    }
                }).catch(ex => {
                    // 发生错误
                    if (__DEV__) {
                        console.error('暂无数据, ', ex.message)
                    }
                })
    }
    //再次编辑
    editAgain(){
        let homeworkId=this.props.params.homeworkId,
            noticeDecorateQuestionIds='',
            catalogIds='',
            storageObj={'jumpType':this.props.params.jumpType,'type':this.props.params.type,'classId':this.props.params.classId}
            this.state.topicList.forEach((item,index)=>{
                noticeDecorateQuestionIds+=item.id+',';
                catalogIds+='0'+',';
            })
            window.noticeDecorateQuestionIds=noticeDecorateQuestionIds.substr(0,noticeDecorateQuestionIds.length-1);
            window.catalogIds=catalogIds.substr(0,catalogIds.length-1);
            this.toDraft.bind(this,loginToken,homeworkId)();
            //存储路由参数
            localStorage.setItem('storageObj',JSON.stringify(storageObj))
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
        let draftId=this.props.params.draftId,
            pageNumber=page-1,//第一页
            pageSize=5;//一页数据数
            this.getDefaultQuestionList.bind(this,loginToken,draftId,pageNumber,pageSize)();
    }

}

export default EditAgain
