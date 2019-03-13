/**
 * 课后作业 - 作业报告
 */
import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import { Link, hashHistory } from 'react-router'
import { Menu, Icon , Button , Progress , Tabs , Breadcrumb,Table,Spin} from 'antd';
import Highcharts from 'react-highcharts';
import { getHomeworkQuestion , getHomeworkStudent} from '../../fetch/homework-report/homework-report';
import { getResultStatistical , getKnowledgeStatistical} from '../../fetch/homework-statistical/homework-statistical';
import './style.less'
const TabPane = Tabs.TabPane;
const clockImg=require("../../static/img/clock.png");
const loginToken=localStorage.getItem("loginToken");
const defaultGraph=require('../../static/img/default-graph.png');
const title={
    text: '班级成绩分布图',
    x: -20 //center
}

const chart={
    type: 'column'
}
const xAxis={
    type: 'category',
    categories: [],
    labels: {
        //对横坐标刻度值进行格式化
        formatter: function() {
            var labelVal = this.value;
            var reallyVal='';
            var lvl = labelVal.length;
            if(labelVal.substr(0,3)=='不及格'){
                reallyVal = labelVal.substr(0,3)+"<br/>"+labelVal.substring(3,lvl);
            }else{
                reallyVal = labelVal.substr(0,2)+"<br/>"+labelVal.substring(2,lvl);
            }
            return reallyVal;
        }


    }
}
const yAxis={
    title: {
        text: '人数'
    },
    plotLines: [{
        value: 0,
        width: 1,
        color: '#2DBB55'
    }],
    allowDecimals:false,
    ceiling:'',
    max:''
}
const colors=['#2DBB55']
const tooltip={
   enabled: false,
}
const legend={
    layout: 'vertical',
    align: 'right',
    verticalAlign: 'middle',
    borderWidth: 0
}
const credits = {
    enabled: false   // 隐藏highcharts版权
}
const plotOptions={
    series: {
        borderWidth: 0,
        dataLabels: {
            enabled: true,
            format: '{point.y:.0f}人'
        }
    }
}
const series=[{
    name: '成绩',
    data: [/*{
        name:'不及格',
        y:10
    },{
        name:'及格',
        y:10
    },{
        name:'良好',
        y:10
    },{
        name:'优秀',
        y:10
    }*/]
}]

