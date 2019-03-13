/**
 * 课堂作业
 */
import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import { Link, hashHistory } from 'react-router'
import { Menu, Icon , Button , Select , DatePicker , Breadcrumb,TreeSelect} from 'antd';
import ExerciseList from '../../components/ExerciseList'
import Dialog from '../../components/Dialog'
import moment from 'moment';
import datalocale from 'antd/lib/date-picker/locale/zh_CN';

import './style.less'
const Option = Select.Option;
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;
class ClassroomExercise extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
        this.state={
            teacherInfoFill:false,//判断老师信息是否完整,如果不完整就提示填写
            screening:{
                catalogId:'',//章节
                createdAtStart:'',//时间筛选0点时间戳
                createdAtEnd:'',//时间筛选24点时间戳
            },
            flag:false,
            dateValue:undefined,//修改日期
            defaultCorrect:undefined,//默认批改筛选
            referenceType:0,//0 是课堂练习 1 课堂记录
        }
    }
    componentWillMount(){
        //通知左侧menu导航-当前在那个menu下
        localStorage.setItem('positionMenu',JSON.stringify(['6']));
    }
    componentDidMount(){
        this.setState({
            flag:!this.state.flag
        })
    }
    render() {
        return (
            <div className='classroom-exercise'>
                <h1 className='header-nav'><Breadcrumb separator=">"><Breadcrumb.Item >课堂作业</Breadcrumb.Item></Breadcrumb></h1>
                <div className='index-head-search'>
                    <DatePicker className="datepickSel" locale={datalocale} allowClear={false} placeholder="日期筛选" value={this.state.dateValue}  onChange={this.datePickHandle.bind(this)} />
                    <Button className="searchBtn" type="primary" onClick={this.searchHomeworkList.bind(this)}>查找</Button>
                    <Button className="resetBtn" type="" onClick={this.resetSearch.bind(this)}>重置</Button>
                    <Button type="primary" className="decorateBtn" onClick={this.decorateBtn.bind(this)}>布置作业</Button>
                </div>
                <div className="">
                    <ExerciseList screening={this.state.screening} flag={this.state.flag} referenceType={this.state.referenceType}/>
                </div>
            </div>
        )
    }

    decorateBtn(){
        hashHistory.push("/decorate-homework/0/0")
        window.location.reload()
    }
    //已批改，未批改选择
    handleChange(value){
        this.state.screening.homeworkstate=value
        this.setState({
            defaultCorrect:value
        })
    }
    //日期选择
    datePickHandle(date, dateString){
        if(date===null){
            this.setState({
                object:this.state.screening.createdAtStart='',
                object:this.state.screening.createdAtEnd='',
                dateValue:undefined
            })
        }else{
            let stateTime=dateString+' '+'00:00',
                endTime=dateString+' '+'23:59',
                createdAtStart=new Date(stateTime).getTime(),
                createdAtEnd=new Date(endTime).getTime();
                this.setState({
                    object:this.state.screening.createdAtStart=createdAtStart,
                    object:this.state.screening.createdAtEnd=createdAtEnd,
                    dateValue:moment(moment(dateString))
                })
        }
    }
    //查找作业
    searchHomeworkList(){
        this.setState({
            flag:!this.state.flag
        })
    }
    //重置
    resetSearch(){
        this.setState({
            object:this.state.screening.homeworkstate='',//批改数据置空
            object:this.state.screening.createdAtStart='',//0点日期数据置空
            object:this.state.screening.createdAtEnd='',//24点日期数据置空
            defaultCorrect:undefined,//批改置空
            dateValue:undefined//日期置空
        })
    }

}

export default ClassroomExercise
