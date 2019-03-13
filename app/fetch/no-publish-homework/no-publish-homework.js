import { get } from '../get'
import { post } from '../post'

//请求未发布作业列表数据
export function getDraftListData(loginToken,pageNumber,pageSize,createdAtStart,createdAtEnd) {
    const result = post('/account/teacher/draft/list',{
    	loginToken:loginToken,
    	pageNumber:pageNumber,
        pageSize:pageSize,
        createdAtStart:createdAtStart,
        createdAtEnd:createdAtEnd
    })
    return result
}
//删除指定草稿
export function delDraftListData(loginToken,draftId) {
    const result = post('/account/teacher/draft/delete',{
        loginToken:loginToken,
        draftId:draftId
    })
    return result
}