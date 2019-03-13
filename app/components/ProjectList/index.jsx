import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import { Link, hashHistory } from 'react-router'
import { fromJS } from 'immutable';
import { DraggableArea, DraggableAreasGroup} from 'react-draggable-tags';
import { Radio , Checkbox , Select , Icon , Input , Modal , Row , Col , Button,Breadcrumb,Spin} from 'antd';
import { getTopicListData , getDefaultQuestionList , collectSearchList , addorcancelCollect , addProblem,getProjectList,getRecommendList} from '../../fetch/decorate-homework/decorate-homework'
import DecorateList from '../DecorateList'
import $ from  'jquery'

import './style.less'

const Option = Select.Option;
const loginToken=localStorage.getItem("loginToken");
class ProjectList extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
        this.state={
            parentType:3,
            flag:false,
            projectType:'',
            checkAll:false,
            indeterminate:true,
            timeStamp:(new Date()).getTime()
        }

    }
    componentWillMount(){
        
    }
    componentDidMount(){
        console.log('专题类型props初始化',this.props.projectType)
        if(this.props.projectType==1){
            $('.project-sec').eq(0).find('span').addClass('specify');
        }else if(this.props.projectType==2){
            /*$('.project-sec').eq(1).find('span').addClass('specify');*/
            $('.project-sec').eq(0).find('span').addClass('specify');
        }else if(this.props.projectType==3){
            /*$('.project-sec').eq(2).find('span').addClass('specify');*/
            $('.project-sec').eq(1).find('span').addClass('specify');
        }else if(this.props.projectType==4){
            /*$('.project-sec').eq(3).find('span').addClass('specify');*/
            $('.project-sec').eq(2).find('span').addClass('specify');
        }else if(this.props.projectType==5){
            /*$('.project-sec').eq(3).find('span').addClass('specify');*/
            $('.project-sec').eq(3).find('span').addClass('specify');
        }
        $('.project-sec').click(function(){
            $(this).find('span').addClass('specify');
            $(this).siblings().find('span').removeClass('specify');
        })
        //获取专题列表数据
        let catalogId=!!this.props.catalogId ? this.props.catalogId : '',
            excludeIds=window.noticeDecorateQuestionIds,//所选中题目id
            tagType=this.props.projectType,
            pageNumber=0,//第一页
            pageSize=20;//一页数据数
            if(tagType==5){
                //调取推荐试题列表数据
                console.log('pageSize',pageSize)
                this.decorate.getRecommendList(loginToken,catalogId,excludeIds,pageNumber,pageSize) 
            }else{
               //调取专题列表数据
                this.decorate.getProjectList(loginToken,catalogId,tagType,pageNumber,pageSize) 
            }
    }
   
    render() {
        console.log('接收全选-专题列表',this.props.specialInfoList)
        return (
            <div className='project-list'>
                <h1 className='header-nav'>
                    <Breadcrumb separator=">">
                      <Breadcrumb.Item onClick={this.returnInfo.bind(this)} style={{cursor:'pointer'}}>返回</Breadcrumb.Item>
                    </Breadcrumb>
                  </h1>
                <div className="project-sec-cont clear-fix">
                   {
                         this.props.specialInfoList.map((item,index)=>{
                            let classTem='';
                            if(item.value==1){
                                classTem='project-sec topic-sec-one'
                            }else if(item.value==2){
                                classTem='project-sec topic-sec-two'
                            }else if(item.value==3){
                                classTem='project-sec topic-sec-three'
                            }else if(item.value==4){
                                classTem='project-sec topic-sec-four'
                            }
                            return <div className={classTem} value={item.value} key={item.value} onClick={this.filterProject.bind(this)}>
                                        {item.title}
                                        <span className=''></span>
                                    </div>
                        })
                    }
                    <div className='project-sec topic-sec-five' value='5' key='5' onClick={this.filterProject.bind(this)}>
                        推荐试题
                        <span className=''></span>
                    </div>
                    <div className='allsel-change-box'>
                        <Checkbox className='allSelected'  checked={this.state.checkAll} onChange={this.allSelected.bind(this)}>全选</Checkbox>
                        {
                            this.props.projectType==5&&<a href="javascript:;" className='change-group' onClick={this.changeGroup.bind(this)}>换一组</a>
                        }
                    </div>
                   
                </div>
                <div id="decorate-list" className="clear-fix">
                    <DecorateList 
                        ref={(decorate)=>{this.decorate=decorate}}
                        flag={this.state.flag} 
                        checkAll={this.state.checkAll} 
                        parentType={this.state.parentType} 
                        viewSel={this.viewSel.bind(this)}
                        noticeDecorateQuestionIds={window.noticeDecorateQuestionIds}
                        noticeCheckall={this.noticeCheckall.bind(this)} 
                        />
                </div>
            </div>
        )
    }
    //筛选专题
    filterProject(e){
        //获取专题列表数据
        let catalogId=!!this.props.catalogId ? this.props.catalogId : '',
            excludeIds=window.noticeDecorateQuestionIds,//所选中题目id
            tagType=e.target.getAttribute('value'),
            pageNumber=0,//第一页
            pageSize=20;//一页数据数
            if(tagType==5){
                //调取推荐试题列表数据
                this.decorate.getRecommendList(loginToken,catalogId,excludeIds,pageNumber,pageSize) 
            }else{
               //调取专题列表数据
                this.decorate.getProjectList(loginToken,catalogId,tagType,pageNumber,pageSize) 
            }

    }
    //换一组
    changeGroup(){
        let catalogId=!!this.props.catalogId ? this.props.catalogId : '',
            excludeIds=window.noticeDecorateQuestionIds,//所选中题目id
            pageNumber=0,//第一页
            pageSize=20;//一页数据数
            this.decorate.getRecommendList(loginToken,catalogId,excludeIds,pageNumber,pageSize)
    }
    //全选
    allSelected(e){
        if(e.target.checked===true){
            console.log('全选',this.decorate.getChildQuestions())
            let questionIds=this.decorate.getChildQuestions();
                this.props.viewSel.bind(this,true,questionIds)();
        }else if(e.target.checked===false){
            let questionIds=this.decorate.getChildQuestions();
                this.props.viewSel.bind(this,false,questionIds)();
        }
        this.setState({
            checkAll:e.target.checked
        })
    }
    noticeCheckall(data){
        console.log('接收全选',data,typeof(data))
          this.setState({
            checkAll:data
        })
    }
    //返回
    returnInfo(){
        this.props.returnInfo.bind(this,true)()
    }
    //勾选通知方法
    viewSel(isShow,questionId){
        this.props.viewSel.bind(this,isShow,questionId)();
    }
}

export default ProjectList