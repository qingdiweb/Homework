/**
 * 我的收藏-题目
 */
import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import { Link, hashHistory } from 'react-router'
import { Menu, Icon , Button , Select , Input , DatePicker , Breadcrumb} from 'antd';
import DecorateList from '../../../components/DecorateList'
import { getTypeDgreeData } from '../../../fetch/homework-collect/homework-collect'
import Dialog from '../../../components/Dialog'
import moment from 'moment';

import './style.less'
const Option = Select.Option;
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;
class HomeworkCollectTopic extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
        this.state={
            parentType:2,
            degreeInfoList:[],//难度
            categoryInfoList:[],//题型
            screening:{
                degreeValue:'',//是否批改筛选
                categoryValue:'',//题型筛选
                keywordValue:''//关键字筛选
            },
            flag:false,
            defaultCategory:undefined,//默认题型筛选
            defaultDegree:undefined,//默认难度筛选
            defaultKeywordValue:''//默认关键字
        }
    }
    componentWillMount(){
        //教师信息
        let teacherInfo=JSON.parse(localStorage.getItem("teacherInfo")),
            stageId=teacherInfo.stageId,
            subjectId=teacherInfo.subjectId;
            //获取题型难度
            const resultTypeDgree = getTypeDgreeData(stageId,subjectId)
                resultTypeDgree.then(res => {
                    return res.json()
                }).then(json => {
                    // 处理获取的数据
                    const data = json
                    if (data.result) {
                        let questionDegreeInfoList=data.data.questionDegreeInfoList,//难度
                            questionCategoryInfoList=data.data.questionCategoryInfoList;//题型
                            this.setState({
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
        //通知左侧menu导航-当前在那个menu下
        localStorage.setItem('positionMenu',JSON.stringify(['4']));
    }
    componentDidMount(){
        this.setState({
            flag:!this.state.flag
        })
    }
    render() {
        return (
            <div>
                <h1 className='header-nav'>
                    <Breadcrumb separator=">">
                        <Breadcrumb.Item><Link to="/homework-collect">我的习题</Link></Breadcrumb.Item>
                        <Breadcrumb.Item>{this.props.params.collectType==1 ? '我的录入' : '习题详情'}</Breadcrumb.Item>
                    </Breadcrumb>
                </h1>
                <div className='indexHeadSearch'>
                    <Button className="resetBtn" type="" onClick={this.resetSearch.bind(this)}>重置</Button>
                    <Button className="searchBtn" type="primary" onClick={this.searchHomeworkList.bind(this)}>查找</Button>
                    <Input className="correctingSel" value={this.state.defaultKeywordValue} placeholder="关键字" onChange={this.keyword.bind(this)}/>
                    <Select className="correctingSel" value={this.state.defaultCategory} placeholder="题型"  allowClear={false} onChange={this.categoryHandleChange.bind(this)}>
                    {
                        this.state.categoryInfoList.length>0 ? this.state.categoryInfoList.map((item)=>{
                            return <Option  value={item.id} key={item.id}>{item.name}</Option>
                        }) : ''
                    }
                    </Select>
                    <Select className="correctingSel" value={this.state.defaultDegree} placeholder="难度"  allowClear={false} onChange={this.degreeHandleChange.bind(this)}>
                        {
                            this.state.degreeInfoList.length>0 ? this.state.degreeInfoList.map((item)=>{
                                return <Option  value={item.value} key={item.value}>{item.title}</Option>
                            }) : ''
                        }
                    </Select>
                </div>
                <div className="">
                     <DecorateList  flag={this.state.flag} parentType={this.state.parentType} fileData={this.state.screening} collectId={this.props.params.collectId} />
                </div>
            </div>
        )
    }
  /*  enterHandle(value) {
        hashHistory.push('/search/all/' + encodeURIComponent(value))
    }*/
    //左侧menu点击触发事件
    handleClick(e){
        console.log('click ', e);
    }
    //难度选择
    degreeHandleChange(value){
        console.log('选择'+value)
        this.state.screening.degreeValue=value
        this.setState({
            defaultDegree:value
        })
    }
    //题型选择
    categoryHandleChange(value){
        console.log('选择'+value)
        this.state.screening.categoryValue=value
        this.setState({
            defaultCategory:value
        })
    }
    //关键字
    keyword(e){
        console.log(e.target.value)
        this.state.screening.keywordValue=e.target.value;
        this.setState({
            defaultKeywordValue:e.target.value
        })
    }
    //查找作业
    searchHomeworkList(){
        this.setState({
            object:this.state.screening.degreeValue=this.state.screening.degreeValue,
            object:this.state.screening.categoryValue=this.state.screening.categoryValue,
            flag:!this.state.flag
        })
    }
    //重置
    resetSearch(){
        console.log("走这里")
        this.setState({
            object:this.state.screening.keywordValue='',//关键字置空
            object:this.state.screening.degreeValue='',//难度数据置空
            object:this.state.screening.categoryValue='',//题型数据置空
            defaultCategory:undefined,//默认题型筛选
            defaultDegree:undefined,//默认难度筛选
            defaultKeywordValue:''
        })
    }

}

export default HomeworkCollectTopic
