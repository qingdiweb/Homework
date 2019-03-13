import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import { Link, hashHistory } from 'react-router'
import { Modal, message , Button } from 'antd';
import { getTopicListData , DefaultDraftDelQuestion} from '../../fetch/decorate-homework/decorate-homework'
import { delDraftListData } from '../../fetch/no-publish-homework/no-publish-homework'
import { delHomeworkList } from '../../fetch/index-homework/index-homework'
import { delExerciseList } from '../../fetch/classroom-exercise/classroom-exercise'


const loginToken=localStorage.getItem("loginToken");
class DelModal extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
        this.state={
            visible: false
        }
    }
    componentWillReceiveProps(nextProps){
     /* this.setState({
        likesIncreasing: nextProps.likeCount > this.props.likeCount
      });*/
        console.log('生命周期'+nextProps.isShowModal)
        console.log(nextProps.homeworkId)
        this.setState({
          visible: nextProps.isShowModal
        });
    }
    handleOk(e){
        console.log(e);
        //作业首页列表-删除作业
        if(this.props.parentType==0){
          let id=this.props.homeworkId;
              const resultDelhomework=delHomeworkList(loginToken,id);
                   resultDelhomework.then(res => {
                      return res.json()
                  }).then(json => {
                      // 处理获取的数据
                      const data = json
                      this.setState({
                        visible: false,
                      });
                      if (data.result) {
                          //通知父组件设定为false
                          this.props.noticeHomework.bind(this,false,id)()
                          message.success('删除成功');
                      }else{
                          this.props.noticeHomework.bind(this,false,'')()
                          message.warning(data.error);
                      }
                  }).catch(ex => {
                      // 发生错误
                      if (__DEV__) {

                          console.error('暂无数据, ', ex.message)
                      }
                  })
        }else if(this.props.parentType==1){//查看已选-删除草稿里的题
          let draftId=this.props.draftId,
              id=this.props.topicId;
              this.props.noticeHomework.bind(this,false,id)()
         /*   const resultDelQuestion=DefaultDraftDelQuestion(loginToken,draftId,id);
                      resultDelQuestion.then(res=>{
                        return res.json()
                      }).then(json => {
                        // 处理获取的数据
                        const data = json
                        this.setState({
                          visible: false,
                        });
                        if (data.result) {
                          //通知父组件设定为false
                          this.props.noticeHomework.bind(this,false,id)()
                          message.success('删除成功');
                        }
                        else{
                            message.warning(data.error);
                        } 
                      }).catch(ex =>{
                        // 发生错误
                        if (__DEV__) {
                            console.error('暂无数据, ', ex.message)
                        }
                      }) */
        }else if(this.props.parentType==2){//未发布作业-删除指定草稿
           let draftId=this.props.draftId
                const resultDelDraft=delDraftListData(loginToken,draftId);
                      resultDelDraft.then(res=>{
                        return res.json()
                      }).then(json => {
                        // 处理获取的数据
                        const data = json
                        this.setState({
                          visible: false,
                        });
                        if (data.result) {
                          //通知父组件设定为false
                          console.log("未发布作业通知")
                          this.props.noticeHomework.bind(this,false,draftId)()
                          message.success('删除成功');
                        }
                        else{
                            message.warning(data.error);
                        } 
                      }).catch(ex =>{
                        // 发生错误
                        if (__DEV__) {
                            console.error('暂无数据, ', ex.message)
                        }
                      })
        }else if(this.props.parentType==3){//随堂练习-删除指定练习
           let exerciseId=this.props.exerciseId
                const resultDelDraft=delExerciseList(loginToken,exerciseId);
                      resultDelDraft.then(res=>{
                        return res.json()
                      }).then(json => {
                        // 处理获取的数据
                        const data = json
                        this.setState({
                          visible: false,
                        });
                        if (data.result) {
                          //通知父组件设定为false
                          this.props.noticeHomework.bind(this,false,exerciseId)()
                          message.success('删除成功');
                        }
                        else{
                            message.warning(data.error);
                        } 
                      }).catch(ex =>{
                        // 发生错误
                        if (__DEV__) {
                            console.error('暂无数据, ', ex.message)
                        }
                      })
        }
        
        
    }
    handleCancel(e){
        console.log(e);
        this.setState({
          visible: false,
        });
        //通知父组件设定为false
        this.props.noticeHomework.bind(this,false,'')()
    }
    render() {
    return (
      <div>
        <Modal
          title="提示"
          visible={this.state.visible}
          cancelText="取消"
          okText="确定"
          width='400px'
          onOk={this.handleOk.bind(this)}
          onCancel={this.handleCancel.bind(this)}
        >
          <p>{this.props.parentType==1 ? '是否要删除试题？' : this.props.parentType==3 ? '是否要删除练习？' : '是否要删除作业？'}</p>
        </Modal>
      </div>
    );
    }
}

export default DelModal