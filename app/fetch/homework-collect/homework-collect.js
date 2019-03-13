import { get } from '../get'
import { post } from '../post'

//请求获取收藏试题集列表
export function getCollectList(loginToken,questionId) {
    const result = post('/account/teacher/collect/list',{
    	loginToken:loginToken,
    	questionId:questionId
    })
    return result
}
//添加试题集
export function addCollect(loginToken,name) {
    const result = post('/account/teacher/collect/add',{
        loginToken:loginToken,
        name:name
    })
    return result
}
//编辑试题集
export function editCollect(loginToken,collectId,name) {
    const result = post('/account/teacher/collect/update',{
        loginToken:loginToken,
        collectId:collectId,
        name:name
    })
    return result
}
//删除试题集
export function delCollect(loginToken,collectId) {
    const result = post('/account/teacher/collect/delete',{
        loginToken:loginToken,
        collectId:collectId
    })
    return result
}
//获取习题集下面的题
export function getCollectTopic(loginToken,collectId,degree,categoryId,keyword,pageNumber,pageSize) {
    const result = post('/account/teacher/question/list',{
        loginToken:loginToken,
        collectId:collectId,
        degree:degree,
        categoryId:categoryId,
        keyword:keyword,
        pageNumber:pageNumber,
        pageSize:pageSize
    })
    return result
}
//请求题型，难度数据
export function getTypeDgreeData(stageId,subjectId) {
    const result = post('/config/question-search', {
        stageId:stageId,
        subjectId:subjectId
    })
    return result
}