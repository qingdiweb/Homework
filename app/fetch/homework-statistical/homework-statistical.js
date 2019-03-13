import { get } from '../get'
import { post } from '../post'

//获取成绩统计信息
export function getResultStatistical(loginToken,homeworkId) {
    const result = post('/account/teacher/homework/stat/scoreStat',{
        loginToken:loginToken,
        homeworkId:homeworkId
    })
    return result
}
//获取知识点统计信息
export function getKnowledgeStatistical(loginToken,homeworkId) {
    const result = post('/account/teacher/homework/stat/knowledgeStat',{
    	loginToken:loginToken,
    	homeworkId:homeworkId
    })
    return result
}
