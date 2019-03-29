/**
 * 个人中心
 */
import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Link, hashHistory } from 'react-router'
import { Menu, Icon , Button , Input , Select , Upload , Dropdown, Modal , Radio , message , Tabs , Form  , Row, Col, Checkbox } from 'antd';
import {getStageSubject , getProvince , getCity , getArea , getSchool , updateTeacherInfo , getCode , bindPhone , updatePassword} from '../../fetch/personal-center/personal-center'
import { getTeacherInfo } from '../../fetch/home/home'
import * as Constants from '../../constants/store'

import * as userInfoActionsFromOtherFile from '../../actions/userinfo'
import './style.less'

const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const loginToken=localStorage.getItem("loginToken");
class PersonalCenter extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
        this.state={
            teacherInfo:{},//教师信息
            tabKey:1,//只有切换到相应的tab下才会显示其下面的内容
            sexValue:1,
            previewImage: '',
            fileList: [],
            uploadData:{
                loginToken:loginToken
            },
            stageData:[],//学段数据
            subjectData:[],//学科数据
            provinceData:[],//省份
            cityData:[],//市
            areaData:[],//区域
            schoolData:[],//学校
            filedata:{
                nameValue:'',
                sexValue:'',
                stageId:'',
                stage:'',
                subjectId:'',
                subject:'',
                provinceId:'',
                province:'',
                cityId:'',
                city:'',
                areaId:'',
                area:'',
                schoolId:'',
                school:''
            },
            accountdata:{
                phoneVal:'',
                codeVal:''
            },
            resend:true,
            codeDisabled:true,//没输入手机号之前不能点
            countdownTime:60,//发送验证码倒计时
            passwordData:{
                oldPasswordVal:'',
                passwordVal:''
            },
            flag:true,
            isReadOnly:true
        }
    }
    componentWillMount(){
        this.getTeacherInfo.bind(this)().then((teacherInfo)=>{
            //获取市
            this.getCity.bind(this,teacherInfo.provinceId)();
            //获取区
            this.getArea.bind(this,teacherInfo.cityId)();
            this.getStageSubject.bind(this,teacherInfo.stageId)();
            //获取学校
            let type='';
                if(teacherInfo.stage=='小学'){
                  type=1;
                }else if(teacherInfo.stage=='初中'){
                  type=2;
                }else if(teacherInfo.stage=='高中'){
                  type=2;
                }
                this.getSchool.bind(this,teacherInfo.areaId,type)();
            this.setState({
                teacherInfo:teacherInfo,
                previewImage:teacherInfo.avatarUrl,
                object:this.state.filedata.nameValue=teacherInfo.nickname,
                object:this.state.filedata.sexValue=teacherInfo.gender,
                object:this.state.filedata.stageId=teacherInfo.stageId,
                object:this.state.filedata.stage=teacherInfo.stage,
                object:this.state.filedata.subjectId=teacherInfo.subjectId,
                object:this.state.filedata.subject=teacherInfo.subject,
                object:this.state.filedata.provinceId=teacherInfo.provinceId,
                object:this.state.filedata.province=teacherInfo.province,
                object:this.state.filedata.cityId=teacherInfo.cityId,
                object:this.state.filedata.city=teacherInfo.city,
                object:this.state.filedata.areaId=teacherInfo.areaId,
                object:this.state.filedata.area=teacherInfo.area,
                object:this.state.filedata.schoolId=teacherInfo.schoolId,
                object:this.state.filedata.school=teacherInfo.school,
            })
        }).catch((ex)=>{
            console.log("暂无数据 "+ex.message)
        })
        //获取省份
        const resultGetProvince=getProvince(loginToken);
              resultGetProvince.then(res =>{
                    return res.json()
              }).then(json=>{
                const data = json
                    if(data.result){
                        let provinceData=data.data;
                            this.setState({
                                provinceData:provinceData
                            })
                    }
              }).catch(ex => {
                    // 发生错误
                    if (__DEV__) {
                        console.error('暂无数据, ', ex.message)
                    }
              })


    }
    componentDidMount(){

    }
    getStageSubject(stageId){
        //获取学段数据
        const resultGetStageSubject=getStageSubject();
        resultGetStageSubject.then(res =>{
            return res.json()
        }).then(json=>{
            const data = json
            if(data.result){
                let stageData=data.data.stageInfoList;
                this.setState({
                    stageData:stageData
                })
                console.log('this.state.stageData',stageData,stageId);
                for (var i = 0; i < stageData.length; i++) {
                    if(stageData[i].id== stageId){
                        this.setState({
                            subjectData:stageData[i].subjectInfoList
                        })
                    }
                }
            }
        }).catch(ex => {
            // 发生错误
            if (__DEV__) {
                console.error('暂无数据, ', ex.message)
            }
        })
    }
    getTeacherInfo(){
       return new Promise((resolve,reject) =>{
          const resultGetTeacherInfo=getTeacherInfo(loginToken);
                resultGetTeacherInfo.then(res=>{
                    return res.json()
                }).then(json=>{
                    const data=json
                         if(data.result){
                            let teacherInfo=data.data;
                                resolve(data.data);
                         }
                }).catch(ex => {
                        // 发生错误
                        if (__DEV__) {
                          reject(data.error)
                            console.error('暂无数据, ', ex.message)
                        }
                })
          })
    }
    render() {
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
          labelCol: { span: 4 },
          wrapperCol: { span: 18 },
        };
        const tailFormItemLayout = {
          wrapperCol: {
            xs: {
              span: 24,
              offset: 0,
            },
            sm: {
              span: 16,
              offset: 4,
            },
          },
        };
        return (
            <div className="personal-center-cont">
                <div className="bread-crumbs"><Link to="/homework-home">首页</Link>>个人中心</div>
                <div className="personal-cont">
                    <div className="head-portrait-bg">
                        <div className="head-portrait-bg-top">
                            <div className="head-portrait">
                                <img src={this.state.teacherInfo.avatarUrl} alt=""/>
                                <h1 className="name">{this.state.teacherInfo.nickname}<span className={this.state.teacherInfo.gender==0 ? 'circle-boy-icon' : 'circle-girl-icon'}></span></h1>
                                <p className="sub-school">
                                  <span>{this.state.teacherInfo.stage}{this.state.teacherInfo.subject}</span>
                                  {
                                    this.state.teacherInfo.stage&&this.state.teacherInfo.subject&&this.state.teacherInfo.school ? <span className="line">|</span> : ''
                                  }
                                  <span>{this.state.teacherInfo.school}</span>
                                </p>
                            </div>
                        </div>
                        <div className="head-portrait-bg-bottom">
                            <Tabs defaultActiveKey="1" onChange={this.callback.bind(this)}>
                                <TabPane tab="个人资料" key="1">
                                {
                                  this.state.tabKey==1 ? this.state.isReadOnly ? <div style={{width:"100%",background:'rgba(245, 248, 250, 1)',padding:'20px 0px 32px 0px '}}>
                                        <div className="personal-data editing-area">
                                            <Form>
                                                <FormItem
                                                  {...formItemLayout}
                                                  label="头像:"
                                                  colon={false}
                                                >
                                                  {getFieldDecorator('head-portrait', {
                                                    initialValue: this.state.previewImage|| '',
                                                    rules: [
                                                      { message: '头像不能为空'},
                                                    ],
                                                  })(
                                                    <div style={{display:'inline-block'}}>
                                                        <img src={this.state.previewImage} alt="" className="head-portrait"/>
                                                    </div>
                                                  )}
                                                </FormItem>
                                                <FormItem
                                                  {...formItemLayout}
                                                  label="姓名:"
                                                  colon={false}
                                                >
                                                  {getFieldDecorator('name', {
                                                    initialValue: this.state.teacherInfo.nickname||'',
                                                    rules: [
                                                      { message: '姓名不能为空' },
                                                    ],
                                                  })(
                                                    <span className="readonly-public-width">{this.state.teacherInfo.nickname||''}</span>
                                                  )}
                                                </FormItem>
                                                <FormItem
                                                  {...formItemLayout}
                                                  label="性别:"
                                                  colon={false}
                                                >
                                                  {getFieldDecorator('sex', {
                                                    initialValue: this.state.teacherInfo.gender,
                                                    rules: [
                                                      { message: '性别不能为空' },
                                                    ],
                                                  })(
                                                    <span className="readonly-public-width">
                                                      <span style={{float:'left'}}>{this.state.teacherInfo.gender==1 ? '女' : '男'}</span>
                                                      <span className={this.state.teacherInfo.gender==0 ? 'circle-boy-icon' : 'circle-girl-icon'} style={{float:'left',marginTop:'14px'}}></span>
                                                    </span>
                                                  )}
                                                </FormItem>
                                                <FormItem
                                                  {...formItemLayout}
                                                  label="任教阶段:"
                                                  colon={false}
                                                >
                                                  {getFieldDecorator('stage', {
                                                    initialValue: this.state.teacherInfo.stage||'',
                                                    rules: [
                                                      { message: '阶段不能为空' },
                                                    ],
                                                  })(
                                                    <span className="readonly-public-width">{this.state.teacherInfo.stage||''}</span>
                                                  )}
                                                </FormItem>
                                                <FormItem
                                                  {...formItemLayout}
                                                  label="任教科目:"
                                                  colon={false}
                                                >
                                                  {getFieldDecorator('subject', {
                                                    initialValue: this.state.teacherInfo.subject||'',
                                                    rules: [
                                                      { message: '科目不能为空' },
                                                    ],
                                                  })(
                                                    <span className="readonly-public-width">{this.state.teacherInfo.subject||''}</span>
                                                  )}
                                                </FormItem>
                                                <FormItem
                                                  {...formItemLayout}
                                                  label="任教学校:"
                                                  colon={false}
                                                >
                                                    <Row gutter={8}>
                                                        <Col span={3}>
                                                          {getFieldDecorator('province', {
                                                            initialValue: this.state.teacherInfo.province||'',
                                                            rules: [{ message: '省份不能为空!'}],
                                                          })(
                                                            <span className="readonly-public-width">{this.state.teacherInfo.province||''}</span>
                                                          )}
                                                        </Col>
                                                        <Col span={3}>
                                                          {getFieldDecorator('city', {
                                                            initialValue: this.state.teacherInfo.city||'',
                                                            rules: [{ message: '市份不能为空!'}],
                                                          })(
                                                            <span className="readonly-public-width">{this.state.teacherInfo.city||''}</span>
                                                          )}
                                                        </Col>
                                                        <Col span={3}>
                                                          {getFieldDecorator('area', {
                                                            initialValue: this.state.teacherInfo.area||'',
                                                            rules: [{message: '地区不能为空!'}],
                                                          })(
                                                            <span className="readonly-public-width">{this.state.teacherInfo.area||''}</span>
                                                          )}
                                                        </Col>
                                                        <Col span={12}>
                                                          {getFieldDecorator('school', {
                                                            initialValue: this.state.teacherInfo.school||'',
                                                            rules: [{ message: '学校不能为空!'}],
                                                          })(
                                                            <span className="readonly-public-width">{this.state.teacherInfo.school||''}</span>
                                                          )}
                                                        </Col>
                                                    </Row>
                                                </FormItem>
                                                <FormItem
                                                  {...tailFormItemLayout}
                                                  style={{textAlign:'center'}}
                                                >
                                                    <Button type="primary" htmlType="submit" className="personal-data-button" onClick={this.personalDataEdit.bind(this)}>
                                                    修改
                                                  </Button>
                                                </FormItem>
                                            </Form>
                                        </div>
                                    </div> : <div style={{width:"100%",background:'rgba(245, 248, 250, 1)',padding:'20px 0px 32px 0px '}}>
                                        <div className="personal-data editing-area">
                                            <Form >
                                                <FormItem
                                                  {...formItemLayout}
                                                  label="头像"
                                                  colon={false}
                                                >
                                                  {getFieldDecorator('head-portrait', {
                                                    initialValue: this.state.previewImage|| '',
                                                    rules: [
                                                      { required: true, message: '头像不能为空' },
                                                    ],
                                                  })(
                                                    <div style={{display:'inline-block'}}>
                                                        <img src={this.state.previewImage} alt="" className="head-portrait"/>
                                                        <Upload
                                                              action={Constants.baseUrl+"/account/teacher/file/upload/avatar"}
                                                              data={this.state.uploadData}
                                                              name={'upload'}
                                                              showUploadList={false}
                                                              onChange={this.handleChange.bind(this)}
                                                            >
                                                            <span className="upload-btn">上传新头像</span>
                                                         </Upload>
                                                    </div>
                                                  )}
                                                </FormItem>
                                                <FormItem
                                                  {...formItemLayout}
                                                  label="姓名"
                                                  colon={false}
                                                  hasFeedback
                                                >
                                                  {getFieldDecorator('name', {
                                                    initialValue: this.state.teacherInfo.nickname||'',
                                                    rules: [
                                                      { required: true, message: '姓名不能为空' },
                                                        {validator:this.accountSetNameValidation.bind(this)}
                                                    ],
                                                  })(
                                                    <Input placeholder="请输入姓名" className="public-width"   maxLength={10} onChange={this.nameInput.bind(this)}/>
                                                  )}
                                                </FormItem>
                                                <FormItem
                                                  {...formItemLayout}
                                                  label="性别"
                                                  colon={false}
                                                >
                                                  {getFieldDecorator('sex', {
                                                    initialValue: this.state.teacherInfo.gender,
                                                    rules: [
                                                      { required: true, message: '性别不能为空' },
                                                    ],
                                                  })(
                                                    <RadioGroup onChange={this.sexChange.bind(this)} value={this.state.teacherInfo.gender}>
                                                        <Radio value={0}>男<span className='circle-boy-icon' style={{marginTop:'-2px'}}></span></Radio>
                                                        <Radio value={1}>女<span className='circle-girl-icon' style={{marginTop:'-2px'}}></span></Radio>
                                                    </RadioGroup>
                                                  )}
                                                </FormItem>
                                                <FormItem
                                                  {...formItemLayout}
                                                  label="任教阶段"
                                                  colon={false}
                                                >
                                                  {getFieldDecorator('stage', {
                                                    initialValue: this.state.teacherInfo.stage||'',
                                                    rules: [
                                                      { required: true, message: '阶段不能为空' },
                                                    ],
                                                  })(
                                                    <Select placeholder="请选择阶段" className="public-width" onChange={this.stageSelect.bind(this)}>
                                                    {
                                                        this.state.stageData.length>0 ? this.state.stageData.map((item,index)=>{
                                                            return <Option value={item.id} key={item.id}>{item.title}</Option>
                                                        }) : ''
                                                    }
                                                    </Select>
                                                  )}
                                                </FormItem>
                                                <FormItem
                                                  {...formItemLayout}
                                                  label="任教科目"
                                                  colon={false}
                                                >
                                                  {getFieldDecorator('subject', {
                                                    initialValue: this.state.teacherInfo.subject||'',
                                                    rules: [
                                                      { required: true, message: '科目不能为空' },
                                                    ],
                                                  })(
                                                    <Select placeholder="请选择科目" className="public-width" onChange={this.subjectSelect.bind(this)}>
                                                    {
                                                        this.state.subjectData.length>0 ? this.state.subjectData.map((item,index)=>{
                                                            return <Option value={item.id} key={item.id}>{item.title}</Option>
                                                        }) : ''
                                                    }
                                                    </Select>
                                                  )}
                                                </FormItem>
                                                <FormItem
                                                  {...formItemLayout}
                                                  label="任教学校"
                                                  colon={false}
                                                >
                                                    <Row gutter={8}>
                                                        <Col span={7}>
                                                          {getFieldDecorator('province', {
                                                            initialValue: this.state.teacherInfo.province||'',
                                                            rules: [{ required: true, message: '省份不能为空!'}],
                                                          })(
                                                            <Select placeholder="请选择省份" style={{width:'180px',height:'36px',marginRight:'16px'}} onChange={this.provinceSelect.bind(this)}>
                                                            {
                                                                this.state.provinceData.length>0 ? this.state.provinceData.map((item,index)=>{
                                                                    return <Option value={item.provinceId} key={item.provinceId}>{item.province}</Option>
                                                                }) : ''
                                                            }
                                                            </Select>
                                                          )}
                                                        </Col>
                                                        <Col span={7}>
                                                          {getFieldDecorator('city', {
                                                            initialValue: this.state.teacherInfo.city||'',
                                                            rules: [{ required: true, message: '市份不能为空!'}],
                                                          })(
                                                            <Select placeholder="请选择市" style={{width:'180px',height:'36px',marginRight:'16px'}} onChange={this.citySelect.bind(this)}>
                                                            {
                                                                this.state.cityData.length>0 ? this.state.cityData.map((item,index)=>{
                                                                    return <Option value={item.cityId} key={item.cityId}>{item.city}</Option>
                                                                }) : ''
                                                            }
                                                            </Select>
                                                          )}
                                                        </Col>
                                                        <Col span={7}>
                                                          {getFieldDecorator('area', {
                                                            initialValue: this.state.teacherInfo.area||'',
                                                            rules: [{ required: true, message: '地区不能为空!'}],
                                                          })(
                                                            <Select placeholder="请选择区/县" style={{width:'180px',height:'36px',marginRight:'16px'}} onChange={this.areaSelect.bind(this)}>
                                                            {
                                                                this.state.areaData.length>0 ? this.state.areaData.map((item,index)=>{
                                                                    return <Option value={item.areaId} key={item.areaId}>{item.area}</Option>
                                                                }) : ''
                                                            }
                                                            </Select>
                                                          )}
                                                        </Col>
                                                        <Col span={12}>
                                                          {getFieldDecorator('school', {
                                                            initialValue: this.state.teacherInfo.school||'',
                                                            rules: [{ required: true, message: '学校不能为空!'}],
                                                          })(
                                                            <Select placeholder="请选择学校"  className="public-width" onChange={this.schoolSelect.bind(this)}>
                                                            {
                                                                this.state.schoolData.length>0 ? this.state.schoolData.map((item,index)=>{
                                                                    return <Option value={item.schoolId} key={item.schoolId}>{item.school}</Option>
                                                                }) : ''
                                                            }
                                                            </Select>
                                                          )}
                                                        </Col>
                                                    </Row>
                                                </FormItem>
                                                <FormItem
                                                  {...tailFormItemLayout}
                                                  style={{textAlign:'center'}}
                                                >
                                                  <Button type="primary" htmlType="submit" className="personal-data-button" onClick={this.personalDataHandleSubmit.bind(this)}>
                                                    保存
                                                  </Button>
                                                </FormItem>
                                            </Form>
                                        </div>
                                    </div> : ''
                                }

                                </TabPane>
                                <TabPane tab="账号设置" key="2">
                                {
                                  this.state.tabKey==2 ? <div style={{width:"100%",background:'rgba(245, 248, 250, 1)',padding:'20px 0px 32px 0px '}}>
                                        <div className="account-setting editing-area">
                                          <Form>
                                                <FormItem
                                                  {...formItemLayout}
                                                  label="新手机号"
                                                  colon={false}
                                                >
                                                  {getFieldDecorator('accountSetnewPhone', {
                                                    rules: [{ required: true, message: '手机号不能为空!'},{validator:this.accountSetnewPhoneValidation.bind(this)}],
                                                  })(
                                                    <Input placeholder="请输入手机号" className="public-width"/>
                                                  )}
                                                </FormItem>
                                                <FormItem
                                                  {...formItemLayout}
                                                  label="短信验证码"
                                                  colon={false}
                                                >
                                                <Row gutter={8}>
                                                    <Col span={5}>
                                                      {getFieldDecorator('accountCode', {
                                                        rules: [{ required: true, message: '验证码不能为空!'},
                                                        {validator:this.accountCodeValidation.bind(this)}],
                                                        validateTrigger: 'onBlur'
                                                      })(
                                                        <Input placeholder="请输入验证码" />
                                                      )}
                                                    </Col>
                                                    {
                                                      this.state.resend ? <Col span={12}><Button type="primary" disabled={this.state.codeDisabled} onClick={this.accountSetgetCode.bind(this)}>获取验证码</Button></Col> :  <Col span={12}><Button type="primary" disabled><span>{this.state.countdownTime}s</span>重新发送</Button></Col>
                                                    }
                                                  </Row>
                                                </FormItem>
                                                <FormItem
                                                  {...tailFormItemLayout}

                                                >
                                                  <Button type="primary" htmlType="submit" className="account-data-button" onClick={this.accountSettingHandleSubmit.bind(this)}>
                                                    保存
                                                  </Button>
                                                </FormItem>
                                          </Form>
                                        </div>
                                    </div> : ''
                                }

                                </TabPane>
                                <TabPane tab="密码设置" key="3">
                                {
                                  this.state.tabKey==3 ? <div style={{width:"100%",background:'rgba(245, 248, 250, 1)',padding:'20px 0px 32px 0px '}}>
                                                            <div className="password-setting editing-area">
                                                                  <Form>
                                                                          <FormItem {...formItemLayout} label="原密码">
                                                                            {getFieldDecorator('oldPassword', {
                                                                                initialValue:'',
                                                                                rules: [{ required: true, message: '密码不能为空!' },
                                                                                {validator:this.oldPasswordValidation.bind(this)}],
                                                                                validateTrigger: 'onBlur'
                                                                              })(
                                                                                <Input type="password" placeholder="请输入密码"  className="public-width"/>
                                                                              )}
                                                                          </FormItem>
                                                                          <FormItem {...formItemLayout} label="新密码">
                                                                            {getFieldDecorator('newPassword', {
                                                                                initialValue:'',
                                                                                rules: [{ required: true, message: '密码不能为空!' },
                                                                                {validator:this.passwordValidation.bind(this)}],
                                                                                validateTrigger: 'onBlur'
                                                                              })(
                                                                                <Input type="password" placeholder="请输入密码"  className="public-width"/>
                                                                              )}
                                                                          </FormItem>
                                                                          <FormItem {...formItemLayout} label="确认密码">
                                                                            {getFieldDecorator('sureNewPassword', {
                                                                              initialValue:'',
                                                                              rules: [{ required: true, message: '密码不能为空!' },
                                                                              {validator:this.surePasswordValidation.bind(this)}],
                                                                              validateTrigger: 'onBlur'
                                                                            })(
                                                                              <Input type="password" placeholder="请输入密码" className="public-width"/>
                                                                            )}
                                                                          </FormItem>
                                                                          <FormItem
                                                                            {...tailFormItemLayout}
                                                                          >
                                                                            <Button type="primary" htmlType="submit" className="account-data-button" onClick={this.passwordSettingHandleSubmit.bind(this)}>
                                                                              保存
                                                                            </Button>
                                                                          </FormItem>
                                                                  </Form>
                                                              </div>
                                                            </div>: ''
                                }
                                </TabPane>
                            </Tabs>
                        </div>

                    </div>
                </div>
            </div>
        )
    }
    callback(key){
      console.log(key)
      this.setState({
        tabKey:key
      })
    }
    //上传头像
    handleChange(info){
        console.log('头像',info)
        if (info.file.status !== 'uploading') {
          console.log(info.file, info.fileList);
        }
        if (info.file.response.result) {
          message.success('上传成功');
          this.setState({
            previewImage:info.file.response.data.url
          })
        } else{
          message.error('上传失败');
        }
    }
    //个人资料修改
    personalDataEdit(){
      this.setState({
        isReadOnly:false
      })
    }
    //个人资料
    personalDataHandleSubmit(){
        //更新教师信息
        let form1=this.props.form;
        form1.validateFields((err, values,callback) => {
          if (!err) {
            let avatarUrl=this.state.previewImage,
                nickname=this.state.filedata.nameValue,
                gender=this.state.filedata.sexValue,
                stageId=this.state.filedata.stageId,
                stage=this.state.filedata.stage,
                subjectId=this.state.filedata.subjectId,
                subject=this.state.filedata.subject,
                provinceId=this.state.filedata.provinceId,
                province=this.state.filedata.province,
                cityId=this.state.filedata.cityId,
                city=this.state.filedata.city,
                areaId=this.state.filedata.areaId,
                area=this.state.filedata.area,
                schoolId=this.state.filedata.schoolId,
                school=this.state.filedata.school;
                console.log(loginToken,avatarUrl,nickname,gender,stageId,stage,subjectId,subject,provinceId,province,cityId,city,areaId,area,schoolId,school)
                const resultUpdateTeacherInfo=updateTeacherInfo(loginToken,avatarUrl,nickname,gender,stageId,stage,subjectId,subject,provinceId,province,cityId,city,areaId,area,schoolId,school);
                      resultUpdateTeacherInfo.then(res =>{
                            return res.json()
                      }).then(json=>{
                        const data = json
                            if(data.result){
                                //保存成功提示
                                message.success('保存成功');
                                this.setState({
                                  teacherInfo:data.data,
                                    isReadOnly:true
                                })
                                //更新保存老师个人资料
                                localStorage.setItem("teacherInfo",JSON.stringify(data.data))
                                localStorage.setItem("teacherInfoFill",false)
                                // window.location.reload();
                                //个人中心保存-通知刷新
                                this.props.noticeRefresh.bind(this)()
                            }else{
                                //保存失败提示
                                message.warning('保存失败');
                            }
                      }).catch(ex => {
                            // 发生错误
                            if (__DEV__) {
                                console.error('暂无数据, ', ex.message)
                            }
                      })
          }else{
            message.warning('请补全信息');
          }
      })

    }
    //输入姓名
    nameInput(e){
        console.log(e.target.value)
        this.setState({
            object:this.state.filedata.nameValue=e.target.value
        })
    }
    //性别选择
    sexChange(e){
        console.log(e.target.value)
        this.setState({
            object:this.state.filedata.sexValue=e.target.value
        })
    }
    //学段选择
    stageSelect(e){
        console.log(e)
        let stageData=this.state.stageData;
        for (var i = 0; i < stageData.length; i++) {
            if(stageData[i].id==e){
                this.setState({
                    object:this.state.filedata.stageId=e,
                    object:this.state.filedata.stage=stageData[i].title,
                    subjectData:stageData[i].subjectInfoList
                })
            }
        }
    }
    //学科选择
    subjectSelect(e){
        console.log(e)
        let subjectData=this.state.subjectData;
        for (var i = 0; i < subjectData.length; i++) {
            if (subjectData[i].id==e) {
                this.setState({
                    object:this.state.filedata.subjectId=e,
                    object:this.state.filedata.subject=subjectData[i].title
                })
            }
        }
    }
    //获取市
    getCity(provinceId){
      const resultGetCity=getCity(loginToken,provinceId);
              resultGetCity.then(res =>{
                    return res.json()
              }).then(json=>{
                const data = json
                    if(data.result){
                        let cityData=data.data,
                            provinceData=this.state.provinceData;
                            this.setState({
                                cityData:cityData,
                                flag:!this.state.flag
                            })
                            for (var i = 0; i < provinceData.length; i++) {
                                if (provinceData[i].provinceId==provinceId) {
                                    this.setState({
                                        object:this.state.filedata.provinceId=provinceId,
                                        object:this.state.filedata.province=provinceData[i].province,
                                    })
                                }
                            }

                    }
              }).catch(ex => {
                    // 发生错误
                    if (__DEV__) {
                        console.error('暂无数据, ', ex.message)
                    }
              })
    }
    //获取区
    getArea(cityId){
        const resultGetArea=getArea(loginToken,cityId);
              resultGetArea.then(res =>{
                    return res.json()
              }).then(json=>{
                const data = json
                    if(data.result){
                        let areaData=data.data,
                            cityData=this.state.cityData;
                            this.setState({
                                areaData:areaData,
                                flag:!this.state.flag
                            })
                            for (var i = 0; i < cityData.length; i++) {
                                if (cityData[i].cityId==cityId) {
                                    this.setState({
                                        object:this.state.filedata.cityId=cityId,
                                        object:this.state.filedata.city=cityData[i].city
                                    })
                                }
                            }
                    }
              }).catch(ex => {
                    // 发生错误
                    if (__DEV__) {
                        console.error('暂无数据, ', ex.message)
                    }
              })
    }
    //获取学校
    getSchool(areaId,type){
        const resultGetSchool=getSchool(loginToken,areaId,type);
              resultGetSchool.then(res =>{
                    return res.json()
              }).then(json=>{
                const data = json
                    if(data.result){
                        let schoolData=data.data,
                            areaData=this.state.areaData;
                            this.setState({
                                schoolData:schoolData,
                                flag:!this.state.flag
                            })
                            for (var i = 0; i < areaData.length; i++) {
                                if (areaData[i].areaId==e) {
                                    this.setState({
                                        object:this.state.filedata.areaId=e,
                                        object:this.state.filedata.area=areaData[i].area,
                                    })
                                }
                            }
                    }
              }).catch(ex => {
                    // 发生错误
                    if (__DEV__) {
                        console.error('暂无数据, ', ex.message)
                    }
              })
    }
    //省份选择
    provinceSelect(e){
        let provinceId=e;
        console.log(this.props.form)
        this.getCity.bind(this,provinceId)();
        this.props.form.setFieldsValue({'city':undefined});
        this.props.form.setFieldsValue({'area':undefined});
        this.props.form.setFieldsValue({'school':undefined});

    }
    //市选择
    citySelect(e){
        let cityId=e;
        this.getArea.bind(this,cityId)();
        this.props.form.setFieldsValue({'area':undefined});
        this.props.form.setFieldsValue({'school':undefined});

    }
    //区域选择
    areaSelect(e){
        let areaId=e,
            type='';
        if(this.state.teacherInfo.stage=='小学'){
          type=1;
        }else if(this.state.teacherInfo.stage=='初中'){
          type=2;
        }else if(this.state.teacherInfo.stage=='高中'){
          type=2;
        }
        this.getSchool.bind(this,areaId,type)();
        this.props.form.setFieldsValue({'school':undefined});

    }
    //学校选择
    schoolSelect(e){
        let schoolData=this.state.schoolData;
        for (var i = 0; i < schoolData.length; i++) {
            if (schoolData[i].schoolId==e) {
                this.setState({
                    object:this.state.filedata.schoolId=e,
                    object:this.state.filedata.school=schoolData[i].school
                })
            }
        }
    }
    //账号设置
    accountSettingHandleSubmit(){
        let form2=this.props.form;
        form2.validateFields((err, values,callback) => {
          console.log("提交form表单",err)
          if (!err) {
            let verifyPhone=this.state.accountdata.phoneVal,
                verifyCode=this.state.accountdata.codeVal;
                const resultBindPhone=bindPhone(loginToken,verifyPhone,verifyCode);
                      resultBindPhone.then(res =>{
                            return res.json()
                      }).then(json=>{
                        const data = json
                            if(data.result){
                                //保存成功提示
                                message.success('保存成功');
                                //window.location.href='index.html';
                            }else{
                                //保存失败提示
                                message.warning(data.error);
                            }
                      }).catch(ex => {
                            // 发生错误
                            if (__DEV__) {
                                console.error('暂无数据, ', ex.message)
                            }
                      })
          }
      })
    }
    accountSetNameValidation(rule, value, callback)
    {
        if (!!value && value.length <2)
        {
            callback('请输入2~10个字符')
        }
        else {
            callback()
        }
    }
    //新手机号输入
    accountSetnewPhoneValidation(rule, value, callback){
       console.log('账号'+value)
       const form = this.props.form;
       let re = /^1\d{10}$/;//账号正则验证
       if(!re.test(value)&&value!=''&&typeof(value)!='undefined'){
            this.setState({
              codeDisabled:true
           })
            callback('账号格式不对！')
       }else{
          console.log("账号不存在"+this.state.phoneExit)
          /*if(this.state.phoneExit==true){
            form.validateFields(['accountSetnewPhone'], { force: true });
            callback('手机号不存在！')
          }*/
          this.setState({
            object:this.state.accountdata.phoneVal=value,
            codeDisabled:false
         })
       }
       /* const { getFieldValue } = this.props.form
        if (value && value !== getFieldValue('newPassword')) {
            callback('两次输入不一致！')
        }*/
        // Note: 必须总是返回一个 callback，否则 validateFieldsAndScroll 无法响应
        callback()
    }
    //验证码校验
    accountCodeValidation(rule, value, callback){
        let re = /^\d{0,6}$/;//密码正则验证
          console.log('验证码'+value)
           if(!re.test(value)&&value!=''&&typeof(value)!='undefined'){
                callback('验证码格式不对！')
           }else{
            this.setState({
              object:this.state.accountdata.codeVal=value
            })
           }
           callback()
    }
    //获取验证码
    accountSetgetCode(rule, value, callback){
      let verifyPhone=this.state.accountdata.phoneVal,
          type='teacher';
          const resultGetcode=getCode(loginToken,verifyPhone);
              resultGetcode.then(res=>{
                console.log("第一数据"+res)
                  return res.json()
              }).then(json=>{
                console.log(json)
                  const data=json
                  console.log('数据'+data)
                  if (data.result) {
                       //发送成功之后显示倒计时
                        this.setState({
                          resend:false
                        })
                        let timer=setInterval(()=>{
                          let countdownTime=this.state.countdownTime;
                              if(countdownTime==0){
                                  clearInterval(timer)
                                  this.setState({
                                    resend:true,
                                    countdownTime:60
                                  })
                              }else{
                                countdownTime-=1;
                                this.setState({
                                  countdownTime:countdownTime
                                })
                              }
                        },1000)
                  }else{
                    this.setState({
                      phoneExit:true
                    })
                    message.warning(data.error);
                    // this.accountSetnewPhoneValidation.bind(this)()
                  }
              }).catch(ex=>{
                  // 发生错误
                  if (__DEV__) {
                      console.error('暂无数据, ', ex.message)
                  }
              })
    }
    //修改密码
    passwordSettingHandleSubmit(){
        this.props.form.validateFields((err, values,callback) => {
          console.log('err',err)
          if (!err) {
            let oldpwd=this.state.passwordData.oldPasswordVal,
                password=this.state.passwordData.passwordVal;
                const resultUpdatePassword=updatePassword(loginToken,password,oldpwd);
                      resultUpdatePassword.then(res=>{
                          return res.json()
                      }).then(json=>{
                        console.log(json)
                          const data=json
                          if (data.result) {
                            console.log('保存成功')
                              //保存成功提示
                              message.success('保存成功');
                             //window.location.href='index.html';

                          }else{
                              //保存失败提示
                              message.warning(data.error);
                          }
                      }).catch(ex=>{
                          // 发生错误
                          if (__DEV__) {
                              console.error('暂无数据, ', ex.message)
                          }
                      })
          }
      })
    }
    //原密码
    oldPasswordValidation(rule, value, callback){
        let rs=/^[a-zA-Z]{6,15}$/,
           re = /^\d{6,15}$/,//密码正则验证
           rg=/^[a-zA-Z0-9]{6,15}$/;
         if(rs.test(value)||re.test(value)||rg.test(value)&&value!=''){
            this.setState({
              object:this.state.passwordData.oldPasswordVal=value
            })
         }else{
            callback('请输入6-15位字母或数字！')
         }
         callback();
    }
    //设置密码验证
    passwordValidation(rule, value, callback){
       let rs=/^[a-zA-Z]{6,15}$/,
           re = /^\d{6,15}$/,//密码正则验证
           rg=/^[a-zA-Z0-9]{6,15}$/;
       if(!rs.test(value)&&!re.test(value)&&!rg.test(value)&&value!=''){
            callback('请输入6-15位字母或数字！')
       }else{
          this.setState({
            object:this.state.passwordData.passwordVal=value
          })
       }
      callback();
    }
    //确认密码验证
    surePasswordValidation(rule, value, callback){
        let rs=/^[a-zA-Z]{6,15}$/,
           re = /^\d{6,15}$/,//密码正则验证
           rg=/^[a-zA-Z0-9]{6,15}$/;
           if(!rs.test(value)&&!re.test(value)&&!rg.test(value)&&value!=''){
                callback('请输入6-15位字母或数字！')
           }else{
              console.log(value)
              if (value && value !== this.state.passwordData.passwordVal) {
                callback('密码不一致');
              }
           }
           callback();
    }
}
const PersonalCenterForm = Form.create()(PersonalCenter);
// -------------------redux react 绑定--------------------

function mapStateToProps(state) {
    return {
        userinfo: state.userinfo
    }
}

function mapDispatchToProps(dispatch) {
    return {
        userInfoActions: bindActionCreators(userInfoActionsFromOtherFile, dispatch)
    }
}
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PersonalCenterForm)
