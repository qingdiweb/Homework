import { get } from '../get'
import { post } from '../post'

//请求作业详情数据
export function getHomeworkDetail(loginToken,homeworkId) {
    const result = post('/account/teacher/homework/detail',{
        loginToken:loginToken,
        homeworkId:homeworkId
    })
    return result
}
//请求作业题目详情数据
export function getHomeworkQuestionDetail(loginToken,questionId) {
    const result = post('/account/teacher/question/detail',{
    	loginToken:loginToken,
    	questionId:questionId
    })
    return result
}
//指定题目-获取待批改的学生答案列表
export function getStudentAnswerList(loginToken,homeworkId,questionId) {
    const result = post('/account/teacher/homework/question/uncheck',{
        loginToken:loginToken,
        homeworkId:homeworkId,
        questionId:questionId
    })
    return result
}
//指定学生-获取待批改的题目答案列表
export function getTopicAnswerList(loginToken,homeworkId,studentId) {
    const result = post('/account/teacher/homework/student/uncheck4Web',{
        loginToken:loginToken,
        homeworkId:homeworkId,
        studentId:studentId
    })
    return result
}
//批改答案
export function correctAnswer(loginToken,homeworkId,studentId,questionId,correct,reviewFlag) {
    const result = post('/account/teacher/homework/answer/check',{
        loginToken:loginToken,
        homeworkId:homeworkId,
        studentId:studentId,
        questionId:questionId,
        result:correct,
        reviewFlag:reviewFlag
    })
    return result
}
//指定题目答题情况
export function specifyQuestionsStatistical(loginToken,homeworkId,questionId) {
    const result = post('/account/teacher/homework/question/detail',{
        loginToken:loginToken,
        homeworkId:homeworkId,
        questionId:questionId
    })
    return result
}
//指定学生答题情况
export function specifyStudentStatistical(loginToken,homeworkId,studentId,pageNumber,pageSize) {
    const result = post('/account/teacher/homework/student/detail',{
        loginToken:loginToken,
        homeworkId:homeworkId,
        studentId:studentId,
        pageNumber:pageNumber,
        pageSize:pageSize
    })
    return result
}
//获取作业下所有题目答题情况
export function getHomeworkQuestion(loginToken,homeworkId) {
    const result = post('/account/teacher/homework/question/overview',{
        loginToken:loginToken,
        homeworkId:homeworkId
    })
    return result
}
//获取作业下所有学生答题情况
export function getHomeworkStudent(loginToken,homeworkId) {
    const result = post('/account/teacher/homework/student/overview',{
        loginToken:loginToken,
        homeworkId:homeworkId
    })
    return result
}
//上传图片，文件(base64)
export function canvasUpload(loginToken,base64Url) {
    const result = post('/account/teacher/homework/answer/file/upload/check4Base64',{
        loginToken:loginToken,
        base64Url:base64Url
    })
    return result
}
//url转base64
export function convertBase64(imgUrl) {
    const result =  post('/config/urlToBase64',{
        imgUrl:imgUrl
    })
    return result
}
//评语库
export function remarkLibrary(loginToken) {
    const result =  post('/account/teacher/remark/list',{
        loginToken:loginToken
    })
    return result
}
