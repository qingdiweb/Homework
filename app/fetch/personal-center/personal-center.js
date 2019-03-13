import { get } from '../get'
import { post , commonpost} from '../post'

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
export function getSchool(loginToken,areaId,type) {
    const result = post('/school/school',{
        loginToken:loginToken,
        areaId:areaId,
        type:type
    })
    return result
}
//更新教师个人信息
export function updateTeacherInfo(loginToken,avatarUrl,nickname,gender,stageId,stage,subjectId,subject,provinceId,province,cityId,city,areaId,area,schoolId,school) {
    const result = post('/account/teacher/update',{
        loginToken:loginToken,
        avatarUrl:avatarUrl,
        nickname:nickname,
        gender:gender,
        stageId:stageId,
        stage:stage,
        subjectId:subjectId,
        subject:subject,
        provinceId:provinceId,
        province:province,
        cityId:cityId,
        city:city,
        areaId:areaId,
        area:area,
        schoolId:schoolId,
        school:school
    })
    return result
}
//账户更换手机号-获取验证码
export function getCode(loginToken,verifyPhone) {
    const result = commonpost('/account/common/phone/binding/request', {
        loginToken:loginToken,
        verifyPhone: verifyPhone
    })
    return result
}
//绑定手机号码
export function bindPhone(loginToken,verifyPhone,verifyCode) {
    const result = commonpost('/account/common/phone/binding/confirm', {
        loginToken:loginToken,
        verifyPhone: verifyPhone,
        verifyCode:verifyCode
    })
    return result
}
//更新用户密码
export function updatePassword(loginToken,password,oldpwd) {
    const result = commonpost('/account/common/password/reset', {
        loginToken:loginToken,
        password: password,
        oldpwd:oldpwd
    })
    return result
}
