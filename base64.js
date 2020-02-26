const _AXIOS = require('axios').default;
const _HTTPS = require('https');
const _HTTPS_AGENT = new _HTTPS.Agent({ rejectUnauthorized: false });

let url = '';
let base64 = '';
let url_base = '';

//url = 'https://f88.vn/uploads/test/17.jpg';
//url = 'https://f88.s3-ap-southeast-1.amazonaws.com/Test/POS/Uploads/HDCC/HN62HD/2002/13/3.11202002181049430912742.jpg';

//url_base = 'https://f88.vn/';
//url = '/uploads/test/17.jpg';

url_base = 'https://f88.s3-ap-southeast-1.amazonaws.com/';
url = '/Test/POS/Uploads/HDCC/HN62HD/2002/13/3.11202002181049430912742.jpg';


const _CLIENT = _AXIOS.create({
    baseURL: url_base,
    responseType: 'json',
    withCredentials: true,
    httpsAgent: _HTTPS_AGENT
});

const t2 = async () => { 
    let image = await _CLIENT.get(url, { responseType: 'arraybuffer' });
    base64 = Buffer.from(image.data).toString('base64');
    console.log(base64);
};
t2();







