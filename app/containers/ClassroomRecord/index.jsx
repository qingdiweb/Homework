/**
 * 课堂记录
 */
import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import { Link, hashHistory } from 'react-router'
import { Menu, Icon , Button , Select , DatePicker , Breadcrumb,Input, Cascader,message } from 'antd';
import { getLastOperation,getAllTextbookListData} from '../../fetch/decorate-homework/decorate-homework';
import RTreeSelect from '../../components/TreeSelect';
import ExerciseList from '../../components/ExerciseList';
import * as Constants from '../../constants/store'


import moment from 'moment';
import datalocale from 'antd/lib/date-picker/locale/zh_CN';

import './style.less'
const Option = Select.Option;
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;
const loginToken=localStorage.getItem("loginToken");
class ClassroomRecord extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
        this.state={
            teacherInfoFill:false,//判断老师信息是否完整,如果不完整就提示填写
            screening:{
                catalogId:'',//章节
                createdAtStart:'',//时间筛选0点时间戳
                createdAtEnd:'',//时间筛选24点时间戳
            },
            findFlag:false,//查题flag
            flag:false,
            dateValue:undefined,//修改日期
            referenceType:1,//0 是课堂练习 1 课堂记录
            versionInfoList:[],//版本-教材-章节
            defaultCascaderValue:[],
            timeStamp:''
        }
    }
    componentWillMount(){
        let teacherInfo=JSON.parse(localStorage.getItem("teacherInfo")),
            stageId=teacherInfo.stageId,
            subjectId=teacherInfo.subjectId;
            //获取教材信息
            this.getAllTextbookListData.bind(this,stageId,subjectId,'')().then((data)=>{
                //查询最后操作的教材id-将上一次操作的章节更新树结构上面去
                this.getLastOperation.bind(this,loginToken)();
            }).catch((ex)=>{
                message.info(ex.message)
            });
            //通知左侧menu导航-当前在那个menu下
            localStorage.setItem('positionMenu',JSON.stringify(['7']));
    }

    //获取版本-教材-章节
    getAllTextbookListData(stageId,subjectId,extParam){
        return new Promise((resolve,reject)=>{
            const resultTextbook = getAllTextbookListData(stageId,subjectId,extParam)
                resultTextbook.then(res => {
                    return res.json()
                }).then(json => {
                    // 处理获取的数据
                    const data = json
                    if (data.result) {
                        let versionInfoList=data.data;
                            versionInfoList.forEach((item,index)=>{
                                item.key=item.editionId;
                                item.value=item.editionId;
                                item.label=item.edition;
                                item.children=item.textbookInfoList;
                                item.textbookInfoList.forEach((ele,i)=>{
                                    ele.key=ele.textbookId;
                                    ele.value=ele.textbookId;
                                    ele.label=ele.name;
                                })
                            })
                            versionInfoList=this.dealrenderTreeNodes.bind(this,versionInfoList,'catalogInfoList')()
                            this.setState({
                                versionInfoList:versionInfoList
                            })
                            resolve(versionInfoList)
                    }
                }).catch(ex => {
                    // 发生错误
                    reject(ex.message)
                    if (__DEV__) {
                        console.error('暂无数据, ', ex.message)
                    }
                })
        })
    }
    //查询最后操作的教材(教辅)和章节
    getLastOperation(loginToken){
        let teacherInfo=JSON.parse(localStorage.getItem("teacherInfo")),
            stageId=teacherInfo.stageId,
            subjectId=teacherInfo.subjectId;
            const resultLastOperation = getLastOperation(loginToken);
                    resultLastOperation.then(res => {
                        return res.json()
                    }).then(json => {
                        // 处理获取的数据
                        const data = json
                        if (data.result) {
                            let lastOperation=data.data,
                                lastStageId=Constants.isFormat(lastOperation.textbook,String) ? lastOperation.textbook.lastStageId : '',
                                lastSubjectId=Constants.isFormat(lastOperation.textbook,String) ? lastOperation.textbook.lastSubjectId : '',
                                lastEditionId=Constants.isFormat(lastOperation.textbook,String) ? lastOperation.textbook.lastEditionId : '',
                                lastTextbookId=Constants.isFormat(lastOperation.textbook,String) ? lastOperation.textbook.lastTextbookId : '',
                                lastCatalogId=Constants.isFormat(lastOperation.textbook,String) ? (stageId!=lastStageId||subjectId!=lastSubjectId) ? '' : lastOperation.textbook.lastCatalogId : '',
                                lastCatalogIds=Constants.isFormat(lastOperation.textbook,String) ? lastOperation.textbook.lastCatalogIds : '',
                                defaultCascaderValue=(stageId!=lastStageId||subjectId!=lastSubjectId) ? [] : lastEditionId=='' ? [] : (lastEditionId+','+lastTextbookId+','+lastCatalogIds).split(',').map(item=>item=parseInt(item));
                                console.log('检查',teacherInfo,lastStageId,'空格',lastCatalogId)
                                this.setState({
                                  object:this.state.screening.catalogId=lastCatalogId,//章节value
                                  defaultCascaderValue:defaultCascaderValue,
                                  timeStamp:(new Date()).getTime()*Math.random(),
                                  flag:!this.state.flag,
                                  findFlag:!this.state.findFlag
                                })
                         }
                    }).catch(ex => {
                        // 发生错误
                        if (__DEV__) {
                          console.error('暂无数据, ', ex.message)
                        }
                    })

    }
    render() {
        console.log('defaultCascaderValue',this.state.defaultCascaderValue)
        return (
            <div className='classroom-record'>
                <h1 className='header-nav'><Breadcrumb separator=">"><Breadcrumb.Item >课堂记录</Breadcrumb.Item></Breadcrumb></h1>
                <div className='index-head-search'>
                    <Cascader  key={this.state.timeStamp} defaultValue={this.state.defaultCascaderValue} className='cascader-catalog-sel' options={this.state.versionInfoList} onChange={this.cascaderChange.bind(this)} placeholder="请选择章节" />
                    <DatePicker className="datepickSel" locale={datalocale} allowClear={false} placeholder="日期筛选" value={this.state.dateValue}  onChange={this.datePickHandle.bind(this)} />
                    <Button className="searchBtn" type="primary" onClick={this.searchExerciseList.bind(this)}>查找</Button>
                    <Button className="resetBtn" type="" onClick={this.resetSearch.bind(this)}>重置</Button>
                </div>
                <div className="">
                    <ExerciseList flag={this.state.findFlag} screening={this.state.screening}  referenceType={this.state.referenceType}/>
                </div>
            </div>
        )
    }
    cascaderChange(value){
        console.log('块级',value)
        this.setState({
            object:this.state.screening.catalogId=value.pop().toString()//章节value
        })
    }
    //日期选择
    datePickHandle(date, dateString){
        if(date===null){
            this.setState({
                object:this.state.screening.createdAtStart='',
                object:this.state.screening.createdAtEnd='',
                dateValue:undefined
            })
        }else{
            let stateTime=dateString+' '+'00:00',
                endTime=dateString+' '+'23:59',
                createdAtStart=new Date(stateTime).getTime(),
                createdAtEnd=new Date(endTime).getTime();
                this.setState({
                    object:this.state.screening.createdAtStart=createdAtStart,
                    object:this.state.screening.createdAtEnd=createdAtEnd,
                    dateValue:moment(moment(dateString))
                })
        }
    }
    //查找练习
    searchExerciseList(){
        this.setState({
            findFlag:!this.state.findFlag
        })
    }
    //重置
    resetSearch(){
        this.setState({
            object:this.state.screening.createdAtStart='',//0点日期数据置空
            object:this.state.screening.createdAtEnd='',//24点日期数据置空
            object:this.state.screening.catalogId='',//24点日期数据置空
            dateValue:undefined,//日期置空
            defaultCascaderValue:[],
            timeStamp:(new Date()).getTime()*Math.random(),
            flag:!this.state.flag
        })
    }
    //处理版本，教材 章节数据
    dealrenderTreeNodes(datavalue,childvalue){
        datavalue.map((item) => {
            if(item['edition']){
                item.children.map((ele) => {
                    if (ele[childvalue]) {
                        ele.children=ele[childvalue];
                        this.dealrenderTreeNodes(ele[childvalue],childvalue)
                    }else{
                        ele.children=[];
                    }
                });
            }else{
                item.key=item.id;
                item.value=item.id;
                item.label=item.name;
                if (item[childvalue]) {
                    item.children=item[childvalue];
                    this.dealrenderTreeNodes(item[childvalue],childvalue)
                }else{
                    item.children=[];
                }
            }
        });
        return datavalue
    }

}

export default ClassroomRecord
