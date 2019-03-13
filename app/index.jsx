import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { hashHistory } from 'react-router'
import configureStore from './store/configureStore'

import './static/css/common.less'
import './static/css/edit.less'
import './static/css/font.css'
import 'antd/dist/antd.css'
import '../src/default.less'
import 'babel-polyfill'

// 创建 Redux 的 store 对象
const store = configureStore()

import RouteMap from './router/routeMap'

render(
    <Provider store={store}>
        <RouteMap history={hashHistory}/>
    </Provider>,
    document.getElementById('root')
)
