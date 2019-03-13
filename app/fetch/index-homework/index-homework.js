import { get } from '../get'
import { post } from '../post'

//请求作业首页列表数据
export function getHomeworkListData(loginToken,pageNumber,pageSize,classId,state,publishAtStart,publishAtEnd) {
    const result = post('/account/teacher/homework/list',{
    	loginToken:loginToken,
    	pageNumber:pageNumber,
        pageSize:pageSize,
        classId:classId,
        state:state,
        publishAtStart:publishAtStart,
        publishAtEnd:publishAtEnd
    })
    return result
}
//删除指定作业
export function delHomeworkList(loginToken,homeworkId) {
    const result = post('/account/teacher/homework/delete',{
        loginToken:loginToken,
        homeworkId:homeworkId
    })
    return result
}
//更新教师个人信息
export function updateTeacherInfo(loginToken,realname,gender,school,stageId,subjectId) {
    const result = post('/account/teacher/homework/delete',{
        loginToken:loginToken,
        realname:realname,
        gender:gender,
        school:school,
        stageId:stageId,
        subjectId:subjectId
    })
    return result
}
//获取阶段以及科目
export function getStageSubject() {
    const result = post('/config/subject',{
   
    })
    return result
}
//获取省
export function getProvince(loginToken) {
    const result = post('/school/province',{
        loginToken:loginToken
    })
    return result
}
//获取城市列表
export function getCity(loginToken,provinceId) {
    const result = post('/school/city',{
        loginToken:loginToken,
        provinceId:provinceId
    })
    return result
}
//获取区县列表
export function getArea(loginToken,cityId) {
    const result = post('/school/area',{
        loginToken:loginToken,
        cityId:cityId
    })
    return result
}
//获取学校列表
export function getSchool(loginToken,areaId) {
    const result = post('/school/school',{
        loginToken:loginToken,
        areaId:areaId
    })
    return result
}
//获取班级列表
export function getClassList(loginToken) {
    const result = post('/account/teacher/class/list',{
        loginToken:loginToken
    })
    return result
}