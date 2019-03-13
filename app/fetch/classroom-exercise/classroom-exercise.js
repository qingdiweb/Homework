import { get } from '../get'
import { post } from '../post'

//请求作业首页列表数据
export function getExerciseListData(loginToken,classId,catalogId,state,createdAtStart,createdAtEnd,pageNumber,pageSize) {
    const result = post('/account/teacher/quiz/list',{
        loginToken:loginToken,
        classId:classId,
        catalogId:catalogId,
        state:state,
        createdAtStart:createdAtStart,
        createdAtEnd:createdAtEnd,
        pageNumber:pageNumber,
        pageSize:pageSize,
    })
    return result
}
//删除指定练习
export function delExerciseList(loginToken,quizId) {
    const result = post('/account/teacher/quiz/delete',{
        loginToken:loginToken,
        quizId:quizId
    })
    return result
}
//练习详情
export function getExerciseDetail(loginToken,quizId) {
    const result = post('/account/teacher/quiz/detail',{
        loginToken:loginToken,
        quizId:quizId
    })
    return result
}
//更新测验中题目
export function updateExerciseTopic(loginToken,quizId,catalogIds,questionIds,choiceCatalogId,questionCount) {
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
//删除测验中题目
export function delExerciseTopic(loginToken,quizId,questionIds,questionCount) {
    const result = post('/account/teacher/quiz/deleteQuestion',{
        loginToken:loginToken,
        quizId:quizId,
        questionIds:questionIds,
        questionCount:questionCount
    })
    return result
}
//获取测验中题目详情
export function getExerciseTopicDetail(loginToken,quizId,questionId) {
    const result = post('/account/teacher/quiz/answerResult',{
        loginToken:loginToken,
        quizId:quizId,
        questionId:questionId
    })
    return result
}
//保存课堂笔记
export function saveExerciseRemark(loginToken,quizId,remark) {
    const result = post('/account/teacher/quiz/remark',{
        loginToken:loginToken,
        quizId:quizId,
        remark:remark
    })
    return result
}
