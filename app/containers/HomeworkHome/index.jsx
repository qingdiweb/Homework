import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import { Link, hashHistory } from 'react-router'
import { Menu, Icon , Button , Modal , Breadcrumb } from 'antd';

import './style.less'

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
class HomeHeader extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
        this.state={
            teacherInfoFill:false,//判断老师信息是否完整,如果不完整就提示填写
            teacherInfo:{},//教师信息
            menuKey:'',
            flag:false
        }
    }
    componentWillReceiveProps(nextProps){
        let teacherInfo=nextProps.teacherInfo;
            this.setState({
                teacherInfo:teacherInfo
            })
    }
    componentWillMount(){
        let teacherInfoFill=localStorage.getItem("teacherInfoFill")=='true' ? true : false,
            teacherInfo=JSON.parse(localStorage.getItem("teacherInfo"));
        this.setState({
            teacherInfoFill:teacherInfoFill,
            teacherInfo:teacherInfo,
            flag:!this.state.flag
        })
    }
    //布置作业只要选了题就通知-离开提示
    noticeDecorate(topicSel,questionIds,catalogIds,draftId){
        this.props.noticeHome.bind(this,topicSel,questionIds,catalogIds,draftId)()
    }
    render() {
        let teacherInfo=this.state.teacherInfo;
        return (
            <div id="homework-home">
                <div id="home-content">
                    <div id="home-left">
                        {/*<div className="home-left-directory">
                            <div className="personal-center">
                            {
                                JSON.stringify(teacherInfo)!='{}'&&teacherInfo!=null ?  <Link to='/personal-center'>
                                                                                                <img  src={teacherInfo.avatarUrl} alt=""/>
                                                                                                <div className='teach-info'>
                                                                                                        <h1>{teacherInfo.nickname}</h1>
                                                                                                        <p style={{marginBottom:'10px'}}>
                                                                                                            <span>{teacherInfo.stage}</span>
                                                                                                            <span>{teacherInfo.subject}</span>
                                                                                                        </p>
                                                                                                </div>
                                                                                        </Link> : ''
                            }
                            </div>
                            <div className="folding-directory">
                            <Menu
                                onClick={this.handleClick.bind(this)}
                                style={{ width: 179}}
                                key={this.state.menuKey}
                                defaultSelectedKeys={this.state.defaultSelectedKeys}
                                defaultOpenKeys={this.state.defaultOpenKeys}
                                mode="inline">
                                <SubMenu key="sub1" title={<span><Link to="/homework-home">作业首页</Link></span>}>
                                  <Menu.Item key="1"><Link to={"/decorate-homework/0"}>布置作业</Link></Menu.Item>
                                  <Menu.Item key="2"><Link to="/no-publish-homework">未发布作业</Link></Menu.Item>
                                </SubMenu>
                                <Menu.Item key="3">
                                    <Link to="/homework-report">作业报告</Link>
                                </Menu.Item>
                                <Menu.Item key="4">
                                    <Link to="/homework-collect">我的收藏</Link>
                                </Menu.Item>
                                <Menu.Item key="5">
                                    <Link to='/homework-class'>我的班级</Link>
                                </Menu.Item>
                            </Menu>
                            </div>
                        </div>*/}
                    </div>
                    <div id="home-right">
                        <div className="cont">
                            {/*this.props.children*/}
                            {React.cloneElement(this.props.children,{teacherInfo:this.state.teacherInfo,noticeDecorate:this.noticeDecorate.bind(this)})}
                        </div>
                    </div>
                </div>
                <Modal
                  title="提示"
                  visible={this.state.teacherInfoFill}
                  maskClosable={false}
                  closable={false}
                  width='400px'
                  className="teacherInfoModel"
                  footer={[<Button key="submit" type="primary" style={{marginLeft:'0px'}} onClick={this.completeTeacherInfoOk.bind(this)}>确定</Button>]}
                >
                  <p>请补全教师信息</p>
                </Modal>
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
    //补全教师信息
    completeTeacherInfoOk(e){
        hashHistory.push('/personal-center')
        this.setState({
            teacherInfoFill:false
        })
    }
   
    
}

export default HomeHeader