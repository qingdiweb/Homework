/**
 * 题目详情
 */
import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import { Link, hashHistory } from 'react-router'
import { Menu, Icon , Button , Progress , Tabs , Radio , Breadcrumb,Spin} from 'antd';
import { specifyQuestionsStatistical} from '../../fetch/homework-report/homework-report'

import './style.less'
const TabPane = Tabs.TabPane;
const loginToken=localStorage.getItem("loginToken");
class HomeDetail extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
        this.state={
            topicDetail:{},//试题详情数据
            questionInfo:{},//试题详情
            homeworkId:'',//作业id
            flag:false,
            loadingShow:'block'
        }
    }
    componentWillMount(){
        let homeworkId=this.props.params.homeworkId,
            questionId=this.props.params.questionId;
            //获取作业详情数据
            this.specifyQuestionsStatistical.bind(this,loginToken,homeworkId,questionId)();
            //通知左侧menu导航-当前在那个menu下
            localStorage.setItem('positionMenu',JSON.stringify(['3']));

    }
    //获取作业详情数据
    specifyQuestionsStatistical(loginToken,homeworkId,questionId){
        const resultHomework=specifyQuestionsStatistical(loginToken,homeworkId,questionId);
                resultHomework.then(res => {
                    return res.json()
                }).then(json => {
                    // 处理获取的数据
                    const data = json
                    if (data.result) {
                       let topicListData=data.data.questionInfo;
                            if(typeof(topicListData.options)=='string'&&topicListData.options.indexOf('[')>-1){
                               topicListData.options=JSON.parse(topicListData.options);
                               console.log(topicListData.options)
                            }else if(topicListData.options==null||topicListData.options==''){
                                topicListData.options=[];
                            }
                            topicListData.knowledges=topicListData.knowledges==null||topicListData.knowledges==''  ? [] : topicListData.knowledges.split(',');//处理考点
                            topicListData.isShow='none';//初始化不显示解析

                            //循环遍历如果有子题，是多view时给小题加上isShow
                            if(topicListData.childQuestionInfoList!=null&&topicListData.childQuestionInfoList.length!=0){
                                topicListData.childQuestionInfoList.map((item,index)=>{
                                        if(typeof(item.options)=='string'&&item.options.indexOf('[')>-1){
                                           item.options=JSON.parse(item.options);
                                        }else if(item.options==null||item.options==''){
                                            item.options=[];
                                        }
                                        item.knowledges=item.knowledges==null||item.knowledges==''  ? [] : item.knowledges.split(',');//处理考点
                                        item.isShow='none';//初始化不显示解析
                                })
                            }
                            console.log('题目详情',topicListData)
                            this.setState({
                                topicDetail:data.data,
                                questionInfo:topicListData,
                                loadingShow:'none'
                            },()=>{
                                window.MathJax.Hub.Queue(["Typeset",window.MathJax.Hub,"output"]);
                            });


                            console.log('数目'+topicListData)
                    }
                }).catch(ex => {
                    // 发生错误
                    if (__DEV__) {
                        console.error('暂无数据, ', ex.message)
                    }
                })
    }

    render() {
        let questionInfo=this.state.questionInfo,
            topicDetail = this.state.topicDetail,
            degreeData="",//难度展示
            degreeTxt=questionInfo.degree/20,
            optionsNub=['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'],
            jumpType=this.props.params.type,//存储类型-判断是从哪个页面跳转到作业详情的
            classId=this.props.params.classId,//存储类型-判断是从哪个页面跳转到作业详情的
            breadcrumbTxt="";//面包屑
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
            console.log('正确率',topicDetail.accuracy)

            //面包屑
            if(jumpType==0){//作业首页过来的
                breadcrumbTxt=<Breadcrumb separator=">">
                                  <Breadcrumb.Item>
                                    <Link to='/index-homework'>课后作业</Link>
                                  </Breadcrumb.Item>
                                  <Breadcrumb.Item ><Link to={/homework-detail/+this.props.params.homeworkId+'/'+jumpType+'/0'}>作业批改</Link></Breadcrumb.Item>
                                  <Breadcrumb.Item>试题详情</Breadcrumb.Item>
                              </Breadcrumb>
            }else if(jumpType==2){//我的班级过来的
                breadcrumbTxt=<Breadcrumb separator=">">
                                  <Breadcrumb.Item>
                                    <Link to='/homework-class'>我的班级</Link>
                                  </Breadcrumb.Item>
                                  <Breadcrumb.Item>
                                    <Link to={'/homework-class-detail/'+classId}>班级详情</Link>
                                  </Breadcrumb.Item>
                                  <Breadcrumb.Item ><Link to={/homework-detail/+this.props.params.homeworkId+'/'+jumpType+'/'+classId}>作业批改</Link></Breadcrumb.Item>
                                  <Breadcrumb.Item>试题详情</Breadcrumb.Item>
                              </Breadcrumb>
            }
        return (
            <div className="homework-topic-detail">
                <h1 className='header-nav'>
                    {
                        breadcrumbTxt
                    }
                </h1>
                <Spin size="large" style={{"fontSize":"30px","display":this.state.loadingShow,'margin':'300px auto'}}/>
                {
                    Object.keys(topicDetail).length!=0&&Object.keys(questionInfo).length!=0&&<div>
                        <p className='common-sec-title' style={{marginBottom:'16px'}}><span className='sec-title-line'></span><span>答案统计</span></p>
                        <div className="answer-statistics">
                            <p className="statistics-data">
                                <span className="statistics-data-txt">正确率:</span>
                                <span className="statistics-data-num">{Math.round(topicDetail.accuracy*100)}%</span>
                            </p>
                            <p className="statistics-data">
                                <span className="statistics-data-txt">已交学生:</span>
                                <span className="statistics-data-num">{topicDetail.allCount-topicDetail.uncommittedNumber}人</span>
                            </p>
                            <p className="statistics-data">
                                <span className="statistics-data-txt">未交学生:</span>
                                <span className="statistics-data-num">{topicDetail.uncommittedNumber}人</span>
                            </p>
                            <p className="statistics-data">
                                <span className="statistics-data-txt">待批改:</span>
                                <span className="statistics-data-num">{topicDetail.uncheckedNumber}人</span>
                            </p>
                            {
                                JSON.stringify(questionInfo) != "{}"&&topicDetail.questionInfo4Current.canAnswer==0 ? <Button type="primary" className="correcting-btn" onClick={this.jumpCorrect.bind(this)}>批改</Button> : ''
                            }
                        </div>
                        <p className='common-sec-title' style={{marginBottom:'16px'}}><span className='sec-title-line'></span><span>试题详情</span></p>
                        <div className="topic-detail">
                        {
                            JSON.stringify(questionInfo) != "{}" ? <div>
                                                                    {
                                                                        questionInfo.childQuestionInfoList==null||questionInfo.childQuestionInfoList.length==0 ? <div className="topic-sec">
                                                                                        <div className="topic-sec-cont">
                                                                                            <div className="option-cont">
                                                                                                <h1 className='cont-title'><span>1丶</span><span className="topic-type">({questionInfo.category})</span><span dangerouslySetInnerHTML={{ __html: questionInfo.title }}></span></h1>
                                                                                                <div  className='parent-option-cont'>
                                                                                                    <div>
                                                                                                        {
                                                                                                            questionInfo.options instanceof Array && questionInfo.options.length>0 ? questionInfo.options.map((ele,i)=>{
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
                                                                                                            questionInfo.knowledges instanceof Array && questionInfo.knowledges.length>0 ? <p>
                                                                                                                <span className="title">考点</span>
                                                                                                                {
                                                                                                                    questionInfo.knowledges.map((ele,i)=>{
                                                                                                                        return <span className="exam-site" key={i}>{ele}</span>
                                                                                                                    })
                                                                                                                }
                                                                                                            </p> : ''
                                                                                                        }
                                                                                                    </div>
                                                                                                </div>

                                                                                            </div>
                                                                                            <h1 className="topic-sec-head">
                                                                                                <p className="show-parse"  data-showType={questionInfo.isShow} onClick={this.showParse.bind(this)}>
                                                                                                    {
                                                                                                        questionInfo.isShow=='none' ? <Icon type="eye-o" style={{width:'16px',marginRight:'8px',color: '#CECECE' }} /> : <Icon type="eye" style={{width:'16px',marginRight:'8px',color: '#2dbb55' }} />
                                                                                                    }
                                                                                                    显示解析
                                                                                                </p>
                                                                                                {/*<p className="collect default-sel"><img style={{display:'block'}} src="" alt=""/>收藏</p>*/}
                                                                                            </h1>
                                                                                            <div className="parse-cont" style={{'display':questionInfo.isShow}} data-flagValue={this.state.flag}>
                                                                                                {
                                                                                                    questionInfo.answerDetail!=''&&questionInfo.answerDetail!=null ? <p><span className="title">答案</span><span className="text" dangerouslySetInnerHTML={{ __html: questionInfo.answerDetail}}></span></p> : ''
                                                                                                }
                                                                                                {
                                                                                                    questionInfo.answerParsing!=''&&questionInfo.answerParsing!=null ? <p><span className="title">解析</span><span className="text" dangerouslySetInnerHTML={{ __html: questionInfo.answerParsing}}></span></p> : ''
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
                                                                                                    questionInfo.knowledges instanceof Array && questionInfo.knowledges.length>0 ? <p>
                                                                                                    <span className="title ">考点</span>
                                                                                                        {
                                                                                                            questionInfo.knowledges.map((ele,i)=>{
                                                                                                                return <span className="exam-site" key={i}>{ele}</span>
                                                                                                            })
                                                                                                        }
                                                                                                    </p> : ''
                                                                                                }
                                                                                            </div>

                                                                                        </div>
                                                                                    </div> : <div className="topic-sec" style={{border:'0px',padding:'0px'}}>
                                                                                                <div className="topic-sec-cont" style={{padding: '8px 16px 0px 16px',marginBottom:'16px',border:'1px solid #dfe2e5',backgroundColor:'rgba(246, 248, 250, 1)'}}>
                                                                                                    <div className="option-cont">
                                                                                                        <h1 className='cont-title'><span>1丶</span><span className="topic-type">({questionInfo.category})</span><span dangerouslySetInnerHTML={{ __html: questionInfo.title }}></span></h1>
                                                                                                    </div>
                                                                                                </div>
                                                                                                {
                                                                                                    questionInfo.childQuestionInfoList.map((item,index)=>{
                                                                                                        return <div className="topic-sec" key={index} style={{backgroundColor:topicDetail.questionInfo4Current.id==item.id ? 'rgba(45, 187, 85, 0.16)' : ''}}>
                                                                                                                    <div className="topic-sec-cont">
                                                                                                                        <div className="option-cont">
                                                                                                                            <h1  className='cont-title'><span>{'1.'+(index+1)+'丶'}</span><span className="topic-type">({item.category})</span><span dangerouslySetInnerHTML={{ __html: item.title }}></span></h1>
                                                                                                                            <div  className='child-option-cont'>
                                                                                                                                <div>
                                                                                                                                    {
                                                                                                                                        item.options instanceof Array && item.options.length>0 ? item.options.map((ele,i)=>{
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
                                                                                                                                        item.knowledges instanceof Array && item.knowledges.length>0 ? <p>
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


                                                                                                                        </div>
                                                                                                                        <h1 className="topic-sec-head">
                                                                                                                            <p className="show-parse"  data-showType={item.isShow}  data-index={index} onClick={this.showParse.bind(this)}>
                                                                                                                                {
                                                                                                                                    item.isShow=='none' ? <Icon type="eye-o" style={{width:'16px',marginRight:'8px',color: '#CECECE' }} /> : <Icon type="eye" style={{width:'16px',marginRight:'8px',color: '#2dbb55' }} />
                                                                                                                                }
                                                                                                                                显示解析
                                                                                                                            </p>
                                                                                                                            {/*<p className="collect default-sel"><img style={{display:'block'}} src="" alt=""/>收藏</p>*/}
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
                                                                                                                                item.knowledges instanceof Array && item.knowledges.length>0 ? <p>
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
                                                                    }
                                                                    </div>: <div style={{'font-size':'16px','text-align':'center','margin':'300px',"display":this.state.loadingShow=='block' ? 'none' : 'block'}}><Icon type="exclamation-circle" style={{marginRight:'5px',color:'rgba(255, 159, 0, 1)'}}/>暂无数据~</div>
                        }
                        <p style={{color: "rgba(119, 119, 119, 1)"}}>答题分析</p>
                        <div className="answer-analysis">
                            <p className="answer-student">
                                <b style={{float:"left",minWidth:"85px"}}>答对({topicDetail.rightNumber}人)：</b>
                                {
                                    JSON.stringify(questionInfo) != "{}"&&topicDetail.questionInfo4Current.canAnswer==1 ? <b style={{float:"left"}}>{topicDetail.questionInfo4Current.answer}选项</b> : ''
                                }
                                {
                                    JSON.stringify(questionInfo) != "{}"&&topicDetail.questionInfo4Current.canAnswer==0 ? <span className="answer-student-list answer-student-list-right">
                                                                    {
                                                                        topicDetail.rightNumber>0 ? topicDetail.rightStudentInfoList.map((item,index)=>{
                                                                            return <span style={{marginLeft:'0px',marginRight:'20px'}} key={item.id}>{item.nickname==null||'' ? "欧拉学生" : item.nickname}</span>
                                                                        }) : ''
                                                                    }
                                                                </span> : <span className="answer-student-list answer-student-list-right answer-student-list-option">
                                                                                {
                                                                                    !!topicDetail.numberList4Objectivity ? topicDetail.numberList4Objectivity.map((item,index)=>{
                                                                                        if(item.answer==topicDetail.questionInfo4Current.answer){
                                                                                            return item.studentInfoList.map((ele,i)=>{
                                                                                                        return <span key={ele.id}>{ele.nickname==null||'' ? "欧拉学生" : ele.nickname}</span>
                                                                                                    })
                                                                                        }

                                                                                    }) : ''
                                                                                }
                                                                            </span>
                                }

                            </p>
                             <p className="answer-student">
                                <b style={{float:"left",minWidth:"85px"}}>答错({topicDetail.wrongNumber}人)：</b>
                                {
                                    JSON.stringify(questionInfo) != "{}"&&topicDetail.questionInfo4Current.canAnswer==0 ? <div style={{"float":"left",width: "calc(100% - 85px)"}}>
                                                                    <span className= "answer-student-list answer-student-list-wrong">
                                                                        {
                                                                            topicDetail.wrongNumber>0 ? topicDetail.wrongStudentInfoList.map((item,index)=>{
                                                                                return <span style={{marginLeft:'0px',marginRight:'20px'}} key={item.id}>{item.nickname==null||'' ? "欧拉学生" : item.nickname}</span>
                                                                            }) : ''
                                                                        }
                                                                    </span>
                                                                </div> : <div style={{"float":"left",width: "calc(100% - 125px)"}}>
                                                                            {
                                                                                !!topicDetail.numberList4Objectivity ? topicDetail.numberList4Objectivity.map((item,index)=>{
                                                                                                if(item.answer!=topicDetail.questionInfo4Current.answer){
                                                                                                    return <p style={{"float":"left",width: '100%'}} key={index}>
                                                                                                                <b style={{float:"left"}}>{item.answer}选项</b>
                                                                                                                <span className="answer-student-list answer-student-list-wrong answer-student-list-option">
                                                                                                                    {
                                                                                                                        item.studentInfoList.map((ele,i)=>{
                                                                                                                            return <span key={ele.id}>{ele.nickname==null||'' ? "欧拉学生" : ele.nickname}</span>
                                                                                                                        })
                                                                                                                    }
                                                                                                                </span>
                                                                                                            </p>
                                                                                                }

                                                                                            }) : ''

                                                                            }
                                                                        </div>
                                }

                            </p>
                            {
                                JSON.stringify(questionInfo) != "{}"&&topicDetail.questionInfo4Current.canAnswer==0 ? <p className="answer-student">
                                                                <b style={{float:"left",minWidth:"85px"}}>半对({topicDetail.halfNumber}人)：</b>
                                                                <span className="answer-student-list answer-student-list-half">
                                                                    {
                                                                        topicDetail.halfNumber>0 ? topicDetail.halfStudentInfoList.map((item,index)=>{
                                                                            return <span style={{marginLeft:'0px',marginRight:'20px'}} key={item.id}>{item.nickname==null||'' ? "欧拉学生" : item.nickname}</span>
                                                                        }) : ''
                                                                    }
                                                                </span>
                                                            </p> : ''
                            }

                             <p className="answer-student">
                                <b style={{float:"left",minWidth:"85px"}}>未交({topicDetail.uncommittedNumber}人)：</b>
                                <span className={JSON.stringify(questionInfo) != "{}"&&topicDetail.questionInfo4Current.canAnswer==0 ? "answer-student-list answer-student-list-right" : "answer-student-list answer-student-list-no answer-student-list-option"}>
                                    {
                                        topicDetail.uncommittedNumber>0 ? topicDetail.uncommittedStudentInfoList.map((item,index)=>{
                                            return <span key={item.id} className="uncommitted-answer-student">{item.nickname==null||'' ? "欧拉学生" : item.nickname}</span>
                                        }) : ''
                                    }
                                </span>
                            </p>
                        </div>
                        </div>
                    </div>
                }

            </div>
        )
    }
    //试题报告 学生报告
    callback(e){

    }
    //查看解析
    showParse(e){
        let isShow=e.currentTarget.getAttribute('data-showType'),
            questionInfo=this.state.questionInfo;
            if(questionInfo.childQuestionInfoList==null||questionInfo.childQuestionInfoList.length==0){
                if(isShow=='none'){
                    let topicLists=questionInfo;
                        topicLists.isShow='block';
                        this.setState({topicList:topicLists,flag:!this.state.flag});
                }else{
                    let topicLists=questionInfo;
                        topicLists.isShow='none';
                        this.setState({topicList:topicLists,flag:!this.state.flag});
                }
            }else{
                let questionIndex=e.currentTarget.getAttribute('data-index');
                if(isShow=='none'){
                    let topicLists=questionInfo;
                        topicLists.childQuestionInfoList[questionIndex].isShow='block';
                        this.setState({topicList:topicLists,flag:!this.state.flag});
                }else{
                    let topicLists=questionInfo;
                        topicLists.childQuestionInfoList[questionIndex].isShow='none';
                        this.setState({topicList:topicLists,flag:!this.state.flag});
                }
            }

    }
    //跳转批改
    jumpCorrect(e){
         let homeworkId=this.state.topicDetail.homeworkId,
            questionId=this.state.topicDetail.questionId,
            correctType=1;//存储类型-判断是从哪个页面跳转到作业批改的 0 作业详情跳转 1 试题详情跳转 2学生报告跳转
            hashHistory.push('/correct-homework/' + encodeURIComponent(homeworkId)+'/'+ encodeURIComponent(questionId)+'/0/0'+'/'+this.props.params.type+'/'+this.props.params.classId);
            //存储类型-判断是从哪个页面跳转到作业详情的
            localStorage.setItem('correctType',correctType);
    }
}

export default HomeDetail
