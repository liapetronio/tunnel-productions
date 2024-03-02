import axios from "axios";
import router from '../../router/index.js';
import {_} from 'vue-underscore';
/**
 *
 * @param urls
 * @param user_key
 * @param user_key_str
 * @returns {Promise<unknown[]>}
 */
export async function axiosGETWithUserKey(urls, user_key) {
    const promises = [];
    const config = {
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "user_key": user_key
        }
    }
    for (let url of urls) {
        promises.push(axios.get(url, config))
    }
    return await axios.all(promises)
}
/**
 *
 * @param urls
 * @param user_key
 * @returns {Promise<unknown[]>}
 */
export async function axiosGET(urls, user_key) {
    const promises = [];
    const config = {
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "portal_key": user_key
        }
    }
    for (let url of urls) {
        promises.push(axios.get(url, config))
    }
    return await axios.all(promises)
}

/**
 *
 * @param apiURL
 * @param email
 * @param password
 * @returns {Promise<*>}
 */
export async function login(apiURL, email, password) {
    const url = apiURL + 'registration/prism-portal-auth';
    const payload = {
        email: email,
        password: password
    };
    const res = await axiosPost(url, null, payload);
    const dat = res.data;
    const parsed = JSON.stringify(dat);
    localStorage.setItem('user_info', parsed);
    return dat.api_key;
}

export async function getPublicResources(apiURL) {
    const userKey = await getTempApiKey(apiURL);
    const filter = {fields: ["resource"]};
    const url = apiURL + "portal_public_resources?filter="+JSON.stringify(filter);
    const resp = await axiosGETWithUserKey([url],userKey);
    return _.uniq(_.pluck(resp[0].data, "resource"));
}

export async function getTempApiKey(apiURL) {
    const config = {
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    }
    const url = apiURL.replace("/api/","/") + 'temp_api_key';
    const resp = await axios.get(url, config);
    return resp.data.user_key;
}
/**
 *
 * @param resource
 * @returns {Promise<boolean>}
 */
export async function anonymousResources(resource,apiURL) {
    const anonResources = await getPublicResources(apiURL);
    const re = new RegExp(anonResources.join("|"), "i");
    return re.test(resource);
}

/**
 *
 * @param url
 * @param user_key
 * @param payload
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export async function axiosPost(url, user_key, payload) {
    if (user_key) {
        return await axios.post(url, payload, {
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "portal_key": user_key
                }
            }
        );
    }
    return await axios.post(url, payload, {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        }
    );
}

/**
 *
 * @param error
 * @param redirect_url
 */
export function handleAxiosError(error, redirect_url) {
    if (error.response) {
        console.log(error.response.status);
        if (error.response.status === 401) {
            //redirect to not authorized page
            console.log("Error message", error.response.data.error);
            router.push({path: '/notAuthorized'});
        } else if (error.response.status === 400) {
            router.push({path: '/notAuthorized'});
            //Display message on current page if there is one
        } else if (error.response.data && error.response.data.error && error.response.data.error.startsWith("jwt")) {
            localStorage.removeItem('user_info');
            console.log("jwt error")
            router.push({name: 'LoginPage', query: {redirect: redirect_url, jwt: "jwt"}});
        } else {
            console.log("Error message", error.response.data.error);
            router.push({path: '/notFound'});
        }
    } else if (error.request) {
        //response not received though the request was sent
        console.log(error.request);
    } else {
        //an error occurred when setting up the request
        console.log(error.message);
    }
}

export function get_USER_KEY() {
    const user_info = localStorage.getItem('user_info');
    const user_info_parsed = JSON.parse(user_info);
    if(user_info_parsed){
        return user_info_parsed.api_key;
    }
    return null;
}

export function get_PARAMS() {
    const params = localStorage.getItem('params');
    return JSON.parse(params)
}


export function userAuth() {
    let isAuth;
    if (localStorage.getItem('user_info')) {
        isAuth = true;
        console.log("USER_KEY", this.$USER_KEY)

    } else {
        isAuth = false
        console.log("NO USER_KEY", this.$USER_KEY)
    }
    return isAuth
}

