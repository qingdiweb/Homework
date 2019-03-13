/**
 * 课堂记录-题目详情
 */
import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import { Link, hashHistory } from 'react-router'
import { Radio , Checkbox , Button , Icon , message , Carousel , Breadcrumb,Spin,Progress,Modal} from 'antd';
import { getExerciseTopicDetail} from '../../fetch/classroom-exercise/classroom-exercise'
import * as Constants from '../../Constants/store'
import './style.less'

const loginToken=localStorage.getItem("loginToken");
const defaultAvatar=require('../../static/img/default-avatar.png');
class ClassroomRecordTopicDetail extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
        this.state={
            allTopicList:{},//全部数据
            topicList:{},//题目过来-列表
            topicListLen:'',//题目过来-数据条数
            flag:false,
            isCheck:'block',//判断列表什么时候显示可选题目按钮
            loadingShow:'block',//加载图标
            topicId:'',//题目id
            visible:false,
            stuAnswerSrc:''//学生答案
        }

    }
    componentWillMount(){
        let quizId=this.props.params.exerciseId,//练习id
            questionId=this.props.params.questionId;//题目id
            //获取题目详情
             this.getExerciseTopicDetail.bind(this,loginToken,quizId,questionId)();
    }

    //获取题目数据
    getExerciseTopicDetail(loginToken,quizId,questionId){
        const resultExerciseTopicDetail = getExerciseTopicDetail(loginToken,quizId,questionId);
                resultExerciseTopicDetail.then(res => {
                    return res.json()
                }).then(json => {
                    // 处理获取的数据
                    const data = json
                    if (data.result) {
                        let allTopicList=data.data,
                            topicListData=allTopicList.questionInfo;
                            topicListData=Constants.dealQuestion(topicListData,'');
                            //给题目列表添加序列号
                            topicListData.topicIndex=1;
                            //循环遍历如果有子题，是多view时给小题加上isShow
                            topicListData.childQuestionInfoList=Constants.dealQuestion(topicListData.childQuestionInfoList,'');
                            //显示题对应下学生展示
                            allTopicList.resultList.forEach((item)=>{
                                if(Constants.isFormat(item.resultList4Objectivity,Array)){
                                    item.resultList4Objectivity.forEach((ele)=>{
                                         ele.isStuShow=true
                                    })
                                }

                            })
                            this.setState({
                                allTopicList:allTopicList,
                                topicList:topicListData,
                                isCheck:'block',
                                loadingShow:'none'
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

        let allTopicList=this.state.allTopicList,
            topicList=this.state.topicList,
            degreeData="",//难度展示
            degreeTxt=Constants.isFormat(topicList,Object) ? topicList.degree/20 : 0,
            optionsNub=['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
            console.log('查询',allTopicList.resultList)
            //计算难度
            if(!!degreeTxt){
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
            }
            return (
                <div className='classroom-record-topic-detail clear-fix'>
                    <h1 className='header-nav'>
                        <Breadcrumb separator=">">
                            <Breadcrumb.Item><Link to='/classroom-record'>课堂记录</Link></Breadcrumb.Item>
                            <Breadcrumb.Item ><Link to={'classroom-record-detail/'+this.props.params.exerciseId}>查看记录</Link></Breadcrumb.Item>
                            <Breadcrumb.Item >试题详情</Breadcrumb.Item>
                        </Breadcrumb>
                    </h1>
                    <p className='common-sec-title'><span className='sec-title-line'></span><span>试题详情</span></p>
                    <Spin size="large" style={{"fontSize":"30px","display":this.state.loadingShow,'margin':'200px auto'}}/>
                    {
                        Constants.isFormat(topicList,Object) ? <div>
                                                            {
                                                                topicList.childQuestionInfoList==null||topicList.childQuestionInfoList.length==0 ?  <div className="topic-sec">
                                                                                <div className="topic-sec-cont">
                                                                                    <div className="option-cont">
                                                                                        <h1 className='cont-title'><span>{topicList.topicIndex}丶</span><span className="topic-type">({topicList.category})</span><span dangerouslySetInnerHTML={{ __html: topicList.title }}></span></h1>
                                                                                        <div  className='parent-option-cont'>
                                                                                            <div>
                                                                                                {
                                                                                                    topicList.options.length>0 ? topicList.options.map((ele,i)=>{
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
                                                                                                    topicList.knowledges.length>0 ? <p>
                                                                                                        <span className="title">考点</span>
                                                                                                        {
                                                                                                            topicList.knowledges.map((ele,i)=>{
                                                                                                                return <span className="exam-site" key={i}>{ele}</span>
                                                                                                            })
                                                                                                        }
                                                                                                    </p> : ''
                                                                                                }
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                    <h1 className="topic-sec-head">
                                                                                        <p className="show-parse"  data-showType={topicList.isShow} onClick={this.showParse.bind(this)}>
                                                                                            {
                                                                                                topicList.isShow=='none' ? <Icon type="eye-o" style={{width:'16px',marginRight:'8px',color: '#CECECE' }} /> : <Icon type="eye" style={{width:'16px',marginRight:'8px',color: '#2dbb55' }} />
                                                                                            }
                                                                                            显示解析
                                                                                        </p>
                                                                                        {/*<p className="collect default-sel"><img style={{display:'block'}} src={require('../../static/img/collect-sel.png')} alt=""/>收藏</p>*/}
                                                                                    </h1>
                                                                                     <div className="parse-cont" style={{'display':topicList.isShow}} data-flagValue={this.state.flag}>
                                                                                        {
                                                                                            topicList.answer!=''&&topicList.answer!=null ? <p><span className="title">答案</span><span className="text" dangerouslySetInnerHTML={{ __html: topicList.answer}}></span></p> : ''
                                                                                        }
                                                                                        {
                                                                                            topicList.answerDetail!=''&&topicList.answerDetail!=null ? <p><span className="title">解析</span><span className="text" dangerouslySetInnerHTML={{ __html: topicList.answerDetail}}></span></p> : ''
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
                                                                                            topicList.knowledges.length!=0 ? <p>
                                                                                            <span className="title ">考点</span>
                                                                                                {
                                                                                                    topicList.knowledges.map((ele,i)=>{
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
                                                                                                <h1 className='cont-title'><span>{topicList.topicIndex}丶</span><span className="topic-type">({topicList.category})</span><span dangerouslySetInnerHTML={{ __html: topicList.title }}></span></h1>
                                                                                            </div>
                                                                                        </div>
                                                                                        {
                                                                                            topicList.childQuestionInfoList.map((item,index)=>{
                                                                                                if(Object.keys(item).length!=0){
                                                                                                    return <div className="topic-sec" key={index} style={{backgroundColor:this.state.stuIndex==topicList.topicIndex-1+index ? 'rgba(45, 187, 85, 0.16)' : ''}}>
                                                                                                            <div className="topic-sec-cont">
                                                                                                                <div className="option-cont">
                                                                                                                    <h1 className='cont-title'><span>{(topicList.topicIndex)+'.'+(index+1)+'丶'}</span><span className="topic-type">({item.category})</span><span dangerouslySetInnerHTML={{ __html: item.title }}></span></h1>
                                                                                                                    <div  className='child-option-cont'>
                                                                                                                        <div>
                                                                                                                            {
                                                                                                                                item.options instanceof Array && item.options.length>0 ? item.options.map((ele,i)=>{
                                                                                                                                    return <p key={i}><span className="option">{optionsNub[i]}</span><span className='option-cont-html'  dangerouslySetInnerHTML={{ __html: ele }}></span></p>
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
                                                                                                                    <p className="show-parse"  data-showType={item.isShow}  data-check={index} onClick={this.showParse.bind(this)}>
                                                                                                                        {
                                                                                                                            item.isShow=='none' ? <Icon type="eye-o" style={{width:'16px',marginRight:'8px',color: '#CECECE' }} /> : <Icon type="eye" style={{width:'16px',marginRight:'8px',color: '#2dbb55' }} />
                                                                                                                        }
                                                                                                                        显示解析
                                                                                                                    </p>
                                                                                                                    {/*<p className="collect default-sel"><img style={{display:'block'}} src="" alt=""/>收藏</p>*/}
                                                                                                                </h1>
                                                                                                                <div className="parse-cont" style={{'display':item.isShow}} data-flagValue={this.state.flag}>
                                                                                                                    {
                                                                                                                        item.answer!=''&&item.answer!=null ? <p><span className="title">答案</span><span className="text" dangerouslySetInnerHTML={{ __html: item.answer}}></span></p> : ''
                                                                                                                    }
                                                                                                                    {
                                                                                                                        item.answerDetail!=''&&item.answerDetail!=null ? <p><span className="title">解析</span><span className="text" dangerouslySetInnerHTML={{ __html: item.answerDetail}}></span></p> : ''
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
                                                                                                }

                                                                                            })
                                                                                        }
                                                                                      </div>
                                                            }
                                                            </div> : <div style={{'fontSize':'16px','textAlign':'center','margin':'300px auto',"display":this.state.loadingShow=='block' ? 'none' : 'block'}}><Icon type="exclamation-circle" style={{marginRight:'5px',color:'rgba(255, 159, 0, 1)'}}/>暂无数据~</div>
                    }
                    <p className='common-sec-title'><span className='sec-title-line'></span><span>答题详情</span></p>
                    <div className="answer-detail">
                    {
                        Constants.isFormat(allTopicList,Object)&&allTopicList.resultList.length!=0 ? this.state.allTopicList.resultList.map((item,index)=>{
                            let canAnswer=item.questionInfo.canAnswer,//0不可作答(主观题) 1 可作答(客观题)
                                resultList4Objectivity=item.resultList4Objectivity,//可作答(客观题)
                                resultList4Subjectivity=item.resultList4Subjectivity;//不可作答(主观题)
                                if(canAnswer==0){
                                    return <div className='answer-detail-sec sub-answer-detail-sec' key={index}>
                                                <p>
                                                {
                                                    topicList.childQuestionInfoList==null||topicList.childQuestionInfoList.length==0 ? '' : ('1.'+(index+1))
                                                }
                                                </p>
                                                {
                                                    resultList4Subjectivity.length!=0 ?  resultList4Subjectivity.map((ele,i)=>{
                                                            return <div className="student-sec" key={i} data-index={i}>
                                                                        {
                                                                            Constants.isFormat(ele.studentQuizAnswerInfo,Object)&&ele.studentQuizAnswerInfo.state==1&&<span className="look-btn" data-answer={Constants.isFormat(ele.studentQuizAnswerInfo,Object) ? ele.studentQuizAnswerInfo.answer : ''} onClick={this.lookAnswer.bind(this)}>查看</span>
                                                                        }
                                                                        <img src={Constants.isFormat(ele.studentAvatarUrl,String) ? ele.studentAvatarUrl : defaultAvatar} alt="" className="head-portrait"/>
                                                                        <div className='stu-name-state'>
                                                                            <span className="stu-name" title={Constants.isFormat(ele.studentName,String) ? ele.studentName : '欧拉学生'}>{Constants.isFormat(ele.studentName,String) ? ele.studentName : '欧拉学生'}</span>
                                                                            {
                                                                                Constants.isFormat(ele.studentQuizAnswerInfo,Object) ? ele.studentQuizAnswerInfo.state==1 ? <span className="stu-finish-state">已完成</span> : <span className="stu-nocommit-state">未提交</span> : <span className="stu-nocommit-state">未提交</span>
                                                                            }
                                                                        </div>

                                                                    </div>
                                                        })  : '暂无数据'
                                                }
                                    </div>
                                }else{
                                    return <div className='answer-detail-sec' key={index}>
                                                <p>
                                                {
                                                    topicList.childQuestionInfoList==null||topicList.childQuestionInfoList.length==0 ? '' : ('1.'+(index+1))
                                                }
                                                </p>
                                                {
                                                    resultList4Objectivity.length!=0 ?  resultList4Objectivity.map((ele,i)=>{
                                                            return <div className="option-sec" key={i} data-index={i}>
                                                                        <div className="option-progress">
                                                                            <span className='option-title'>
                                                                                {ele.answer}
                                                                            </span>
                                                                            <div className='stu-progress'>
                                                                                <Progress strokeColor='rgba(45, 187, 85, 1)' strokeWidth={6} percent={(ele.studentNumber/allTopicList.quizInfo.allCount)*100} showInfo={false} status="active"/>
                                                                            </div>
                                                                            <div className='stu-num'>
                                                                                <span >
                                                                                    {ele.studentNumber+'人'}
                                                                                </span>
                                                                                <span className='drop-down-arrow' data-index={index} data-ele={i} onClick={this.stuFold.bind(this)}>
                                                                                    <Icon type="down" />
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                        {
                                                                            ele.isStuShow ? Constants.isFormat(ele.studentNames,String)&&<div className="option-student">
                                                                                <b className='san_shang'></b>
                                                                                {
                                                                                    ele.studentNames.split(',').map((stuTag,stuIndex)=>{
                                                                                        return <span key={stuIndex}>{Constants.isFormat(stuTag,String) ? stuTag : '欧拉学生'}</span>
                                                                                    })
                                                                                }
                                                                            </div> : ''
                                                                        }

                                                                    </div>
                                                        })  : '暂无数据'
                                                }
                                    </div>
                                }

                        }) : ''
                    }
                    </div>
                    <Modal
                      title="学生答案"
                      visible={this.state.visible}
                      className='stuAnswerModal'
                      cancelText="取消"
                      okText="确定"
                      footer={null}
                      onCancel={this.handleCancel.bind(this)}
                    >
                     <div className={Constants.isFormat(this.state.stuAnswerSrc,String) ? 'answer-modal-box-scroll' : 'answer-modal-box'}>
                        {
                             Constants.isFormat(this.state.stuAnswerSrc,String) ? this.state.stuAnswerSrc.split(',').map((item,index)=>{
                                return <div className={index==this.state.stuAnswerSrc.split(',').length-1 ? 'answer-box' : 'answer-box-border'}>
                                            <img src={this.state.stuAnswerSrc} alt=""/>
                                        </div>
                             }) : <div style={{'fontSize':'16px','textAlign':'center','margin-top':'200px',"display":'block'}}><Icon type="exclamation-circle" style={{marginRight:'5px',color:'rgba(255, 159, 0, 1)'}}/>暂无答案~</div>
                        }
                     </div>
                    </Modal>
                </div>
            )
    }
    //查看学生答案
    lookAnswer(e){
        let stuAnswerSrc=e.currentTarget.getAttribute('data-answer');//学生答案
        console.log('答案',stuAnswerSrc)
        this.setState({
            stuAnswerSrc:stuAnswerSrc,
            visible:true
        })
    }
    handleCancel(){
         this.setState({
            visible:false
        })
    }
    //查看解析
    showParse(e){
        let topicList=this.state.topicList,
            isShow=e.currentTarget.getAttribute('data-showType');
            if(topicList.childQuestionInfoList==null||topicList.childQuestionInfoList.length==0){
                if(isShow=='none'){
                    let topicLists=this.state.topicList;
                        topicLists.isShow='block';
                        this.setState({topicList:topicLists,flag:!this.state.flag});
                }else{
                    let topicLists=this.state.topicList;
                        topicLists.isShow='none';
                        this.setState({topicList:topicLists,flag:!this.state.flag});
                }
            }else{
                let datacheck=e.currentTarget.getAttribute('data-check');
                if(isShow=='none'){
                    let topicLists=this.state.topicList;
                        topicLists.childQuestionInfoList[datacheck].isShow='block';
                        this.setState({topicList:topicLists,flag:!this.state.flag});
                }else{
                    let topicLists=this.state.topicList;
                        topicLists.childQuestionInfoList[datacheck].isShow='none';
                        this.setState({topicList:topicLists,flag:!this.state.flag});
                }
            }

    }
    //学生展开收起
    stuFold(e){
        let resultIndex=e.currentTarget.getAttribute('data-index'),//result数组中索引
            targetIndex=e.currentTarget.getAttribute('data-ele'),//学生数组中索引
            allTopicList=this.state.allTopicList,
            currentisStuShow=allTopicList.resultList[resultIndex].resultList4Objectivity[targetIndex].isStuShow;//当前状态
            e.preventDefault();
            if(currentisStuShow==true){
                allTopicList.resultList[resultIndex].resultList4Objectivity[targetIndex].isStuShow=false;
            }else{
                allTopicList.resultList[resultIndex].resultList4Objectivity[targetIndex].isStuShow=true;
            }
            this.setState({
                allTopicList,
                flag:!this.state.flag
            })
    }
}

export default ClassroomRecordTopicDetail
