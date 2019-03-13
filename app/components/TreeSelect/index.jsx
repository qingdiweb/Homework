import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import { Tree, Input ,TreeSelect} from 'antd';
import './style.less'
class TreeSelectList extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
        this.state = {
            value: undefined,
            defaultCatalog:'',
            defaultCatalogExpanded:[],
            timeStamp:(new Date()).getTime()
          }
    }
    componentWillReceiveProps(nextProps){
        if(this.props.flag!=nextProps.flag){
            this.setState({
           /*     defaultCatalog:nextProps.defaultCatalogName,*/
                defaultCatalogExpanded:nextProps.defaultCatalog=='' ? [] : nextProps.defaultCatalog.split(','),
                defaultCatalog:nextProps.defaultCatalog=='' ? '' : nextProps.defaultCatalog.split(',').pop().toString(),
                value:undefined,
                timeStamp:(new Date()).getTime()*Math.random()
            })
        }
        
    }
    onChange(value){
        this.setState({value})
        this.props.noticeParent.bind(this,value)()
      }
    render() {
        console.log('defaultCatalogName',this.state.defaultCatalogExpanded)
            return (
                <TreeSelect
                style={{width:'100%',height:'100%'}}
                key={this.state.timeStamp}
                defaultValue={this.state.defaultCatalog}
                value={this.state.value}
                treeData={this.dealrenderTreeNodes(this.props.treeData,'catalogInfoList')}
                placeholder={this.props.placeholderName}
                treeDefaultExpandedKeys={this.state.defaultCatalogExpanded}
                onChange={this.onChange.bind(this)}
          />
          )
    }
    //处理树结构
    dealrenderTreeNodes(datavalue,childvalue){
        datavalue.map((item) => {
            item.key=item.id;
            item.value=item.id.toString();
            item.title=item.name;
            if (item[childvalue]) {
                item.children=item[childvalue];
                this.dealrenderTreeNodes(item[childvalue],childvalue)
            }else{
                item.children=[];
            }
        });
        return datavalue
    }
}
export default TreeSelectList