import 'whatwg-fetch'
import 'es6-promise'

// 将对象拼接成 key1=val1&key2=val2&key3=val3 的字符串形式
function obj2params(obj) {
    var result = '';
    var item;
    for (item in obj) {
        result += '&' + item + '=' + encodeURIComponent(obj[item]);
    }
    if (result) {
        result = result.slice(1);
    }
    return result;
}
// 发送 post 请求
export function post(url, paramsObj) {
    var host='https://test.huazilive.com/api/tiku';//测试地址
    //var host='https://api.huazilive.com/api/tiku';//正式地址
    //var host='https://59.110.6.198/api/tiku';//临时
    var result = fetch(host+url, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: obj2params(paramsObj)
    });

    return result;
}
// 共同私有操作发送 post 请求
export function commonpost(url, paramsObj) {
    var host='https://test.huazilive.com/api/service';//测试地址
    //var host='https://api.huazilive.com/api/service';//正式地址
    //var host='https://59.110.6.198/api/service';//临时
    var result = fetch(host+url, {
        method: 'POST',
        credentials: 'include',//是为了向后台传输数据时带上cookie
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: obj2params(paramsObj)
    });

    return result;
}
