import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import { Link, hashHistory } from 'react-router'
import { Radio, Checkbox, Modal, Form, Icon, Input, Button, Row, Col, Select} from 'antd';
import { saveDefault } from '../../fetch/decorate-homework/decorate-homework'

import './style.less'
const loginToken=localStorage.getItem("loginToken");
class Dialog extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
        this.state={
          leaveVisible:false
        }

    }
    //当组件接收到新的 props 时，会触发该函数。在改函数中，通常可以调用 this.setState 方法来完成对 state 的修改。
    componentWillReceiveProps(nextProps){
      console.log('dialogFlag',this.props.dialogFlag,nextProps.dialogFlag,nextProps.leaveVisible)
      if(this.props.dialogFlag!=nextProps.dialogFlag){
          this.setState({
            leaveVisible:nextProps.leaveVisible
         })
      }
       
    }
    componentWillMount (){
      
    }
  
    render() {
      console.log('dialogFlag-render',this.state.leaveVisible)
        return (
            <Modal
                  title="提示"
                  maskClosable={false}
                  visible={this.state.leaveVisible}
                  onOk={this.leaveHandleOk.bind(this)}
                  onCancel={this.leaveHandleCancel.bind(this)}
                  closable={false}
                  okText={'确定'}
                  cancelText={'取消'}
                >
                  <p style={{'fontSize':'18px'}}>已添加{this.props.topicSel}题，是否保存草稿</p>
                </Modal>
        )
    }
    leaveHandleOk(e){
       this.props.noticeLeaveOk.bind(this)()
    }
    leaveHandleCancel(e){
      this.props.noticeLeaveCancel.bind(this)()
    }
    
    
   
}
export default Dialog