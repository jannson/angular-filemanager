import axios from 'axios'
import { Modal,message } from 'ant-design-vue'
// import appStore from '@/store'

const localBaseURL = window.location
const baseURL = 'https://service.koolshare.cn'
const service = axios.create({
    baseURL: localBaseURL,
    method: 'post',
    timeout: 20000
})
service.interceptors.request.use(options => {
    console.log('request: ', options)
    const config = options
    // const method = options.method.toUpperCase()
    const field = 'data' // method === 'GET' ? 'params' : 'data'
    config[field] = { ...options[field]}

    return config
}, error => Promise.reject(error))


service.interceptors.response.use(
    response => {
        console.log('response: ', response)
        const { data } = response
        const code = data.success
        if (+code === 0) {
            return data
        } else if(code === 422) { // todo 过期
            const url = "/"
            window.location = url
        }

        return Promise.reject(data)
    },
    error => Promise.reject(error)
)

/**
 * axios封装
 * @param  {Object} params      axios 的请求参数
 * @param  {Boolean} ignoreError 是否忽略错误，用来自己处理异常
 * @return {Promise}             返回一个Promise对象
 */
function request(params, ignoreError) {
    message.loading('加载中', 0)
    return service(params).then(res => {
        message.destroy()
        return res
    }).catch(res => {
        console.log('request.error: ', res)
        message.destroy()
        const code = res.success

        // 网络异常等情况，拿到的是string类型的错误信息
        if (typeof res === 'string') {
            // 为兼容后端返回的数据，这里把res封装到message中
            const error = { res }
            if (ignoreError !== true && code !== 0) {
                Modal.warning({
                    title: '提示',
                    content: res
                })
                // appStore.setError(error)
            }
            return Promise.reject(error)
        }

        // 422 token失效
        // if (+code === 422) {
        //     // appStore.setToken(null)

        //     window.location = url
        // }

        // 接口如果需要在外边需要异常，需要设置ignoreError = true
        if (ignoreError !== true && code !== 0) {
            Modal.warning({
                title: '错误提示',
                content: res.error
            })
        }

        return Promise.reject(res)
    })
}

// function
export {
    baseURL,
}
export default request
