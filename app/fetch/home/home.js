import { get } from '../get'
import { post } from '../post'

export function getTeacherInfo(loginToken) {
    const result = post('/account/teacher/info',{
    	loginToken:loginToken
    })
    return result
}

