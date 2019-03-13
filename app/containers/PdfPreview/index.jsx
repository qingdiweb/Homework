import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import { Link, hashHistory } from 'react-router'
import { fromJS } from 'immutable';
import { DraggableArea, DraggableAreasGroup} from 'react-draggable-tags';
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { Radio , Checkbox , Select , Icon , Input , Modal , Row , Col , Button,Spin} from 'antd';
import { getTopicListData , getDefaultQuestionList , collectSearchList , addorcancelCollect , addProblem,findQuestion} from '../../fetch/decorate-homework/decorate-homework'
import Pagination from '../../Components/Pagination';
import $ from  'jquery'
//import html2canvas from 'html2canvas'

import './style.less'

const Option = Select.Option;
const loginToken=localStorage.getItem("loginToken");
class DecorateList extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
        this.state={
            topicList:[],//题目列表
            topicListLen:'',//数据条数
            homeworkName:'',//pdf打印作业名称
            flag:false,
            loadingShow:'block',//加载图标
            topicId:'',//题目id
            copyText:'复制链接',
            shareVisible:false
        }

    }
    componentWillMount(){
        let noticeDecorateQuestionIds=localStorage.getItem('noticeDecorateQuestionIds');
            this.getDefaultQuestionList.bind(this,loginToken,noticeDecorateQuestionIds)();
        //获取作业名称
        let teacherInfo=JSON.parse(localStorage.getItem("teacherInfo")),
            stage=teacherInfo.stage,
            subject=teacherInfo.subject,
            now = new Date(),
            month = now.getMonth()+1,//得到月份
            date = now.getDate(),//得到日期
            homeworkName=month+'月'+date+'日'+stage+subject+'作业';
            this.setState({
              homeworkName:homeworkName
            })

    }
    componentDidMount(){
      console.log('html2canvas',html2canvas)
    }
    getDefaultQuestionList(loginToken,questionIds){
        this.setState({
            loadingShow:'block',
            topicList:[],
            topicListLen:0
        })
        const resultFindQuestion = findQuestion(loginToken,questionIds);
                resultFindQuestion.then(res => {
                    return res.json()
                }).then(json => {
                    // 处理获取的数据
                    const data = json
                    if (data.result) {
                        let topicListData=data.data;
                            for (var i = 0; i < topicListData.length; i++) {
                                if(typeof(topicListData[i].options)=='string'&&topicListData[i].options.indexOf('[')>-1){
                                   topicListData[i].options=JSON.parse(topicListData[i].options);
                                }else if(topicListData[i].options==null||topicListData[i].options==''){
                                    topicListData[i].options=[];
                                }
                                topicListData[i].knowledges=topicListData[i].knowledges==null||topicListData[i].knowledges==''  ? [] : topicListData[i].knowledges.split(',');//处理考点
                                topicListData[i].isShow='none';//初始化不显示解析
                                //给题目列表添加序列号
                                topicListData[i].topicIndex=i+1;


                            }
                            this.setState({
                                topicList:topicListData,
                                topicListLen:0,
                                loadingShow:'none',//隐藏图标
                            });
                    }
                }).catch(ex => {
                    // 发生错误
                    if (__DEV__) {
                        console.error('暂无数据, ', ex.message)
                    }
                })
    }
    //打印
    print(){

/*        var targetDom = ;
        //把需要导出的pdf内容clone一份，这样对它进行转换、微调等操作时才不会影响原来界面
        var copyDom = targetDom.clone();
        //新的div宽高跟原来一样，高度设置成自适应，这样才能完整显示节点中的所有内容（比如说表格滚动条中的内容）
        copyDom.width(targetDom.width() + "px");
        copyDom.height(targetDom.height() + "px");

        $('body').append(copyDom);//ps:这里一定要先把copyDom append到body下，然后再进行后续的glyphicons2canvas处理，不然会导致图标为空*/
          html2canvas($('#preview-print'), {
             /* onrendered:function(canvas) {

                  var contentWidth = canvas.width;
                  var contentHeight = canvas.height;

                  //一页pdf显示html页面生成的canvas高度;
                  var pageHeight = contentWidth / 595.28 * 841.89;
                  //未生成pdf的html页面高度
                  var leftHeight = contentHeight;
                  //pdf页面偏移
                  var position = 0;
                  //a4纸的尺寸[595.28,841.89]，html页面生成的canvas在pdf中图片的宽高
                  var imgWidth = 555.28;
                  var imgHeight = 555.28/contentWidth * contentHeight;

                  var pageData = canvas.toDataURL('image/jpeg', 1.0);

                  var pdf = new jsPDF('', 'pt', 'a4');
                  //有两个高度需要区分，一个是html页面的实际高度，和生成pdf的页面高度(841.89)
                  //当内容未超过pdf一页显示的范围，无需分页
                  if (leftHeight < pageHeight) {
                      pdf.addImage(pageData, 'JPEG', 20, 0, imgWidth, imgHeight );
                  } else {
                      while(leftHeight > 0) {
                          pdf.addImage(pageData, 'JPEG', 20, position, imgWidth, imgHeight)
                          leftHeight -= pageHeight;
                          position -= 841.89;
                          //避免添加空白页
                          if(leftHeight > 0) {
                              pdf.addPage();
                          }
                      }
                  }

                  pdf.save('欧拉作业');
              },
              background:"#fff",//这里给生成的图片默认背景，不然的话，如果你的html根节点没设置背景的话，会用黑色填充。
              allowTaint:true //避免一些不识别的图片干扰，默认为false，遇到不识别的图片干扰则会停止处理html2canvas*/
              onrendered: function (canvas) {
                    var imgData = canvas.toDataURL('image/jpeg');
                    var img = new Image();
                    img.src = imgData;
                    //根据图片的尺寸设置pdf的规格，要在图片加载成功时执行，之所以要*0.225是因为比例问题
                    img.onload = function () {
                        //此处需要注意，pdf横置和竖置两个属性，需要根据宽高的比例来调整，不然会出现显示不完全的问题
                        if (this.width > this.height) {
                            var doc = new jsPDF('l', 'mm', [this.width * 0.225, this.height * 0.225]);
                        } else {
                            var doc = new jsPDF('p', 'mm', [this.width * 0.225, this.height * 0.225]);
                        }
                        doc.addImage(imgData, 'jpeg', 0, 0, this.width * 0.225, this.height * 0.225);
                        //根据下载保存成不同的文件名
                        doc.save('欧拉作业');
                        //window.open('file:///C:/Users/Administrator/Downloads/pdf_'+ new Date().getTime() + '.pdf')
                    };
                    //删除复制出来的div
                    //copyDom.remove();
                },
                background: "#fff",
                //这里给生成的图片默认背景，不然的话，如果你的html根节点没设置背景的话，会用黑色填充。
                allowTaint: true //避免一些不识别的图片干扰，默认为false，遇到不识别的图片干扰则会停止处理html2canvas
          })
    }
    share(){
        this.setState({
            shareVisible:true
        })
    }
    shareCancel(){
        this.setState({
            shareVisible:false
        })
    }
    onCopy(){
        this.setState({
            copyText:'复制成功'
        },()=>{
            setTimeout(()=>{
                this.setState({
                    copyText:'复制链接'
                })
            },500)
        })
    }
    render() {
        return (<div id='preview-box' className='preview-box'>
                    <div className='print-share'>
                        <a href="javascript:;" className='print-btn' onClick={this.print.bind(this)}><span className='logo'></span>下载</a>
                        {/*<a href="javascript:;" className='share-btn' onClick={this.share.bind(this)}><span className='logo'></span>分享</a>*/}
                    </div>
                    <div id="preview-print" className="preview-print" style={{width:'900px',margin:'20px auto',backgroundColor: '#fff'}}>
                        <span className='huazi-text'>欧拉教育</span>
                        <span className='homework-name'>{this.state.homeworkName}</span>
                        <Spin size="large" style={{"fontSize":"30px","display":this.state.loadingShow,'margin':'250px auto'}}/>
                        {
                            this.state.topicList.length>0 ? this.state.topicList.map((item,index)=>{
                                                                    let degreeData="",//难度展示
                                                                        degreeTxt=item.degree/20,
                                                                        optionsNub=['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
                                                                        if (0<degreeTxt && degreeTxt<=1)
                                                                        {
                                                                            degreeData ='较容易';
                                                                        }
                                                                        else if (1<degreeTxt && degreeTxt<=2)
                                                                        {
                                                                            degreeData ='容易';
                                                                        }
                                                                        else if (2<degreeTxt && degreeTxt<=3)
                                                                        {
                                                                            degreeData ='中等';
                                                                        }
                                                                        else if (3<degreeTxt && degreeTxt<=4)
                                                                        {
                                                                            degreeData ='较难';
                                                                        }
                                                                        else if (4<degreeTxt && degreeTxt<=5)
                                                                        {
                                                                            degreeData ='难';
                                                                        }
                                                                    return  <div key={index} className={(item.type==3||item.type==4) ? "pdf-topic-sec pdf-jieda-topic-sec" : "pdf-topic-sec"}>
                                                                                <div className="topic-sec-cont" style={{padding:'8px 16px 0px 16px'}}>
                                                                                    <div className="option-cont" style={{position: 'relative',color: 'rgba(51, 51, 51, 1)'}}>
                                                                                        <h1 className='cont-title' style={{fontSize: '14px',color: 'rgba(51, 51, 51, 1)'}}><span style={{fontSize:'14px'}}>{item.topicIndex}、</span><span className="topic-type" style={{margin:'0px 10px 0px 0px',fontSize:'14px',color:'rgba(255, 133, 72, 1)'}}>({item.category})</span><span dangerouslySetInnerHTML={{ __html: item.title }} style={{fontSize:'14px',color:'#333'}}></span></h1>
                                                                                        <div className='option-cont-box'>
                                                                                            {
                                                                                                item.options.length>0 ? item.options.map((ele,i)=>{
                                                                                                    return <p key={i} className='option-cont-box-nub'><span className="option" style={{marginRight:'20px'}}>{optionsNub[i]}</span><span className='option-cont-html' dangerouslySetInnerHTML={{ __html: ele }}></span></p>
                                                                                                }) : ''
                                                                                            }
                                                                                        </div>
                                                                                        {
                                                                                          /*<p>
                                                                                            <span className="degree" style={{display: 'inline-block',marginRight: '20px',padding: '1px 11px',color: 'rgba(255, 255, 255, 1)',fontSize: '12px',backgroundColor: 'rgba(255, 133, 72, 1)',borderRadius:'4px'}}>{degreeData}</span>
                                                                                            {
                                                                                                item.knowledges.length>0 ? item.knowledges.map((ele,i)=>{
                                                                                                    return <span className="exam-site  exam-site-line" key={i} style={{marginRight: '24px',padding: '4px 11px',color: 'rgba(45, 187, 85, 1)',fontSize: '12px',borderRadius: '4px',border: '0.5px solid rgba(219, 219, 219, 1)'}}>{ele}</span>
                                                                                                }) : ''
                                                                                            }
                                                                                          </p>*/
                                                                                        }
                                                                                        
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                    })  : <div style={{'fontSize':'16px','textAlign':'center','margin':'300px auto',"display":this.state.loadingShow=='block' ? 'none' : 'block'}}><Icon type="exclamation-circle" style={{marginRight:'5px',color:'rgba(255, 159, 0, 1)'}}/>暂无数据~</div>
                        }

                    </div>
                    <Modal
                      title="试题分享"
                      className='share-modal'
                      visible={this.state.shareVisible}
                      onCancel={this.shareCancel.bind(this)}
                      okText={'确定'}
                      cancelText={'取消'}
                      footer={[]}
                    >
                     <Input value={window.location.href} style={{width:'368px',height:'36px',marginRight:'12px'}}/>
                     
                     <CopyToClipboard text={window.location.href} onCopy={this.onCopy.bind(this)}>
                         <Button type="primary">{this.state.copyText}</Button>
                     </CopyToClipboard> 
                     <p className='share-prompt'>将链接通过QQ、微信等任何方式发给相关人等,即可查看试题</p>
                    </Modal>
                </div>
        )
    }
 
}

export default DecorateList