class HomeStatis extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
        this.state={
            resultStatisticalInfoList:{},//成绩统计信息
            knowledgeStatisticalInfoList:[],//获取知识点统计信息
            isShowModal:false,//显示删除提示弹窗框
            homeworkId:'',//作业id
            flag:false,
            columns: [
                {
                    title: '学生总数',
                    dataIndex: 'allCount',
                    width: '10%',
                    align:'center'

                },
                {
                    title: '提交人数',
                    dataIndex: 'committedCount',
                    width: '10%',
                    align:'center'
                },
                {
                    title: '平均正确率',
                    dataIndex: 'classAccuracy',
                    width: '10%',
                    align:'center'
                },
                {
                    title: '平均用时',
                    dataIndex: 'avgAnswerSecond',
                    width: '10%',
                    align:'center'
                },
                {
                    title: '是否全部提交',
                    dataIndex: 'isALLCommit',
                    width: '10%',
                    align:'center'
                },
            ],
            stuHomeworkColumns: [
                {
                    title: '学生名字',
                    dataIndex: 'name',
                    width: '10%',
                    align:'center'

                },
                {
                    title: '正确率',
                    dataIndex: 'accuracy',
                    width: '10%',
                    align:'center'
                },
                {
                    title: '用时',
                    dataIndex: 'avgAnswerSecond',
                    width: '10%',
                    align:'center'
                }
            ],
            knowledgeColumns: [
                {
                    title: '知识点名称',
                    dataIndex: 'knowledgeName',
                    width: '10%',
                    align:'center'

                },
                {
                    title: '对应试题',
                    dataIndex: 'questionNos',
                    width: '10%',
                    align:'center'
                },
                {
                    title: '平均正确率',
                    dataIndex: 'accuracy',
                    width: '10%',
                    align:'center'
                }
            ],
            knowledgeStuColumns: [
                {
                    title: '学生名字',
                    dataIndex: 'name',
                    width: '10%',
                    align:'center'

                },
                {
                    title: '正确率',
                    dataIndex: 'accuracy',
                    width: '10%',
                    align:'center'
                },
                {
                    title: '是否提交',
                    dataIndex: 'state',
                    width: '10%',
                    align:'center'
                },
                {
                    title: '考点掌握程度',
                    dataIndex: 'avgAccuracy',
                    width: '10%',
                    align:'center'
                }
            ],
            homeworkStuAna: [],
            stuHomeworkAua:[],
            knowledgeAna:[],
            knowledgeStuAna:[],
            config: {
                /*series: []*/
            },
            loadingShow:'block'
        }
    }
    componentWillMount(){
        let homeworkId=this.props.params.homeworkId;
            //获取成绩统计信息
            this.getResultStatistical.bind(this,loginToken,homeworkId)();
            //获取知识点统计
            this.getKnowledgeStatistical.bind(this,loginToken,homeworkId)();
    }
    //获取成绩统计信息
    getResultStatistical(loginToken,homeworkId){
        this.setState({
            loadingShow:'block'
        })
        const resultHomeworkStudent=getResultStatistical(loginToken,homeworkId);
                resultHomeworkStudent.then(res => {
                    return res.json()
                }).then(json => {
                    // 处理获取的数据
                    const data = json
                    if (data.result) {
                        let content=data.data,
                            homeworkQuestionInfoList=content.questionInfoList==null||'' ? [] : content.questionInfoList,
                            inputTime=new Date(content.abortAt),//截止时间
                            publishTime=new Date(content.publishAt),//发布时间
                            newDateParse=Date.parse(new Date()),//当前时间戳
                            //Y=inputTime.getFullYear()+'-',
                            M=inputTime.getMonth()+1<10 ? '0'+(inputTime.getMonth()+1)+'月' : (inputTime.getMonth()+1)+'月',
                            D=inputTime.getDate()<10 ? '0'+inputTime.getDate()+'日' : inputTime.getDate()+'日',
                            Hours=inputTime.getHours() < 10 ? "0" + inputTime.getHours() : inputTime.getHours(),
                            Minute=inputTime.getMinutes() < 10 ? "0" + inputTime.getMinutes() : inputTime.getMinutes(),
                            PublishY=publishTime.getFullYear()+'-',
                            PublishM=publishTime.getMonth()+1<10 ? '0'+(publishTime.getMonth()+1)+'-' : (publishTime.getMonth()+1)+'-',
                            PublishD=publishTime.getDate()<10 ? '0'+publishTime.getDate()+'' : publishTime.getDate()+'',
                            PublishHours=publishTime.getHours() < 10 ? "0" + publishTime.getHours() : publishTime.getHours(),
                            PublishMinute=publishTime.getMinutes() < 10 ? "0" + publishTime.getMinutes() : publishTime.getMinutes();
                            content.newAbortAt=' '+M+D+' '+Hours+':'+Minute;
                            content.newPublishAt='创建时间:'+' '+PublishY+PublishM+PublishD+' '+PublishHours+':'+PublishMinute;
                            //content[i].newPublishAt='创建时间:'+'  '+PublishY+PublishM+PublishD+' '+PublishHours+':'+PublishMinute;

                            //如果当前时间大于截止时间，就标红，提示已截止
                            console.log("当前时间戳",newDateParse)
                            console.log("截止时间戳",content.abortAt)
                            if(newDateParse>content.abortAt){
                                content.isAsShow='inline-block';
                                content.isNotAsShow='none';
                            }else{
                                content.isAsShow='none';
                                content.isNotAsShow='inline-block';
                            }
                            //如果状态为2，那么就是有需要批改的
                            if(content.state==2){
                                content.isNeedCorrect='inline-block';
                                content.isDetail='none';
                            }else{
                                content.isNeedCorrect='none';
                                content.isDetail='inline-block';
                            }
                            //是否全部提交
                            if(content.allCount==content.committedCount){
                                content.isALLCommit='是'
                            }else{
                                content.isALLCommit='否'
                            }
                            //处理班级成绩列表
                            content.classAccuracy=Math.round(content.accuracy)+'%';
                            if(content.avgAnswerSecond!=null){
                                if(content.avgAnswerSecond>60){
                                    if(parseInt(content.avgAnswerSecond)/60>60){
                                        content.avgAnswerSecond=parseInt(content.avgAnswerSecond/60/60)+'小时'+parseInt(content.avgAnswerSecond/60)+'分'+parseInt(content.avgAnswerSecond)%60+'秒'
                                    }else{
                                        content.avgAnswerSecond=parseInt(content.avgAnswerSecond/60)+'分'+parseInt(content.avgAnswerSecond)%60+'秒'
                                    }
                                }else{
                                    content.avgAnswerSecond=content.avgAnswerSecond+'秒'
                                }
                            }else{
                                content.avgAnswerSecond='--'
                            }
                            //处理折线图数据
                            xAxis.categories=[];
                            series[0].data=[];
                            let newxAxis=['不及格', '及格', '良好','优秀'];
                            content.scoreStatInfoList.forEach((item,index) => {
                                let personObj={name:item.title,y:Number(item.number)};
                                    xAxis.categories.push(newxAxis[index]+item.title);
                                    series[0].data.push(personObj);
                            })
                            yAxis.ceiling=Number(content.allCount);//设置最大y轴值
                            yAxis.max=Number(content.allCount);//设置最大y轴值

                            //处理学生作业统计数据
                            let studentInfoList=[];
                            content.studentInfoList.forEach(item => {
                                //处理用时
                                let answerSecond='';
                                if(item.studentHomworkInfo!=null&&item.studentHomworkInfo.answerSecond!=null&&item.studentHomworkInfo.state>=2){
                                    if(item.studentHomworkInfo.answerSecond>60){
                                        if(parseInt(item.studentHomworkInfo.answerSecond)/60>60){
                                            answerSecond=parseInt(item.studentHomworkInfo.answerSecond/60/60)+'小时'+parseInt(item.studentHomworkInfo.answerSecond/60)+'分'+parseInt(item.studentHomworkInfo.answerSecond)%60+'秒'
                                        }else{
                                            answerSecond=parseInt(item.studentHomworkInfo.answerSecond/60)+'分'+parseInt(item.studentHomworkInfo.answerSecond)%60+'秒'
                                        }
                                    }else{
                                        answerSecond=item.studentHomworkInfo.answerSecond+'秒'
                                    }
                                }else{
                                    answerSecond='--'
                                }
                                let studentInfoListObj={};
                                    studentInfoListObj.name=item.nickname!=null ? item.nickname : '欧拉学生';
                                    studentInfoListObj.accuracy=item.studentHomworkInfo!=null&&item.studentHomworkInfo.reviewAccuracy!=null&&item.studentHomworkInfo.state>=2 ? Math.round(item.studentHomworkInfo.reviewAccuracy)+'%' : '--';
                                    studentInfoListObj.avgAnswerSecond=answerSecond;
                                    studentInfoList.push(studentInfoListObj)
                            })
                            this.setState({
                                config: {
                                    chart:chart,
                                    title: title,
                                    legend: legend,
                                    tooltip: tooltip,
                                    colors:colors,
                                    xAxis:xAxis,
                                    yAxis:yAxis,
                                    plotOptions:plotOptions,
                                    credits:credits,
                                    series:series
                                },
                                resultStatisticalInfoList:content,
                                homeworkStuAna:[content],
                                stuHomeworkAua:studentInfoList,
                                loadingShow:'none'
                            })
                    }
                }).catch(ex => {
                    // 发生错误
                    if (__DEV__) {
                        console.error('暂无数据, ', ex.message)
                    }
                })
    }
    //获取知识点统计
    getKnowledgeStatistical(loginToken,homeworkId){
        const resultHomeworkStudent=getKnowledgeStatistical(loginToken,homeworkId);
                resultHomeworkStudent.then(res => {
                    return res.json()
                }).then(json => {
                    // 处理获取的数据
                    const data = json
                    if (data.result) {
                        let content=data.data;
                            content.knowledgeStatInfoList.forEach((item,index)=>{
                                item.accuracy=Math.round(item.avgAccuracy)+'%'
                            })
                            this.setState({
                                knowledgeStatisticalInfoList:content,
                                knowledgeAna:content.knowledgeStatInfoList
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
        let resultStatisticalInfoList=this.state.resultStatisticalInfoList,
            knowledgeStatisticalInfoList=this.state.knowledgeStatisticalInfoList,
            jumpType=this.props.params.type,//存储类型-判断是从哪个页面跳转到作业详情的
            classId=this.props.params.classId,//存储类型-判断是从哪个页面跳转到作业详情的
            breadcrumbTxt="";//面包屑
            if(jumpType==0){//作业首页过来的
                breadcrumbTxt=<Breadcrumb separator=">"><Breadcrumb.Item><Link to='/index-homework'>课后作业</Link></Breadcrumb.Item><Breadcrumb.Item>作业报告</Breadcrumb.Item></Breadcrumb>
            }else if(jumpType==1){//作业批改过来的
                breadcrumbTxt=<Breadcrumb separator=">"><Breadcrumb.Item><Link to={'/homework-detail/'+this.props.params.homeworkId+'/1/0'}>作业批改</Link></Breadcrumb.Item><Breadcrumb.Item>作业报告</Breadcrumb.Item></Breadcrumb>
            }else if(jumpType==2){//我的班级过来的
                breadcrumbTxt=<Breadcrumb separator=">">
                                  <Breadcrumb.Item>
                                    <Link to='/homework-class'>我的班级</Link>
                                  </Breadcrumb.Item>
                                  <Breadcrumb.Item>
                                    <Link to={'/homework-class-detail/'+classId}>班级详情</Link>
                                  </Breadcrumb.Item>
                                  <Breadcrumb.Item>
                                    作业报告
                                  </Breadcrumb.Item>
                              </Breadcrumb>
            }
        return (
            <div className="homework-statistical">
                <h1 className='header-nav'>
                    { breadcrumbTxt }
                </h1>
                <Spin size="large" style={{"fontSize":"30px","display":this.state.loadingShow,'margin':'300px auto'}}/>
                {
                    Object.keys(resultStatisticalInfoList).length!=0&&<div>
                    <p className='common-sec-title' style={{marginBottom:'30px'}}><span className='sec-title-line'></span><span>作业信息</span></p>
                    <div>
                        <div className="list-sec no-corrections">
                        <p className="date"><span>{resultStatisticalInfoList.newPublishAt}</span></p>
                                <div className="mark-box homeworinfo-mark">
                                    <span className="class-mark" title={resultStatisticalInfoList.className}>{Object.keys(resultStatisticalInfoList).length!=0 ? resultStatisticalInfoList.className : ''}</span>
                                    <div className='homework-name-time'>
                                        <h1 className="homework-mark">
                                            <span className="homework-name" title={resultStatisticalInfoList.name}>{Object.keys(resultStatisticalInfoList).length!=0 ? resultStatisticalInfoList.name : ''}</span>
                                        </h1>
                                        <p>
                                        <span className="homeworknum-mark">共{resultStatisticalInfoList.questionCount}题</span>
                                        <span className={resultStatisticalInfoList.isAsShow=='inline-block' ? 'alreadyAstime-tag' : 'astime-tag'}><span className="as-mark" style={{'display':resultStatisticalInfoList.isAsShow}}>已截止:</span><span className="as-mark" style={{'display':resultStatisticalInfoList.isNotAsShow}}>截止时间</span><span className="astimemonth-mark">{resultStatisticalInfoList.newAbortAt}</span></span>
                                        </p>
                                    </div>
                                </div>
                                <div className="mark-box progress-mark-box">
                                    {<p className="progress-bar">
                                        <Progress strokeColor='rgba(45, 187, 85, 1)' strokeWidth={6} percent={(resultStatisticalInfoList.committedCount/resultStatisticalInfoList.allCount)*100} showInfo={false} status="active" />
                                    </p>}
                                    {<p className="progress-bar-txt">
                                        <span>已提交</span><span><span className="submitted">{resultStatisticalInfoList.committedCount}</span>/<span>{resultStatisticalInfoList.allCount}</span></span>
                                    </p>}
                                </div>
                                <div className="mark-box progress-circle-mark-box">
                                    <p className="progress-circle-bar">
                                        <Progress strokeColor='rgba(45, 187, 85, 1)' strokeWidth={6} type="circle" percent={resultStatisticalInfoList.accuracy} width={48} status="active"/>
                                    </p>
                                    <p className="progress-circle-text">正确率</p>
                                </div>
                                <div className="mark-box correcting-mark-box">

                                    <a href="javascript:;" className="report-detail-btn"><Link to={'/homework-edit-again/'+this.props.params.homeworkId+'/'+resultStatisticalInfoList.draftId+'/'+this.props.params.type+'/1'+'/'+classId}>查看作业</Link></a>
                                    {
                                        resultStatisticalInfoList.state==2&&<Button type="primary" className="correcting-btn"><Link to={'/homework-detail/'+this.props.params.homeworkId+'/'+this.props.params.type+'/'+classId}>批改</Link></Button>
                                    }
                                </div>
                        </div>
                    </div>
                    <p className='common-sec-title'><span className='sec-title-line'></span><span>分析报告</span></p>
                    <div className='analysis-report-text'>
                        {
                            resultStatisticalInfoList.analysisReport!=''&&resultStatisticalInfoList.analysisReport!=null ? resultStatisticalInfoList.analysisReport : '暂未生成作业报告'
                        }
                    </div>
                    <div className="homework-statistical-box">
                        <Tabs defaultActiveKey="1" onChange={this.callback.bind(this)}>
                            <TabPane tab="班级成绩统计" key="1">
                            {
                                resultStatisticalInfoList.committedCount!=''&&resultStatisticalInfoList.committedCount!=null&&resultStatisticalInfoList.committedCount!==0 ? <div>
                                    <p className='statis-title'><span className='statis-title-line'></span><span>班级成绩统计</span></p>
                                    <div className='stu-situation-table'>
                                        <Table
                                            columns={this.state.columns}
                                            dataSource={this.state.homeworkStuAna}
                                            bordered
                                            size="small"
                                            rowKey={item => item.allCount}
                                            pagination= {false}
                                        >
                                        </Table>
                                    </div>
                                    <div className='result-broken-line'>
                                        <Highcharts config={this.state.config}></Highcharts>
                                    </div>
                                    <p className='statis-title'><span className='statis-title-line'></span><span>学生作业统计</span></p>
                                    <div>
                                        <Table
                                            columns={this.state.stuHomeworkColumns}
                                            dataSource={this.state.stuHomeworkAua}
                                            bordered
                                            size="small"
                                            rowKey={item => item.allCount}
                                            pagination= {false}
                                        >
                                        </Table>
                                    </div>
                                </div> : <div><img className="default-graph" src={defaultGraph} alt=""/><p style={{width:'100%',height:'33px',color:'rgba(153, 153, 153, 1)',fontSize: '24px',textAlign: 'center'
                                }}>还没有学生提交作业,暂无统计报告呦~</p></div>
                            }

                            </TabPane>
                            <TabPane tab="知识点统计" key="2">
                                {
                                    resultStatisticalInfoList.committedCount!=''&&resultStatisticalInfoList.committedCount!=null&&resultStatisticalInfoList.committedCount!==0 ? <div>
                                        <p className='statis-title'><span className='statis-title-line'></span><span>知识点掌控分布</span></p>
                                        <div className='stu-situation-table'>
                                            <Table
                                                columns={this.state.knowledgeColumns}
                                                dataSource={this.state.knowledgeAna}
                                                bordered
                                                size="small"
                                                rowKey={item => item.allCount}
                                                pagination= {false}
                                            >
                                            </Table>
                                        </div>
                                    </div>: <div><img className="default-graph" src={defaultGraph} alt=""/><p style={{width:'100%',height:'33px',color:'rgba(153, 153, 153, 1)',fontSize: '24px',textAlign: 'center'
                                }}>还没有学生提交作业,暂无统计报告呦~</p></div>
                                }

                                {/* <p className='statis-title'><span className='statis-title-line'></span><span>学生作业统计</span></p>
                                <div className='stu-situation-table'>
                                    <Table
                                        columns={this.state.knowledgeStuColumns}
                                        dataSource={this.state.knowledgeStuAna}
                                        bordered
                                        size="small"
                                        rowKey={item => item.allCount}
                                        pagination= {false}
                                    >
                                    </Table>
                                </div>*/}
                            </TabPane>
                        </Tabs>
                    </div>
                </div>
                }



            </div>
        )
    }
  /*  enterHandle(value) {
        hashHistory.push('/search/all/' + encodeURIComponent(value))
    }*/
    //试题报告 学生报告
    callback(e){

    }

}

export default HomeStatis
