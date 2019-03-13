import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import { Pagination } from 'antd';

import './style.less'

class pagination extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
        this.state = {
         /* current:1*/
        }
    }
    componentWillReceiveProps(nextProps){
        console.log('分页接收属性',this.props.currentPage,nextProps.currentPage)
      /*  if(this.props.topicListLen!=nextProps.topicListLen){
            this.setState({
              current:1
            })
        }*/
    }
    render() {
        console.log('分页当前页数',this.props.currentPage)
        return (
          <Pagination current={this.props.currentPage}  hideOnSinglePage={true} onChange={this.onSelect.bind(this)} total={this.props.topicListLen*10} />
        );
    }
    //通知父组件当前页数
    onSelect(page){
        console.log('选择页数',page)
        this.props.paginationSel.bind(this,page)();
  }
}

export default pagination
