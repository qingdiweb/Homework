import { get } from '../get'
import { post } from '../post'

//查看全版本,教材,章节都有树结构数据
export function getAllTextbookListData(stageId,subjectId,extParam) {
    const result = post('/config/textbook/list',{
    	stageId:stageId,
    	subjectId:subjectId,
        extParam:extParam
    })
    return result
}
//请求教材数据
export function getMaterialListData(stageId,subjectId,extParam) {
    const result = post('/config/textbook/list4Edition',{
        stageId:stageId,
        subjectId:subjectId,
        extParam:extParam
    })
    return result
}
//请求教材下章节数据
export function getMaterialCatalogData(loginToken,textbookId,extParam) {
    const result = post('/textbook/catalog',{
        loginToken:loginToken,
        textbookId:textbookId,
        extParam:extParam
    })
    return result
}
//请求教辅结构数据
export function getCoachbookData(stageId,subjectId,extParam) {
    const result = post('/config/coachbook',{
        stageId:stageId,
        subjectId:subjectId,
        extParam:extParam
    })
    return result
}
//查询最后操作的教材(教辅)和章节
export function getLastOperation(loginToken) {
    const result = post('/account/teacher/question/getLastOperation',{
        loginToken:loginToken
    })
    return result
}
//请求知识点树结构数据
export function getKnowledgeListData(stageId,subjectId,extParam){
    const result = post('/config/knowledge',{
        stageId:stageId,
        subjectId:subjectId,
        extParam:extParam
    })
    return result
}
//请求收藏树结构数据
export function getCollectListData(loginToken,questionId,extParam){
    const result = post('/account/teacher/collect/list',{
        loginToken:loginToken,
        questionId:questionId,
        extParam:extParam
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
//请求筛选题列表数据
export function getTopicListData(loginToken,catalogId,coachbookCatalogId,knowledgeId,collectId,paperId,tagId,categoryId,degree,keyword,draftId,extParam,rememberFlag,pageNumber,pageSize,totalSize) {
    const result = post('/account/teacher/question/list', {
        loginToken:loginToken,
        catalogId:catalogId,
        coachbookCatalogId:coachbookCatalogId,
        knowledgeId:knowledgeId,
        collectId:collectId,
        paperId:paperId,
        tagId:tagId,
        categoryId:categoryId,
        degree:degree,
        keyword:keyword,
        draftId:draftId,
        extParam:extParam,
        rememberFlag:rememberFlag,
        pageNumber:pageNumber,
        pageSize:pageSize,
        totalSize:totalSize,
    })
    return result
}
//获取默认草稿
export function getDefaultDraft(loginToken) {
    const result = post('/account/teacher/draft/default', {
        loginToken:loginToken
    })
    return result
}
//获取草稿详情
export function getDraftDetail(loginToken,draftId) {
    const result = post('/account/teacher/draft/info', {
        loginToken:loginToken,
        draftId:draftId
    })
    return result
}
//根据题目id获取题目列表
export function findQuestion(loginToken,questionIds) {
    const result = post('/account/teacher/question/find', {
        loginToken:loginToken,
        questionIds:questionIds
    })
    return result
}

//默认草稿-增加题目
export function DefaultDraftAddQuestion(loginToken,draftId,questionId) {
    const result = post('/account/teacher/draft/question/add', {
        loginToken:loginToken,
        draftId:draftId,
        questionId:questionId
    })
    return result
}
//默认草稿-删除题目
export function DefaultDraftDelQuestion(loginToken,draftId,questionId) {
    const result = post('/account/teacher/draft/question/delete', {
        loginToken:loginToken,
        draftId:draftId,
        questionId:questionId
    })
    return result
}
//获取草稿题目列表
export function getDefaultQuestionList(loginToken,draftId,pageNumber,pageSize) {
    const result = post('/account/teacher/draft/question/list', {
        loginToken:loginToken,
        draftId:draftId,
        pageNumber:pageNumber,
        pageSize:pageSize
    })
    return result
}
//保存草稿
export function saveDefault(loginToken,draftId,currentQuestionIds,currentCatalogIds,questionCount) {
    const result = post('/account/teacher/draft/update', {
        loginToken:loginToken,
        draftId:draftId,
        currentQuestionIds:currentQuestionIds,
        currentCatalogIds:currentCatalogIds,
        questionCount:questionCount
    })
    return result
}
//发布作业
export function  publishHomework(loginToken,draftId,name,publishAt,abortAt,classIds,currentQuestionIds) {
    const result = post('/account/teacher/draft/publish', {
        loginToken:loginToken,
        draftId:draftId,
        name:name,
        publishAt:publishAt,
        abortAt:abortAt,
        classIds:classIds,
        currentQuestionIds:currentQuestionIds
    })
    return result
}
//收藏习题册-查找列表
export function  collectSearchList(loginToken,questionId) {
    const result = post('/account/teacher/collect/list', {
        loginToken:loginToken,
        questionId:questionId
    })
    return result
}
//添加习题集
export function  addProblem(loginToken,name) {
    const result = post('/account/teacher/collect/add', {
        loginToken:loginToken,
        name:name
    })
    return result
}
//增加或取消收藏至多个习题册
export function  addorcancelCollect(loginToken,collectIds,questionId) {
    const result = post('/account/teacher/collect/question/update', {
        loginToken:loginToken,
        collectIds:collectIds,
        questionId:questionId
    })
    return result
}
//删除习题集下的题目
export function  delectCollectQuestion(loginToken,collectId,questionId) {
    const result = post('/account/teacher/collect/question/delete', {
        loginToken:loginToken,
        collectId:collectId,
        questionId:questionId
    })
    return result
}
//添加班级
export function  addClass(loginToken,name) {
    const result = post('/account/teacher/class/add', {
        loginToken:loginToken,
        name:name
    })
    return result
}
//获取试卷筛选条件数据
export function getPaperSearchCondition(stageId,subjectId) {
    const result = post('/config/paper-search',{
        stageId:stageId,
        subjectId:subjectId
    })
    return result
}
//获取试卷
export function getPaperData(stageId,subjectId,provinceId,gradeId,yearInt,type,extParam) {
    const result = post('/paper/list',{
        stageId:stageId,
        subjectId:subjectId,
        provinceId:provinceId,
        gradeId:gradeId,
        yearInt:yearInt,
        type:type,
        extParam:extParam
    })
    return result
}
//生成新的草稿
export function toDraft(loginToken,homeworkId) {
    const result = post('/account/teacher/homework/toDraft',{
        loginToken:loginToken,
        homeworkId:homeworkId
    })
    return result
}
//专题列表
export function getProjectList(loginToken,catalogId,tagType,pageNumber,pageSize) {
    const result = post('/account/teacher/question/list4Tag',{
        loginToken:loginToken,
        catalogId:catalogId,
        tagType:tagType,
        pageNumber:pageNumber,
        pageSize:pageSize
    })
    return result
}
//推荐试题
export function getRecommendList(loginToken,catalogId,excludeIds,pageNumber,pageSize) {
    const result = post('/account/teacher/question/list4Quiz',{
        loginToken:loginToken,
        catalogId:catalogId,
        excludeIds:excludeIds,
        pageNumber:pageNumber,
        pageSize:pageSize
    })
    return result
}
//创建测验
export function saveExercise(loginToken,draftId,classIds,name,catalogIds,questionIds,choiceCatalogId,questionCount) {
    const result = post('/account/teacher/quiz/save',{
        loginToken:loginToken,
        draftId:draftId,
        classIds:classIds,
        name:name,
        catalogIds:catalogIds,
        questionIds:questionIds,
        choiceCatalogId:choiceCatalogId,
        questionCount:questionCount
    })
    return result
}
//更新测验
export function updateExercise(loginToken,quizId,catalogIds,questionIds,choiceCatalogId,questionCount) {
    const result = post('/account/teacher/quiz/update',{
        loginToken:loginToken,
        quizId:quizId,
        catalogIds:catalogIds,
        questionIds:questionIds,
        choiceCatalogId:choiceCatalogId,
        questionCount:questionCount
    })
    return result
}

