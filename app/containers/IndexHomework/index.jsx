/**
 * 课后作业
 */
import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import { Link, hashHistory } from 'react-router'
import { Menu, Icon , Button , Select , DatePicker , Breadcrumb} from 'antd';
import HomeworkList from '../../components/HomeworkList'
import Dialog from '../../components/Dialog'
import moment from 'moment';
import datalocale from 'antd/lib/date-picker/locale/zh_CN';

import './style.less'
const Option = Select.Option;
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;
class IndexHomework extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
        this.state={
            teacherInfoFill:false,//判断老师信息是否完整,如果不完整就提示填写
            screening:{
                homeworkstate:'',//是否批改筛选
                publishAtStart:'',//时间筛选0点时间戳
                publishAtEnd:'',//时间筛选24点时间戳
            },
            flag:false,
            dateValue:undefined,//修改日期
            defaultCorrect:undefined,//默认批改筛选
        }
    }
    componentWillMount(){
        //通知左侧menu导航-当前在那个menu下
        localStorage.setItem('positionMenu',JSON.stringify(['0']));
    }
    render() {
        return (
            <div>
                <h1 className='header-nav'><Breadcrumb separator=">"><Breadcrumb.Item >课后作业</Breadcrumb.Item></Breadcrumb></h1>
                <div className='index-head-search'>
                    <Select className="correctingSel" value={this.state.defaultCorrect} placeholder="作业状态"  allowClear={false} onChange={this.handleChange.bind(this)}>
                      <Option value="">全部</Option>
                      <Option value="1">进行中</Option>
                      <Option value="2">待批改作业</Option>
                      <Option value="3">已批改作业</Option>
                    </Select>
                    <DatePicker className="datepickSel" locale={datalocale} allowClear={false} placeholder="日期筛选" value={this.state.dateValue}  onChange={this.datePickHandle.bind(this)} />
                    <Button className="searchBtn" type="primary" onClick={this.searchHomeworkList.bind(this)}>查找</Button>
                    <Button className="resetBtn" type="" onClick={this.resetSearch.bind(this)}>重置</Button>
                    <Button type="primary" className="decorateBtn" onClick={this.decorateBtn.bind(this)}>布置作业</Button>
                </div>
                <div className="">
                    <HomeworkList screening={this.state.screening} flag={!this.state.flag}/>
                </div>
            </div>
        )
    }
  /*  enterHandle(value) {
        hashHistory.push('/search/all/' + encodeURIComponent(value))
    }*/
    decorateBtn(){
        hashHistory.push("/decorate-homework/0/0");
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
                object:this.state.screening.publishAtStart='',
                object:this.state.screening.publishAtEnd='',
                dateValue:undefined
            })
        }else{
            let stateTime=dateString+' '+'00:00',
            endTime=dateString+' '+'23:59',
            publishAtStart=new Date(stateTime).getTime(),
            publishAtEnd=new Date(endTime).getTime();
            this.setState({
                object:this.state.screening.publishAtStart=publishAtStart,
                object:this.state.screening.publishAtEnd=publishAtEnd,
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
            object:this.state.screening.publishAtStart='',//0点日期数据置空
            object:this.state.screening.publishAtEnd='',//24点日期数据置空
            defaultCorrect:undefined,//批改置空
            dateValue:undefined//日期置空
        })
    }

}

export default IndexHomework
