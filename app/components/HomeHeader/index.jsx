import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import { Link, hashHistory } from 'react-router'
import { Menu, Icon , Button , Modal , Breadcrumb } from 'antd';
import { saveDefault } from '../../fetch/decorate-homework/decorate-homework'
import Dialog from '../Dialog'

import './style.less'

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const loginToken=localStorage.getItem("loginToken");
class HomeHeader extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
        this.state={
            teacherInfoFill:false,//判断老师信息是否完整,如果不完整就提示填写
            teacherInfo:{},//教师信息
            defaultSelKeys:['6'],
            menuKey:new Date().getTime(),
            flag:false,
            dialogFlag:false,
            exitShow:false,
            isEnterExit:false,
            isAllowLeave:true,
            leaveVisible:false,
            stagPath:''//暂存跳转路径
        }
    }
    componentWillReceiveProps(nextProps){
            //监听属性变化
            if(this.props.flag!=nextProps.flag){
                 //刷新此组件
                let teacherInfoFill=localStorage.getItem("teacherInfoFill")=='true' ? true : false;
                    this.setState({
                        teacherInfoFill:teacherInfoFill,
                        flag:!this.state.flag
                    })
                //离开提示
                console.log('接收布置作业属性',this.props.isLeaveDecorate,nextProps.isLeaveDecorate,typeof(nextProps.isLeaveDecorate))
                //布置作业是否已选题-让其离开
                if(nextProps.isLeaveDecorate===false){
                    this.setState({
                        isAllowLeave:false
                    })
                }else{
                    this.setState({
                        isAllowLeave:true
                    })
                }
            }
           
    }
    componentWillMount(){
        let teacherInfoFill=localStorage.getItem("teacherInfoFill")=='true' ? true : false;
            this.setState({
                teacherInfoFill:teacherInfoFill,
                flag:!this.state.flag
            })
            
        let positionMenu=JSON.parse(localStorage.getItem('positionMenu'));
            if(positionMenu instanceof Array){
                this.setState({
                    defaultSelKeys:positionMenu,
                    menuKey:new Date().getTime()
                })
            }
    }
    render() {
        let teacherInfo=JSON.parse(localStorage.getItem("teacherInfo"));
        console.log('头部组件render',teacherInfo)
        return (
            <div id="home-header" className="clear-fix">
                {/*<span className="teacher-name">您好,{this.props.teacherInfo.nickname}老师</span>
                <a href="index.html" className="exit-btn">退出</a>*/}
                <div className='auto-box'>
                    <Menu
                        onClick={this.handleClick.bind(this)}
                        className="header-menu"
                        key={this.state.menuKey}
                        defaultSelectedKeys={this.state.defaultSelKeys}
                        mode="horizontal">
                        <Menu.Item key="6">
                            课堂作业
                        </Menu.Item>
                        <Menu.Item key="0">
                            课后作业
                        </Menu.Item>
                        <Menu.Item key="1">
                            布置作业
                        </Menu.Item>
                        <Menu.Item key="7">
                            课堂记录
                        </Menu.Item>
                        <Menu.Item key="2">
                            作业草稿
                        </Menu.Item>
                      {/*  <Menu.Item key="3">
                            作业报告
                        </Menu.Item>*/}
                        <Menu.Item key="4">
                            我的习题
                        </Menu.Item>
                        <Menu.Item key="5">
                            我的班级
                        </Menu.Item>
                    </Menu>
                    <div className='personal-info' >
                    {
                        JSON.stringify(teacherInfo)!='{}'&&teacherInfo!=null ?  <div>
                                                                                    <Link to='/personal-center'>
                                                                                        <img src={teacherInfo.avatarUrl} alt="" className="head-portrait"/>
                                                                                        <span className="user-name">{teacherInfo.nickname}</span>
                                                                                    </Link> 
                                                                                    <Icon type="down" style={{width:"20px",height:"20px",color:"rgba(255, 255, 255, 1)",position:'relative',top:'2px'}} onClick={this.exitShowHandle.bind(this)} onMouseLeave={this.personalInfoLeave.bind(this)}/>
                                                                                </div>: ''
                    }
                    </div>
                    {
                        this.state.exitShow ? <a href="index.html" className='exit' onMouseEnter={this.exitEnter.bind(this)} onMouseLeave={this.exitLeave.bind(this)}>退出</a> : ''
                    }
                </div>
                <Dialog dialogFlag={this.state.dialogFlag} leaveVisible={this.state.leaveVisible} topicSel={this.props.saveDraftData.topicSel} noticeLeaveOk={this.noticeLeaveOk.bind(this)} noticeLeaveCancel={this.noticeLeaveCancel.bind(this)}/>
            </div>
        )
    }
   //左侧menu点击触发事件
    handleClick(e){
        console.log('menukey',this.state.isAllowLeave)
        this.setState({
            menukey:new Date().getTime()
        })
        let originPath = this.state.stagPath;
        if(e.key=='0'){
            if(this.state.isAllowLeave){
                hashHistory.push("/index-homework")
            }
            this.state.stagPath="/index-homework";
            //this.props.noticeHome.bind(this,false)()
        }else if(e.key=='1'){
            hashHistory.push("/decorate-homework/0/0")
            //this.props.noticeHome.bind(this,true)()
            this.state.stagPath="/decorate-homework";
        }else if(e.key=='2'){
            if(this.state.isAllowLeave){
                hashHistory.push("/no-publish-homework")
            }
            this.state.stagPath="/no-publish-homework";
            //this.props.noticeHome.bind(this,false)()
        }else if(e.key=='3'){
            if(this.state.isAllowLeave){
                hashHistory.push("/homework-report")
            }
            this.state.stagPath="/homework-report";
            //this.props.noticeHome.bind(this,false)()
        }else if(e.key=='4'){
            if(this.state.isAllowLeave){
                hashHistory.push("/homework-collect")
            }
            this.state.stagPath="/homework-collect";
            //this.props.noticeHome.bind(this,false)()
        }else if(e.key=='5'){
            if(this.state.isAllowLeave){
                hashHistory.push('/homework-class')
            }
            this.state.stagPath='/homework-class';
            //this.props.noticeHome.bind(this,false)()
        }else if(e.key=='6'){
            if(this.state.isAllowLeave){
                hashHistory.push('/classroom-exercise')
            }
            this.state.stagPath='/classroom-exercise';
            //this.props.noticeHome.bind(this,false)()
        }else if(e.key=='7'){
            if(this.state.isAllowLeave){
                hashHistory.push('/classroom-record')
            }
            this.state.stagPath='/classroom-record';
            //this.props.noticeHome.bind(this,false)()
        }

        //离开布置作业界面提示
        if(this.state.isAllowLeave===false){
            console.log('====1111');
            if(this.state.stagPath!="/decorate-homework"&&this.props.saveDraftData.topicSel!=0){//布置页面点击布置menu和题目数为0不提示
                console.log('=====222');
                this.setState({
                  leaveVisible: true,
                  dialogFlag:!this.state.dialogFlag
                })
            }
            else {
                console.log('=====333');
                if(originPath !==  this.state.stagPath){
                    console.log('=====555');
                    window.noticeDecorateQuestionIds='';//用作通知header组件离开当前页面保存草稿参数用
                    window.catalogIds='';
                }
            }
        }else{
            console.log('=====444');
            this.setState({
              leaveVisible: false,
              dialogFlag:!this.state.dialogFlag
            });
            window.noticeDecorateQuestionIds='';//用作通知header组件离开当前页面保存草稿参数用
            window.catalogIds='';
        }
       /* window.noticeDecorateQuestionIds='';//用作通知header组件离开当前页面保存草稿参数用
        window.catalogIds='';*/

    }

    personalInfoLeave(){
        setTimeout(()=>{
            if(!this.state.isEnterExit){
                this.setState({
                    exitShow:false
                })
            }
        },500)
    }
    exitShowHandle(){
         this.setState({
            exitShow:true
        })
    }
    exitEnter(){
        this.setState({
            isEnterExit:true
        })
    }
    exitLeave(){
        this.setState({
            exitShow:false,
            isEnterExit:false
        })
    }
    noticeLeaveOk(e){
        //通知左侧menu导航-当前在那个menu下
        localStorage.setItem('positionMenu',JSON.stringify(['2']));
        this.setState({
          leaveVisible: false,
        });
        let saveDraftData=this.props.saveDraftData,
            draftId=saveDraftData.draftId,
            currentQuestionIds=saveDraftData.questionIds,
            currentCatalogIds=saveDraftData.catalogIds,
            questionCount=saveDraftData.topicSel;
              const resultSaveDefault=saveDefault(loginToken,draftId,currentQuestionIds,currentCatalogIds,questionCount);
                   resultSaveDefault.then(res => {
                      return res.json()
                  }).then(json => {
                      // 处理获取的数据
                      const data = json
                      if (data.result) {
                          //保存成功之后-跳转回草稿列表
                          hashHistory.push('/no-publish-homework');
                          window.location.reload()
                          //离开清空选题
                          window.noticeDecorateQuestionIds='';//用作通知header组件离开当前页面保存草稿参数用
                          window.catalogIds='';
                      }else{
                          message.warning(data.error);
                      }
                  }).catch(ex => {
                      // 发生错误
                      if (__DEV__) {

                          console.error('暂无数据, ', ex.message)
                      }
                  })
        
      }
    noticeLeaveCancel(e){
        let stagPath=this.state.stagPath;
        if(stagPath="/index-homework"){
            localStorage.setItem('positionMenu',JSON.stringify(['0']));
        }else if(stagPath="/decorate-homework"){
            localStorage.setItem('positionMenu',JSON.stringify(['1']));
        }else if(stagPath="/no-publish-homework"){
            localStorage.setItem('positionMenu',JSON.stringify(['2']));
        }else if(stagPath="/homework-report"){
            localStorage.setItem('positionMenu',JSON.stringify(['3']));
        }else if(stagPath="/homework-collect"){
            localStorage.setItem('positionMenu',JSON.stringify(['4']));
        }else if(stagPath="/homework-class"){
            localStorage.setItem('positionMenu',JSON.stringify(['5']));
        }else if(stagPath="/classroom-exercise"){
            localStorage.setItem('positionMenu',JSON.stringify(['6']));
        }else if(stagPath="/classroom-record"){
            localStorage.setItem('positionMenu',JSON.stringify(['7']));
        }
        
        this.setState({
          leaveVisible: false,
          flag:!this.state.flag,
          dialogFlag:!this.state.dialogFlag
        },()=>{
            hashHistory.push(this.state.stagPath);
            this.state.isAllowLeave=true;
        });
        //离开清空选题
        window.noticeDecorateQuestionIds='';//用作通知header组件离开当前页面保存草稿参数用
        window.catalogIds='';
        
    }
    
}

export default HomeHeader