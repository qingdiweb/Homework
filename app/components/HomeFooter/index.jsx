import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import { Link, hashHistory } from 'react-router'
import { Button } from 'antd';

import './style.less'

class HomeFooter extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    }
    render() {
        return (
            <div id="home-footer" className="clear-fix">
                <div className="product-recordNumber">
                    <p className="product"><span>欧拉教育学生版</span><span>欧拉教育教师版</span><span>欧拉教育pc版</span><span>服务热线：400-8008540</span></p>
                    <p className="record-number"><span>Copyright © 2018 青帝教育科技（北京）有限公司版权所有. 京公网安备110108020135210号 京ICP备18037313号-1</span></p>
                </div>
            </div>
        )
    }
  /*  enterHandle(value) {
        hashHistory.push('/search/all/' + encodeURIComponent(value))
    }*/
}

export default HomeFooter