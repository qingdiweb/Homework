import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import { bindActionCreators } from 'redux'
import { Link , hashHistory } from 'react-router'
import { connect } from 'react-redux'
import { Menu, Icon , Button , Input , Dropdown, Modal , message} from 'antd';
import HomeHeader from '../../components/HomeHeader'
import HomeFooter from '../../components/HomeFooter'
import HomeworkHome from '../HomeworkHome'
import { getTeacherInfo } from '../../fetch/home/home'
import * as Constants from '../../constants/store'


// localStorage.setItem("loginToken",'a315888ff3051032cf94ed8650ce207a');//梦阳
// localStorage.setItem("loginToken",'fb015fa69ed3d77717f65f4552a5cf88'); //卓星
// localStorage.setItem("loginToken",'ce21e17c76768448e6aa5388f5fe7e46'); //红涛

const loginToken=localStorage.getItem("loginToken");
class Home extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
        this.state={
            teacherInfoFill:false,//判断老师信息是否完整,如果不完整就提示填写
            teacherInfo:{},//教师信息
            flag:false,
            defaultSelectedKeys:[],
            isLeaveDecorate:true,
            saveDraftData:{//用作保存草稿用
                topicSel:'',
                questionIds:'',
                catalogIds:'',
                draftId:''
            }
        }
    }
    //个人中心保存-通知刷新
    noticeRefresh(){
        console.log('个人中心保存-通知刷新')
        this.setState({
            flag:!this.state.flag
        })
    }
    //通知布置作业界面-要离开布置作业时提示
    noticeHome(topicSel,questionIds,catalogIds,draftId){
        console.log('是否离开',topicSel)
        //是否离开
        if(parseInt(topicSel)>0){//如果有选题就不让其离开
            this.setState({
                isLeaveDecorate:false,
                flag:!this.state.flag,
                obeject:this.state.saveDraftData.topicSel=topicSel,
                obeject:this.state.saveDraftData.questionIds=questionIds,
                obeject:this.state.saveDraftData.catalogIds=catalogIds,
                obeject:this.state.saveDraftData.draftId=draftId
            })
        }else{
            this.setState({
                isLeaveDecorate:true,
                flag:!this.state.flag,
                obeject:this.state.saveDraftData.topicSel=topicSel,
                obeject:this.state.saveDraftData.questionIds=questionIds,
                obeject:this.state.saveDraftData.catalogIds=catalogIds,
                obeject:this.state.saveDraftData.draftId=draftId
            })
        }
    }
    componentWillMount(){
        //let token=window.location.href.split('?')[1].split('=')[1];
        if(window.location.hash.split('?')[0].split('#/')[1]=='homework-home'){
            localStorage.setItem('positionMenu',JSON.stringify(['6']));//定位随堂练习
        }
        const resultGetTeacherInfo=getTeacherInfo(loginToken);
                resultGetTeacherInfo.then(res=>{
                return res.json()
            }).then(json=>{
                const data=json
                     if(data.result){
                        let teacherInfo=data.data;
                            //存储教师信息
                            localStorage.setItem("teacherInfo",JSON.stringify(teacherInfo));

                            //如果教师信息不全，就让其去填写信息
                            if(Constants.whetherTure(teacherInfo.avatarUrl)&&Constants.whetherTure(teacherInfo.nickname)&&Constants.whetherTure(teacherInfo.gender)&&Constants.whetherTure(teacherInfo.stage)&&Constants.whetherTure(teacherInfo.subject)&&Constants.whetherTure(teacherInfo.province)&&Constants.whetherTure(teacherInfo.city)&&Constants.whetherTure(teacherInfo.area)&&Constants.whetherTure(teacherInfo.school)){
                                this.setState({
                                    teacherInfoFill:false
                                })
                            }else{
                                this.setState({
                                    teacherInfoFill:true
                                })
                            }
                            this.setState({
                                teacherInfo:teacherInfo,
                                flag:!this.state.flag
                            })
                            //存储教师信息
                            localStorage.setItem("teacherInfoFill",this.state.teacherInfoFill);
                     }else{
                        window.location.href='index.html';
                     }
            })

    }
    componentDidMount(){
        this.setState({
            flag:!this.state.flag
        })
    }
    render() {
        return (
            <div className="homework-home">
                <HomeHeader flag={this.state.flag} teacherInfo={this.state.teacherInfo} saveDraftData={this.state.saveDraftData} isLeaveDecorate={this.state.isLeaveDecorate}/>
                <div style={{width:'100%',minHeight:'calc(100vh - 133px)'}}>
                   {/* {this.props.children}*/}
                    {React.cloneElement(this.props.children, { flag:this.state.flag,teacherInfo: this.state.teacherInfo,noticeRefresh:this.noticeRefresh.bind(this),noticeHome:this.noticeHome.bind(this)})}
                </div>
                <HomeFooter/>
            </div>
        )
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
)(Home)
