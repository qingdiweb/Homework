/**
 * 课堂报告
 */
import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import { Link, hashHistory } from 'react-router'
import { Menu, Icon , Button , Select , DatePicker , Breadcrumb} from 'antd';
import HomeworkList from '../../components/HomeworkList'
import Dialog from '../../components/Dialog'
import moment from 'moment';

import './style.less'
const Option = Select.Option;
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;
class HomeHeader extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
        this.state={
            teacherInfoFill:false,//判断老师信息是否完整,如果不完整就提示填写
            screening:{
                homeworkstate:'',//是否批改筛选
                publishAtStart:'',//时间筛选0点时间戳
                publishAtEnd:'',//时间筛选24点时间戳
                homeworkDetailType:1//存储类型-判断是从哪个页面跳转到作业详情的 0 首页调取 1 作业报告调取
            },
            flag:false,
            dateValue:'',//修改日期
            defaultCorrect:undefined,//默认批改筛选
        }
    }
    componentWillMount(){
            //通知左侧menu导航-当前在那个menu下
            localStorage.setItem('positionMenu',JSON.stringify(['3']));

    }
    render() {
        return (
            <div>
                <h1 className='header-nav'><Breadcrumb separator=">"><Breadcrumb.Item >作业报告</Breadcrumb.Item></Breadcrumb></h1>
                <div className="">
                    <HomeworkList screening={this.state.screening} flag={!this.state.flag}/>
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
    //已批改，未批改选择
    handleChange(value){
        console.log('选择'+value)
        this.state.screening.homeworkstate=value
        this.setState({
            defaultCorrect:value
        })
    }
    //日期选择
    datePick(date, dateString){
        console.log(date, dateString)
        let stateTime=dateString+' '+'00:00',
            endTime=dateString+' '+'23:59',
            publishAtStart=new Date(stateTime).getTime(),
            publishAtEnd=new Date(endTime).getTime();
            console.log('0点时间戳',publishAtStart)
            console.log('24点时间戳',publishAtEnd)
            this.setState({
                object:this.state.screening.publishAtStart=publishAtStart,
                object:this.state.screening.publishAtEnd=publishAtEnd,
                dateValue:moment(moment(dateString))
            })
    }
    //查找作业
    searchHomeworkList(){
        console.log("日期",this.state.defaultDate)
        this.setState({
            object:this.state.screening.homeworkstate=this.state.screening.homeworkstate,
            object:this.state.screening.publishAtStart=this.state.screening.publishAtStart,
            object:this.state.screening.publishAtEnd=this.state.screening.publishAtEnd,
            flag:!this.state.flag
        })
    }
    //重置
    resetSearch(){
        this.setState({
            object:this.state.screening.homeworkstate='',//批改数据置空
            object:this.state.screening.publishAtStart='',//0点日期数据置空
            object:this.state.screening.publishAtEnd='',//24点日期数据置空
            defaultCorrect:'',//批改置空
            dateValue:''//日期置空
        })
        console.log("重置",this.state.screening)
    }

}

export default HomeHeader
{/*<Button><Link to='/correct-homework/48/20152848'>跳转到批改作业</Link></Button>*/}
