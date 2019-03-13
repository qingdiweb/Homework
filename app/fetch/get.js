import 'whatwg-fetch'
import 'es6-promise'

export function get(url) {
 var host='https://test.huazilive.com/api/tiku';//测试地址
  //var host='https://api.huazilive.com/api/tiku';//正式地址
  var result = fetch(host+url, {
      credentials: 'include',
      headers: {
          'Accept': 'application/json, text/plain, */*'
      }
  });

  return result;
}
