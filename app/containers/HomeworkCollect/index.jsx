/**
 * 我的习题
 */
import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import { Link, hashHistory } from 'react-router'
import { Menu, Icon , Button , Input , Dropdown, Modal , message , Breadcrumb,Spin} from 'antd';
import { getCollectList , editCollect , addCollect , delCollect} from '../../fetch/homework-collect/homework-collect'
import * as Constants from '../../constants/store'
import logo from '../../static/img/collect-sel.png'
import './style.less'


const collectLogo=require("../../static/img/collect-logo.png");
const loginToken=localStorage.getItem("loginToken");
class HomeworkCollect extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
        this.state={
            visible:false,
            isShowModal:false,
            collectListData:[],//习题集列表
            collectionText:"",//弹窗文本
            noticeIndex:'',//通知当前编辑和删除的是哪个习题集索引
            noticeCollectId:'',//通知当前编辑和删除的是哪个习题集id
            collectType:"",//判断是创建还是编辑 0 创建 1 编辑
            collectionNameVal:'',//创建-编辑习题集名称
            collectionNameErrorShow:'none',
            isShowModal:false,
            loadingShow:'block',
            flag:true
        }
    }
    componentWillMount(){
        let questionId=0;
            //请求获取收藏习题集列表
            this.getCollectList.bind(this,loginToken,questionId)()
            //通知左侧menu导航-当前在那个menu下
            localStorage.setItem('positionMenu',JSON.stringify(['4']));
    }
    //请求获取收藏习题集列表
    getCollectList(loginToken,questionId){
        const resultCollect=getCollectList(loginToken,questionId);
                resultCollect.then(res => {
                    return res.json()
                }).then(json => {
                    // 处理获取的数据
                    const data = json
                    if (data.result) {
                        let collectListData=data.data;
                            this.setState({
                                collectListData:collectListData,
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
    //添加一个习题集
    addCollect(loginToken,name){
        this.setState({
            collectListData:[],
            loadingShow:'block'
        })
        const resultAddCollect=addCollect(loginToken,name);
                resultAddCollect.then(res => {
                    return res.json()
                }).then(json => {
                    // 处理获取的数据
                    const data = json
                    if (data.result) {
                       this.setState({
                          flag:!this.state.flag
                        },()=>{
                            this.getCollectList.bind(this,loginToken,0)()
                        });
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
    //修改习题集
    editCollect(loginToken,collectId,name){
        const resultAddCollect=editCollect(loginToken,collectId,name);
                resultAddCollect.then(res => {
                    return res.json()
                }).then(json => {
                    // 处理获取的数据
                    const data = json
                    if (data.result) {
                        let collectListData=this.state.collectListData;
                            collectListData[this.state.noticeIndex].name=this.state.collectionNameVal;
                           this.setState({
                              visible: false,
                              collectListData:collectListData
                            },()=>{
                                this.getCollectList.bind(this,loginToken,0)()
                            });

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
    //删除习题集
    delCollect(loginToken,collectId){
        const resultDelCollect=delCollect(loginToken,collectId);
                resultDelCollect.then(res => {
                    return res.json()
                }).then(json => {
                    // 处理获取的数据
                    const data = json
                    if (data.result) {
                        let collectListData=this.state.collectListData;
                            collectListData.splice(this.state.noticeIndex,1)
                            this.setState({
                              isShowModal: false,
                              collectListData:collectListData
                            });
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
    render() {
        const menu = (
          <Menu onClick={this.handleMenuClick.bind(this)}>
            <Menu.Item key="1">编辑习题集</Menu.Item>
            <Menu.Item key="2">删除</Menu.Item>
          </Menu>
        );
        let collectListData=this.state.collectListData;
        console.log("收藏",collectListData)
        return (
            <div className="homework-collect">
                <h1 className='header-nav'><Breadcrumb separator=">"><Breadcrumb.Item>我的习题</Breadcrumb.Item></Breadcrumb></h1>
                <Button type="primary" className="entry-topic"><a href={Constants.teachLutiUrl+loginToken} target="blank">录入习题</a></Button>
                <Button type="primary" className="create-test-collection" onClick={this.createCollect.bind(this)}>创建习题集</Button>
                <div className="list-sec no-corrections" style={{"display":this.state.loadingShow}}>
                    <Spin size="large" style={{"fontSize":"30px","display":'block','margin':'300px auto'}}/>
                </div>
                <div className="test-collection-list" >
                    {
                        collectListData.length>0 ? collectListData.map((item,index)=>{
                            return <div className="test-collection-sec" key={index}>
                                        <Link to={'/homework-collect-topic/'+item.id+'/'+item.type}>
                                            {
                                                item.type!=1 ? <Dropdown overlay={menu} placement="bottomRight" onMouseEnter={this.noticeIndex.bind(this)}>
                                                      <Button className="test-collection-dropdown" data-index={index} data-collectId={item.id}>
                                                        <Icon type="ellipsis" />
                                                      </Button>
                                                    </Dropdown> : ''
                                            }

                                            <div className="test-collection-logo">
                                                <img src={collectLogo} alt=""/>
                                            </div>
                                            <p className="test-collection-name" title={item.name}>{item.name}</p>
                                            <p className="test-collection-num">共{item.questionCount==null ? 0 : item.questionCount}道题</p>
                                        </Link>
                                    </div>
                        }) : <div style={{'fontSize':'16px','textAlign':'center','margin':'300px auto',"display":this.state.loadingShow=='block' ? 'none' : 'block'}}><Icon type="exclamation-circle" style={{marginRight:'5px',color:'rgba(255, 159, 0, 1)'}}/>暂无数据~</div>
                    }
                </div>
                <Modal
                  title={this.state.collectionText}
                  visible={this.state.visible}
                  cancelText="取消"
                  okText="确定"
                  width='400px'
                  onOk={this.handleOk.bind(this)}
                  onCancel={this.handleCancel.bind(this)}
                >
                  <p className="collection-info">
                    <span className="collection-title">题集名称</span>
                    <span className="editInfo">
                    <Input ref="collectInput" value={this.state.collectionNameVal} onChange={this.collectionNameHandle.bind(this)}  placeholder="请输入1-8个字"/></span>
                  </p>
                  <span className="collection-error-text" style={{"display":this.state.collectionNameErrorShow}}><Icon type="close-circle-o" style={{color:'rgba(247, 79, 44, 1)'}} /><span>请输入1-8个字</span></span>
                </Modal>
                <Modal
                  title="提示"
                  visible={this.state.isShowModal}
                  cancelText="取消"
                  okText="确定"
                  width='400px'
                  onOk={this.delCollectOk.bind(this)}
                  onCancel={this.delCollectCancel.bind(this)}
                >
                  <p>是否要删除习题集？</p>
                </Modal>
            </div>
        )
    }
    noticeIndex(e){
        console.log(e.target)
        let noticeCollectId=e.target.getAttribute('data-collectId'),
            noticeIndex=e.target.getAttribute('data-index');
            this.setState({
                noticeIndex:noticeIndex,
                noticeCollectId:noticeCollectId
            })
    }
    //创建错题集
    createCollect(){
        this.setState({
            visible:true,
            collectType:0,
            collectionNameVal:'',//每次调出创建习题集都清空
            collectionText:"创建习题集",
            collectionNameErrorShow:'none'
        })
    }
    //习题集名称
    collectionNameHandle(e){
      console.log(e.target.value)
      if(Constants.Trim(e.target.value).length>0&&Constants.Trim(e.target.value).length<9){
        this.setState({
            collectionNameVal:e.target.value,
            collectionNameErrorShow:'none'
          })
      }else{
        this.setState({
            collectionNameVal:e.target.value,
            collectionNameErrorShow:'block'
          })
      }
    }
    //选中下拉功能
    handleMenuClick(e){
        console.log(e)
        let key=e.key;
            if(key==1){//编辑习题集
                this.setState({
                    visible:true,
                    collectType:1,
                    collectionText:"编辑习题集"
                })
            }else if(key==2){//删除
                this.setState({
                    isShowModal:true
                })
            }
    }
    //下拉错题集显示
    handleButtonClick(){

    }
    //添加/编辑一个习题集
    handleOk(e){
        console.log()
        if(this.state.collectionNameErrorShow=='block'){
            this.refs.collectInput.focus()
            return;
        }else if(this.state.collectionNameVal==''){
            this.setState({
                collectionNameErrorShow:'block'
            })
            this.refs.collectInput.focus()
            return;
        }
        let collectType=this.state.collectType,
            noticeCollectId=this.state.noticeCollectId,
            name=this.state.collectionNameVal;
            if (collectType==0) {//创建
                this.addCollect.bind(this,loginToken,name)()
            }else if(collectType==1){//编辑
                this.editCollect.bind(this,loginToken,noticeCollectId,name)()
            }
        this.setState({
          visible: false
        });

    }
    //取消
    handleCancel(e){
        console.log(e);
        this.setState({
          visible: false,
        });
    }
    //删除习题集
    delCollectOk(e){
        let noticeCollectId=this.state.noticeCollectId;
            this.delCollect.bind(this,loginToken,noticeCollectId)()
    }
    //取消
    delCollectCancel(e){
        this.setState({
            isShowModal:false
        })
    }
}

export default HomeworkCollect
