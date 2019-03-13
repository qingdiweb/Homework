/**
 * 班级详情
 */
import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import { Link, hashHistory } from 'react-router'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { Menu, Icon , Modal , Input , message ,Button , Progress , Tabs , Breadcrumb} from 'antd';
import { getClassStudent , getClassHomework , getClassDetails , editClass , delClass , delHomework , delStudent} from '../../../fetch/homework-class/homework-class'
import * as Constants from '../../../constants/store'
import './style.less'
const TabPane = Tabs.TabPane;
const loginToken=localStorage.getItem("loginToken");
const defaultAvatar=require('../../../static/img/default-avatar.png');
class HomeDetail extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
        this.state={
            studentList:[],//作业列表数据
            classHomeworkList:[],//获取作业下所有题目答题数据
            classDetails:{},//班级详情
            isShowModal:false,//显示删除提示弹窗框
            delDistinguish:'',//解散班级/删除作业区分
            delContentText:'',//解散班级/删除作业文本
            classNameVal:'',//创建-编辑习题集名称
            isShowEditModal:false,//是否显示编辑弹窗
            invitedJoinShow:false,//邀请学生加入显示弹窗
            classNameErrorShow:'none',
            homeworkIndex:'',//作业索引
            homeworkId:'',//作业id
            stuIndex:'',//学生索引
            stuId:'',//学生id
            shareData:["url="+location.href,"desc=同学们,我们的在线班级号是"+this.props.params.classId+",快点加入吧！","title=","summary=","pics=","flash=","site="+Constants.baseUrl+"/share-class.html?classId="+this.props.params.classId,"style=201","width=32","height=32"],
            flag:false,
            shareVisible:false,
            copyText:'复制链接'
        }
    }
    componentWillMount(){
        let classId=this.props.params.classId;
            //班级详情
            this.getClassDetails.bind(this,loginToken,classId)();
            //获取班级下成员
            this.getClassStudent.bind(this,loginToken,classId)();
            //获取班级下的历史作业
            this.getClassHomework.bind(this,loginToken,classId)();
            //通知左侧menu导航-当前在那个menu下
            localStorage.setItem('positionMenu',JSON.stringify(['5']));
/*            var p = {
                url:location.href, //获取URL，可加上来自分享到QQ标识，方便统计
                desc:'', //分享理由(风格应模拟用户对话),支持多分享语随机展现（使用|分隔）
                title:'', //分享标题(可选)
                summary:'', //分享摘要(可选)
                pics:'', //分享图片(可选)
                flash: '', //视频地址(可选)
                site:'', //分享来源(可选) 如：QQ分享
                style:'201',
                width:32,
                height:32
            };
            var s = [];
            for(var i in p){
            s.push(i + '=' + encodeURIComponent(p[i]||''));
            }
            document.write(['<a class="qcShareQQDiv" href="http://connect.qq.com/widget/shareqq/index.html?',this.state.shareData.join('&'),'" target="_blank">分享到QQ</a>'].join(''));*/
    }
    //获取班级下成员
    getClassStudent(loginToken,classId){
        const resultStudent=getClassStudent(loginToken,classId);
                resultStudent.then(res => {
                    return res.json()
                }).then(json => {
                    // 处理获取的数据
                    const data = json
                    if (data.result) {
                        let content=data.data.content;
                        for (var i = 0; i < content.length; i++) {
                            content[i].stuSecDelShow=false//移入显示删除按钮
                        }
                            this.setState({
                                studentList:content
                            })
                    }
                }).catch(ex => {
                    // 发生错误
                    if (__DEV__) {
                        console.error('暂无数据, ', ex.message)
                    }
                })
    }
    //获取班级下的历史作业
    getClassHomework(loginToken,classId){
        const resultClassHomework=getClassHomework(loginToken,classId);
                resultClassHomework.then(res => {
                    return res.json()
                }).then(json => {
                    // 处理获取的数据
                    const data = json
                    if (data.result) {
                        let content=data.data.content;
                            for (var i = 0; i < content.length; i++) {
                                let inputTime=new Date(content[i].abortAt),//截止时间
                                    publishTime=new Date(content[i].publishAt),//发布时间
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
                                    content[i].newAbortAt=' '+M+D+' '+Hours+':'+Minute;
                                    content[i].newPublishAt='创建时间:'+' '+PublishY+PublishM+PublishD+' '+PublishHours+':'+PublishMinute;
                                    //如果当前时间大于截止时间，就标红，提示已截止
                                    console.log("当前时间戳",newDateParse)
                                    console.log("截止时间戳",content[i].abortAt)
                                    if(newDateParse>content[i].abortAt){
                                        content[i].isAsShow='inline-block';
                                        content[i].isNotAsShow='none';
                                    }else{
                                        content[i].isAsShow='none';
                                        content[i].isNotAsShow='inline-block';
                                    }
                                    //如果状态为2，那么就是有需要批改的
                                    if(content[i].state==2){
                                        content[i].isNeedCorrect='inline-block';
                                        content[i].isDetail='none';
                                    }else{
                                        content[i].isNeedCorrect='none';
                                        content[i].isDetail='inline-block';
                                    }
                            }
                            this.setState({
                                classHomeworkList:content
                            })
                    }
                }).catch(ex => {
                    // 发生错误
                    if (__DEV__) {
                        console.error('暂无数据, ', ex.message)
                    }
                })
    }
    //班级详情
    getClassDetails(loginToken,classId){
        const resultClassDetails=getClassDetails(loginToken,classId);
                resultClassDetails.then(res => {
                    return res.json()
                }).then(json => {
                    // 处理获取的数据
                    const data = json
                    if (data.result) {
                        let classDetails=data.data;
                            this.setState({
                                classDetails:classDetails
                            })
                    }
                }).catch(ex => {
                    // 发生错误
                    if (__DEV__) {
                        console.error('暂无数据, ', ex.message)
                    }
                })
    }
    //编辑班级
    editClass(loginToken,classId,name){
        const resultEditClass=editClass(loginToken,classId,name);
                resultEditClass.then(res => {
                    return res.json()
                }).then(json => {
                    // 处理获取的数据
                    const data = json
                    if (data.result) {
                        let classDetails=this.state.classDetails;
                            classDetails.name=this.state.classNameVal;
                            this.setState({
                                classDetails:classDetails,
                                isShowEditModal:false
                            })
                    }
                }).catch(ex => {
                    // 发生错误
                    if (__DEV__) {
                        console.error('暂无数据, ', ex.message)
                    }
                })
    }
    //删除班级
    delClass(loginToken,classId){
        const resultDelClass=delClass(loginToken,classId);
                resultDelClass.then(res => {
                    return res.json()
                }).then(json => {
                    // 处理获取的数据
                    const data = json
                    if (data.result) {
                            this.setState({
                                isShowModal:false
                            })
                            hashHistory.push('/homework-class');
                    }
                }).catch(ex => {
                    // 发生错误
                    if (__DEV__) {
                        console.error('暂无数据, ', ex.message)
                    }
                })
    }
    //删除作业
    delHomework(loginToken,homeworkId){
        const resultDelHomework=delHomework(loginToken,homeworkId);
                resultDelHomework.then(res => {
                    return res.json()
                }).then(json => {
                    // 处理获取的数据
                    const data = json
                    if (data.result) {
                        let classHomeworkList=this.state.classHomeworkList;
                            classHomeworkList.splice(this.state.homeworkIndex,1)
                            this.setState({
                                classHomeworkList:classHomeworkList,
                                isShowModal:false
                            })
                    }else {
                        this.setState({
                                isShowModal:false
                            })
                        message.warning(data.error)
                    }
                }).catch(ex => {
                    // 发生错误
                    if (__DEV__) {
                        console.error('暂无数据, ', ex.message)
                    }
                })
    }
    //删除学生
    delStudent(loginToken,classId,studentId){
        const resultDelStudent=delStudent(loginToken,classId,studentId);
                resultDelStudent.then(res => {
                    return res.json()
                }).then(json => {
                    // 处理获取的数据
                    const data = json
                    if (data.result) {
                        let studentList=this.state.studentList;
                            studentList.splice(this.state.stuIndex,1);
                            this.setState({
                                studentList:studentList,
                                isShowModal:false
                            })
                    }else {
                        this.setState({
                                isShowModal:false
                            })
                        message.warning(data.error)
                    }
                }).catch(ex => {
                    // 发生错误
                    if (__DEV__) {
                        console.error('暂无数据, ', ex.message)
                    }
                })
    }
    render() {
        let studentList=this.state.studentList,
            classHomeworkList=this.state.classHomeworkList,
            teacherInfo=JSON.parse(localStorage.getItem("teacherInfo"));
            console.log('老师',teacherInfo)
        return (
            <div className="homework-class-detail">
                <h1 className='header-nav'><Breadcrumb separator=">"><Breadcrumb.Item><Link to="/homework-class">我的班级</Link></Breadcrumb.Item><Breadcrumb.Item>班级详情</Breadcrumb.Item></Breadcrumb></h1>
                <Button type="primary" className="share-btn" onClick={this.inviteStuJoin.bind(this)}><span className="logo"><Icon type="plus" /></span><span className="text">邀请学生加入</span></Button>
                <p className="class-detail-title">
                    班级信息<span className="instructions-text">(分享入群邀请或告知学生班级号,学生安装欧拉学生端后,可加入群并完成作业)</span>
                </p>
                <div className="class-detail-text">
                    <span className="name">班级名称：{!!this.state.classDetails ? this.state.classDetails.name : ''}</span>
                    <span className="number">班级编号：{!!this.state.classDetails ? this.state.classDetails.id : ''}</span>
                    <span className="handle"><span onClick={this.editClassHandle.bind(this)}>编辑</span><span style={{color:'rgba(255, 65, 53, 1)'}} onClick={this.delClassHandle.bind(this)}>解散班级</span></span>
                </div>
                <div className="topic-class-report">
                    <Tabs defaultActiveKey="1" onChange={this.callback.bind(this)} >
                        <TabPane tab="班级成员" key="1">
                            {
                                studentList.length>0 ? studentList.map((item,index)=>{
                                    return <div className="student-sec" key={item.id} data-index={index} onMouseEnter={this.stuSecDelShowHandle.bind(this)} onMouseLeave={this.stuSecDelShowLeaveHandle.bind(this)}>
                                                {
                                                    item.stuSecDelShow==true ? <span className="del-box"><Icon type="delete" data-index={index} data-id={item.id} className="stu-del" onClick={this.stuDel.bind(this)}/></span> : ''
                                                }
                                                <Link to={'/homework-class-stuhistory'+'/'+this.props.params.classId+'/'+item.id}>
                                                    <img src={item.avatarUrl==null ? defaultAvatar : item.avatarUrl} alt="" className="head-portrait"/>
                                                    <span className="stu-name" title={item.nickname==null ? '欧拉学生' : item.nickname}>{item.nickname==null ? '欧拉学生' : item.nickname}</span>
                                                </Link>
                                            </div>
                                }) : <div style={{'font-size':'16px','text-align':'center','margin':'300px auto',"display":this.state.loadingShow=='block' ? 'none' : 'block'}}><Icon type="exclamation-circle" style={{marginRight:'5px',color:'rgba(255, 159, 0, 1)'}}/>暂无数据~</div>
                            }

                        </TabPane>
                        <TabPane tab="历史作业" key="2">
                        {
                            this.state.classHomeworkList.length>0 ? this.state.classHomeworkList.map((item,index)=>{
                                    return <div className="list-sec no-corrections" key={index}>
                                             <p className="date"><span>{item.newPublishAt}</span></p>
                                            <div className="mark-box homeworinfo-mark">
                                                <span className="class-mark" title={item.className}>{item.className}</span>
                                                <div className='homework-name-time'>
                                                    <h1 className="homework-mark">
                                                        <span style={{marginLeft:'-8px',float:'left','display':item.isNeedCorrect,color: '#ff8548'}}>【待批改】</span>
                                                        <span className="homework-name" title={item.name}>{item.name}</span>
                                                    </h1>
                                                    <p>
                                                     <span className="homeworknum-mark">共{item.questionCount}题</span>
                                                        <span className={item.isAsShow=='inline-block' ? 'alreadyAstime-tag' : 'astime-tag'}><span className="as-mark" style={{'display':item.isAsShow}}>已截止:</span><span className="as-mark" style={{'display':item.isNotAsShow}}>截止时间</span><span className="astimemonth-mark">{item.newAbortAt}</span></span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mark-box progress-mark-box">
                                                <p className="progress-bar">
                                                    <Progress strokeColor='rgba(45, 187, 85, 1)' strokeWidth={6} percent={(item.committedCount/item.allCount)*100} showInfo={false} status="active"/>
                                                </p>
                                                <p className="progress-bar-txt">
                                                    <span>已提交</span><span><span className="submitted">{item.committedCount}</span>/<span>{item.allCount}</span></span>
                                                </p>
                                            </div>
                                            <div className="mark-box progress-circle-mark-box">
                                                <p className="progress-circle-bar">
                                                    <Progress strokeColor='rgba(45, 187, 85, 1)' strokeWidth={6} type="circle" percent={item.accuracy} width={48} status="active"/>
                                                </p>
                                                <p className="progress-circle-text">正确率</p>
                                            </div>
                                            <div className="mark-box correcting-mark-box">

                                                {/*<Button type="primary" className="correcting-btn" style={{'display':item.isNeedCorrect}}>批改</Button>*/}
                                                {
                                                    item.state==2 ? <p>
                                                            <a href="javascript:;" className="detail-btn" data-id={item.id} onClick={this.jumpHomeworkStatis.bind(this)}>作业报告</a>
                                                            <Button type="primary" className="correcting-btn" data-id={item.id} onClick={this.jumpHomeworkDetail.bind(this)}>批改</Button>
                                                        </p> : <p>
                                                        <a href="javascript:;" className="detail-btn" data-id={item.id} onClick={this.jumpHomeworkStatis.bind(this)}>作业报告</a>
                                                        <a href="javascript:;" className="del-btn" data-id={item.id} onClick={this.homeworkDel.bind(this)}>删除</a>
                                                    </p>
                                                }
                                            </div>
                                    </div>

                            }) : <div style={{'font-size':'16px','text-align':'center','margin':'300px auto',"display":this.state.loadingShow=='block' ? 'none' : 'block'}}><Icon type="exclamation-circle" style={{marginRight:'5px',color:'rgba(255, 159, 0, 1)'}}/>暂无数据~</div>
                        }
                        </TabPane>
                    </Tabs>
                </div>
                <Modal
                  title={"编辑班级"}
                  visible={this.state.isShowEditModal}
                  cancelText="取消"
                  okText="确定"
                  width='400px'
                  onOk={this.handleOk.bind(this)}
                  onCancel={this.handleCancel.bind(this)}
                >
                  <p className="collection-info"><span className="collection-title">班级名称</span><span className="editInfo"><Input onChange={this.collectionNameHandle.bind(this)}  placeholder="请输入2-16个字"/></span></p>
                    <span className="error-text" style={{"display":this.state.classNameErrorShow}}><Icon type="close-circle-o" style={{color:'rgba(247, 79, 44, 1)'}} /><span>请输入2-16个字</span></span>
                </Modal>
                <Modal
                  title="提示"
                  visible={this.state.isShowModal}
                  cancelText="取消"
                  okText="确定"
                  width='400px'
                  onOk={this.delClassOk.bind(this)}
                  onCancel={this.delClassCancel.bind(this)}
                >
                  <p>{this.state.delContentText}</p>
                </Modal>
                <Modal
                  visible={this.state.invitedJoinShow}
                  width='400px'
                  onCancel={this.invitedJoinCancel.bind(this)}
                  footer={null}
                >
                  <p className="share-info">邀请学生加入作业群</p>
                  <p className="share-path">
                      <a className="weinxin-share" href="javascript:;" onClick={this.weinxinShare.bind(this)}></a>
                      {/*document.write('<a class="qcShareQQDiv" href="http://connect.qq.com/widget/shareqq/index.html?'+this.state.shareData.join('&')+'" target="_blank">分享到QQ</a>');*/}
                      <a className="weinxin-friend-share" href="javascript:;" onClick={this.shareFriend.bind(this)}></a>
                     {/* <a className="qq-share" href={"https://connect.qq.com/widget/shareqq/index.html?"+this.state.shareData.join('&')}></a>*/}
                  </p>
                </Modal>
                <Modal
                      title="班级分享"
                      className='share-modal'
                      visible={this.state.shareVisible}
                      onCancel={this.shareCancel.bind(this)}
                      okText={'确定'}
                      cancelText={'取消'}
                      footer={[]}
                    >
                     <Input value={'https://www.huazilive.com/tiku/share-class.html?classId='+this.props.params.classId+'&teacherName='+teacherInfo.nickname+'&timeStamp='+(new Date()).getTime()} style={{width:'368px',height:'36px',marginRight:'12px'}}/>

                     <CopyToClipboard text={'https://www.huazilive.com/tiku/share-class.html?classId='+this.props.params.classId+'&teacherName='+encodeURIComponent(teacherInfo.nickname)+'&timeStamp='+(new Date()).getTime()} onCopy={this.onCopy.bind(this)}>
                         <Button type="primary">{this.state.copyText}</Button>
                     </CopyToClipboard>
                     <p className='share-prompt'>将链接通过QQ、微信等任何方式发给相关人等,即可点击查看</p>
                </Modal>
            </div>
        )
    }
    weinxinShare(){
         window.open('inc/qrcode_img.php?url=https://zixuephp.net/article-1.html');
    }
    shareFriend(){
        /*var shareqqzonestring='https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?summary=1111111&url=https://tm.arcgisonline.cn:8038/App101/MapstoryBook/Default.html&pics=https://tm.arcgisonline.cn:8038/App101/MapstoryBook/css/Img/ShareBook.jpg';
         window.open(shareqqzonestring,'newwindow','height=400,width=400,top=100,left=100');  */
    }
    shareCancel(){
        this.setState({
            shareVisible:false
        })
    }
    onCopy(){
        this.setState({
            copyText:'复制成功'
        },()=>{
            setTimeout(()=>{
                this.setState({
                    copyText:'复制链接'
                })
            },500)
        })
    }
    //跳转报告
    jumpHomeworkStatis(e){
        localStorage.setItem('classJumpType',0);//为了区分班级作业和班级学生作业列表到批改页面-面包屑的区分
        let id=e.currentTarget.getAttribute('data-id');
            hashHistory.push('/homework-statistical/' + encodeURIComponent(id)+'/2/'+this.props.params.classId);
    }
     //跳转详情
    jumpHomeworkDetail(e){
        localStorage.setItem('classJumpType',0);//为了区分班级作业和班级学生作业列表到批改页面-面包屑的区分
        let id=e.currentTarget.getAttribute('data-id');
            hashHistory.push('/homework-detail/' + encodeURIComponent(id)+'/2/'+this.props.params.classId);
    }
    //试题报告 学生报告
    callback(e){

    }
    //学生列表移入显示删除
    stuSecDelShowHandle(e){
        let stuIndex=e.currentTarget.getAttribute("data-index"),
            studentList=this.state.studentList;
            studentList[stuIndex].stuSecDelShow=true;
            console.log(stuIndex)
            console.log(studentList[stuIndex])
            this.setState({
                studentList:studentList,
                flag:!this.state.flag
            })
    }
    //学生列表移出显示删除
    stuSecDelShowLeaveHandle(e){
        let stuIndex=e.currentTarget.getAttribute("data-index"),
            studentList=this.state.studentList;
            studentList[stuIndex].stuSecDelShow=false;
            this.setState({
                studentList:studentList,
                flag:!this.state.flag
            })
    }
    //班级名称
    collectionNameHandle(e){
      console.log(e.target.value)
      if(e.target.value.length>1&&e.target.value.length<17){
        this.setState({
            classNameVal:e.target.value,
            classNameErrorShow:'none'
          })
      }else{
        this.setState({
            classNameErrorShow:'block'
          })
      }
    }
    //编辑班级-弹窗显示
    editClassHandle(){
        console.log("编辑")
        this.setState({
            isShowEditModal:true,
        })
    }
    //编辑班级
    handleOk(e){
        if(this.state.classNameErrorShow=='block'){
            return;
        }
        let classId=this.props.params.classId,
            name=this.state.classNameVal;
            this.editClass.bind(this,loginToken,classId,name)()
    }
    //取消
    handleCancel(e){
        console.log(e);
        this.setState({
          isShowEditModal: false,
        });
    }
    //删除班级-弹窗显示
    delClassHandle(){
        this.setState({
          isShowModal: true,
          delContentText:'是否要解散班级？',
          delDistinguish:0
        });
    }
    //删除班级/删除作业
    delClassOk(e){
        let classId=this.props.params.classId,
            studentId=this.state.stuId,
            homeworkId=this.state.homeworkId,
            delDistinguish=this.state.delDistinguish;
            if(delDistinguish==0){
                this.delClass.bind(this,loginToken,classId)()
            }else if(delDistinguish==1){
                this.delHomework.bind(this,loginToken,homeworkId)()
            }else if(delDistinguish==2){
                this.delStudent.bind(this,loginToken,classId,studentId)()
            }
    }
    //取消
    delClassCancel(e){
        this.setState({
            isShowModal:false
        })
    }
    //删除指定作业
    homeworkDel(e){
        console.log(e.target.getAttribute('data-id'))
        //this.state.isShowModal=true;
        let id=e.target.getAttribute('data-id'),
            index=e.target.getAttribute('data-index');
            this.setState({
                isShowModal:true,
                delContentText:'是否要删除此作业？',
                delDistinguish:1,
                homeworkIndex:index,
                homeworkId:id
            })

    }
    //删除成员
    stuDel(e){
        let id=e.target.getAttribute('data-id'),
            index=e.target.getAttribute('data-index');
            this.setState({
                isShowModal:true,
                delContentText:'是否要删除此成员？',
                delDistinguish:2,
                stuIndex:index,
                stuId:id
            })
    }
    //邀请学生加入
    inviteStuJoin(){
        this.setState({
            shareVisible:true
            /*invitedJoinShow:true*/
        })
    }
    //取消邀请学生加入弹窗
    invitedJoinCancel(){
        this.setState({
            invitedJoinShow:false
        })
    }
}

export default HomeDetail
