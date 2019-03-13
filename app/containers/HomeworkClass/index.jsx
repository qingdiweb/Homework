/**
 * 我的班级
 */
import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import { Link, hashHistory } from 'react-router'
import { Menu, Icon , Button , Input , Dropdown, Modal , message , Breadcrumb,Spin} from 'antd';
import { getClassList , editCollect , addClass , delCollect} from '../../fetch/homework-class/homework-class'
import * as Constants from '../../constants/store'
import './style.less'

const loginToken=localStorage.getItem("loginToken");
class HomeworkCollect extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
        this.state={
            visible:false,
            isShowModal:false,
            classData:[],//班级列表
            classNameVal:'',//创建-编辑习题集名称
            classNameErrorShow:'none',
            isShowModal:false,
            createLoadingShow:'none',
            loadingShow:'block',
            flag:true
        }
    }
    componentWillMount(){
            //请求获取收藏班级列表
            this.getClassList.bind(this,loginToken)()
            //通知左侧menu导航-当前在那个menu下
            localStorage.setItem('positionMenu',JSON.stringify(['5']));
    }
    //请求获取班级列表
    getClassList(loginToken){
        const resultClassList=getClassList(loginToken);
                resultClassList.then(res => {
                    return res.json()
                }).then(json => {
                    // 处理获取的数据
                    const data = json
                    if (data.result) {
                        let classData=data.data.content;
                            this.setState({
                                classData:classData,
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
    //添加一个班级
    addClass(loginToken,name){
        this.setState({
          /*  classData:[],*/
            createLoadingShow:'block'
        })
        const resultAddCollect=addClass(loginToken,name);
                resultAddCollect.then(res => {
                    return res.json()
                }).then(json => {
                    // 处理获取的数据
                    const data = json
                    if (data.result) {
                       this.setState({
                          createLoadingShow:'none',
                          flag:!this.state.flag
                        });
                       //this.getClassList.bind(this,loginToken)()
                        hashHistory.push('/homework-class-detail/'+data.data.id)
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
        let classData=this.state.classData;
        return (
            <div className="homework-class">
                <h1 className='header-nav'><Breadcrumb separator=">"><Breadcrumb.Item>我的班级</Breadcrumb.Item></Breadcrumb></h1>
                <Button type="primary" className="create-test-collection" onClick={this.createClass.bind(this)}>创建班级</Button>
                <div className="list-sec no-corrections" style={{"display":this.state.loadingShow}}>
                    <Spin size="large" style={{"fontSize":"30px","display":'block','margin':'300px auto'}}/>
                </div>
                <div className="list-sec no-corrections create-class-corrections" style={{"display":this.state.createLoadingShow}}>
                    <span style={{"fontSize":"18px","display":'block','textAlign':'center','margin':'300px auto 0px'}}>创建中</span>
                    <Spin size="large" style={{"fontSize":"30px","display":'block','margin':'0px auto'}}/>
                </div>
                <div className="test-collection-list" >
                    {
                        classData.length>0 ? classData.map((item,index)=>{
                            return <div className="test-collection-sec" key={index}>
                                        <Link to={'/homework-class-detail/'+item.id}>
                                            <div className="test-collection-logo">

                                            </div>
                                            <p className="test-collection-name" title={item.name}>{item.name}</p>
                                            <p className="test-collection-num">共{item.studentCount==null ? 0 : item.studentCount}人</p>
                                        </Link>
                                    </div>
                        }) : <div style={{'font-size':'16px','text-align':'center','margin':'300px auto',"display":this.state.loadingShow=='block' ? 'none' : 'block'}}><Icon type="exclamation-circle" style={{marginRight:'5px',color:'rgba(255, 159, 0, 1)'}}/>暂无数据~</div>
                    }
                </div>
                <Modal
                  title={"创建班级"}
                  visible={this.state.visible}
                  cancelText="取消"
                  okText="确定"
                  width='400px'
                  onOk={this.handleOk.bind(this)}
                  onCancel={this.handleCancel.bind(this)}
                >
                  <p className="collection-info"><span className="collection-title">班级名称</span><span className="editInfo"><Input ref="classInput" value={this.state.classNameVal} onChange={this.collectionNameHandle.bind(this)}  placeholder="请输入2-16个字"/></span></p>
                    <span className="class-error-text" style={{"display":this.state.classNameErrorShow}}><Icon type="close-circle-o" style={{color:'rgba(247, 79, 44, 1)'}} /><span>请输入1-8个字</span></span>
                </Modal>
            </div>
        )
    }
    //创建班级
    createClass(){
        this.setState({
            visible:true,
            classNameVal:'',//每次调出创建班级都清空
            classNameErrorShow:'none'
        })
    }

    //班级名称
    collectionNameHandle(e){
      console.log(Constants.Trim(e.target.value).length)
      if(Constants.Trim(e.target.value).length>0&&Constants.Trim(e.target.value).length<17){
        this.setState({
            classNameVal:e.target.value,
            classNameErrorShow:'none'
          })
      }else{
        this.setState({
            classNameVal:e.target.value,
            classNameErrorShow:'block'
          })
      }
    }


    //添加/编辑一个班级
    handleOk(e){
        if(this.state.classNameErrorShow=='block'){
            this.refs.classInput.focus()
            return;
        }else if(this.state.classNameVal==''){
            this.setState({
                classNameErrorShow:'block'
            })
            this.refs.classInput.focus()
            return;
        }
        let name=this.state.classNameVal;
            this.addClass.bind(this,loginToken,name)()
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

}

export default HomeworkCollect
