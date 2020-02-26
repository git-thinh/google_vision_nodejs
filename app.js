const ___HTTP_PORT = 1502;
const ___LOG_PORT = 1515;
const ___LOG_ERROR_PORT = 1510;

const ___IP = '127.0.0.1';
//const ___IP = '192.168.10.54';

const ___URL_BASE_STORE_IMG = 'http://192.168.10.54:9393/';
//const ___URL_BASE_STORE_IMG = 'https://f88.vn/';
//const ___URL_BASE_STORE_IMG = 'https://f88.s3-ap-southeast-1.amazonaws.com/';

const ___SCOPE = 'OCR_API';
const ___TOKEN_API = 'eb976d531188435ea006fce8769c53d5';
let ___URL = 'https://vision.googleapis.com/v1/images:annotate?key=AIzaSyC4xj2chiZKLv_QCSsI5JvY7MHcjJQ9kFw_123456789';

const ___DB_CONFIG = {
    server: '192.168.11.205',
    //server: '192.168.10.54',
    authentication: {
        type: 'default',
        options: {
            userName: 'sa',
            password: 'dev@123'
        }
    },
    options: {
        database: 'Test'
    }
};
let ___CONNECTED = false;


//#region [ VARIABLES ]

const _UUID = require('uuid');

const _JOB = require('cron').CronJob;

let ___ADDRESS_PORT;

const _PATH = require('path');
const _FS = require('fs');
const _FETCH = require('node-fetch');
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

//#endregion

//#region [ LOG UDP ]

const ___log = (...agrs) => { LOG_MSG_BUFFER.push(___SCOPE + ' ' + new Date().toLocaleString() + ': \t' + JSON.stringify(agrs)); }
const ___log_err_throw = (func_name, err_throw, para1, para2, para3) => {
    const s = ___SCOPE + '_ERR_THROW ' + new Date().toLocaleString() + ' [ ' + func_name + ' ]';
    LOG_ERROR_MSG.push([___SCOPE, s, err_throw, para1, para2, para3]);
}

const LOG_ERROR_MSG = [];
let LOG_ERROR_MSG_WRITING = false;
new _JOB('* * * * * *', function () {
    try {
        if (LOG_ERROR_MSG_WRITING) return;
        if (LOG_ERROR_MSG.length > 0) {
            LOG_ERROR_MSG_WRITING = true;
            const text = LOG_ERROR_MSG.shift();
            var buf = Buffer.from(text);
            const udp = _DGRAM.createSocket('udp4');
            udp.send(buf, 0, buf.length, ___LOG_ERROR_PORT, '127.0.0.1', (err) => {
                LOG_ERROR_MSG_WRITING = false;
                udp.close();
            });
        }
    } catch (e1) { }
}).start();

const LOG_MSG_BUFFER = [];
let LOG_MSG_WRITING = false;
new _JOB('* * * * * *', function () {
    try {
        if (LOG_MSG_WRITING) return;
        if (LOG_MSG_BUFFER.length > 0) {
            LOG_MSG_WRITING = true;
            const text = LOG_MSG_BUFFER.shift();
            var buf = Buffer.from(text);
            const udp = _DGRAM.createSocket('udp4');
            udp.send(buf, 0, buf.length, ___LOG_PORT, '127.0.0.1', (err) => {
                LOG_MSG_WRITING = false;
                udp.close();
            });
        }
    } catch (e1) { }
}).start();

//#endregion

console.log(___SCOPE, 'Start ... ', new Date().toLocaleString());
___log(___SCOPE, 'Start ... ', new Date().toLocaleString());

//#region [ API LOAD FILE ]

const ___API = {};
const ___FN = {};

const file___loadScript = () => {
    _FS.readdir('./api/', (err, arr_apis_) => {
        //console.log(arr_apis_);
        arr_apis_.forEach(api_ => {
            _FS.readdir('./api/' + api_, (err, files_) => {
                //console.log(api_, files_);
                files_.forEach(fi_ => {
                    const file = './api/' + api_.toLowerCase() + '/' + fi_.toLowerCase();
                    //console.log(file);
                    if (file.endsWith('.js')) {
                        _FS.readFile(file, 'utf-8', (err, js_) => {
                            if (err) {
                                //console.log(err);
                            } else {
                                const s_ = js_.trim();
                                const scope_ = api_.toUpperCase();

                                if (___FN[scope_] == null) ___FN[scope_] = {};
                                const biz = fi_.substr(0, fi_.length - 3).toUpperCase();

                                ___FN[scope_][biz] = function (s) { return 'N/A'; };

                                eval('(function () { ___FN["' + scope_ + '"]["' + biz + '"] = ' + s_ + '; })()');

                                //const test_ = ___FN[scope_][biz](_UUID.v1());
                                //console.log('????????? ' + scope_ + '/' + biz + ' = ' + test_);
                            }
                        });
                    }
                });
            });
        });
    });
};

file___loadScript();

//#endregion

//#region [ HTTP INIT ]

const _HTTP_EXPRESS = require('express');
const _HTTP_BODY_PARSER = require('body-parser');
const _HTTP_APP = _HTTP_EXPRESS();
const _HTTP_SERVER = require('http').createServer(_HTTP_APP);

//_HTTP_APP.use(_HTTP_BODY_PARSER.json());
//_HTTP_APP.use((error, req, res, next) => {
//    if (___CONNECTED == false) {
//        return res.json({ ok: false, mesage: 'Db disconnect ...' });
//    }
//    if (error !== null) {
//        return res.json({ ok: false, mesage: 'Invalid json ' + error.toString() });
//    }
//    return next();
//});
//_HTTP_APP.use(_HTTP_EXPRESS.static(_PATH.join(__dirname, 'htdocs')));

_HTTP_APP.use(function (req, res, next) {
    if (req.is('text/*')) {
        req.text___ = '';
        req.setEncoding('utf8');
        req.on('data', function (chunk) { req.text___ += chunk });
        req.on('end', next);
    } else {
        next();
    }
});

//#endregion

//#region [ HTTP /fns/... ]

_HTTP_APP.get('/fns', async (req, res) => { res.json(Object.keys(___FN)); });

_HTTP_APP.get('/fns/config', function (req, res) {
    const o = {};
    Object.keys(___FN).forEach(api_ => {
        o[api_] = [];
        Object.keys(___FN[api_]).forEach(fn_ => { o[api_].push(fn_); });
    });
    res.json(o);
});

_HTTP_APP.get('/fns/execute/:api/:reduce', function (req, res) {
    const api = req.params.api.toUpperCase();
    const reduce = req.params.reduce.toUpperCase();
    const m = { ok: false, text: '' };
    if (___FN[api] && ___FN[api][reduce]) {
        m.ok = true;
        const data = _UUID.v4();
        m.text = ___FN[api][reduce](data);
    }
    res.json(m);
});

_HTTP_APP.post('/fns/execute/:api/:reduce', function (req, res) {
    //const text = req.body;
    const text = req.text___;
    const api = req.params.api.toUpperCase();
    const reduce = req.params.reduce.toUpperCase();
    const m = { ok: false, text: text, result: '' };
    if (___FN[api] && ___FN[api][reduce]) {
        m.ok = true;
        m.result = ___FN[api][reduce](text);
    }
    res.json(m);
});

//#endregion

//#region [ HTTP /api/ocr ]

_HTTP_APP.get('/ocr/cmt/v1', function (req, res) {
    const token = req.query.token;
    const type = req.query.type;
    const file = req.query.file;
    const file2 = req.query.file2;
    f___MSG_PUSH(res, null, { type: type, file: file, file2: file2 });
});

//#endregion

//#region [ HTTP ... ]

_HTTP_APP.post('/' + ___SCOPE.toLowerCase() + '/:api_name/:action/:token', async (req, res) => {
    const path = '/' + ___SCOPE.toLowerCase() + '/:api_name/:action/:token';

    const data = req.body;
    const api_name = req.params.api_name.toUpperCase();
    const action = req.params.action.toUpperCase();
    const token = req.params.token.toLowerCase();

    if (data == null) {
        res.json({ ok: false, message: 'Data is null' });
        return;
    }

    if (api_name == null || api_name.length == 0) {
        res.json({ ok: false, message: path + ' invalid' });
        return;
    }

    if (action == null || action.length == 0) {
        res.json({ ok: false, message: path + ' invalid' });
        return;
    }

    f___MSG_PUSH(res, { api: api_name, action: action }, data);
});

//#endregion

//#region [ HTTP listen ]

_HTTP_SERVER.listen(___HTTP_PORT, ___IP, () => {
    ___ADDRESS_PORT = _HTTP_SERVER.address();
    console.log('HTTP_API: ', ___ADDRESS_PORT);
});

//#endregion

//#region [ DB ]

const _DB_CONNECTION = require('tedious').Connection;
const _DB_REQUEST = require('tedious').Request;
const _DB_TYPES = require('tedious').TYPES;
//const _ASYNC = require('async');

let _DB_CONN;

const db___start = () => {
    _DB_CONN = new _DB_CONNECTION(___DB_CONFIG);

    _DB_CONN.on('connect', function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log('DB Connected ... ');
            ___CONNECTED = true;
        }
    });
};

const db___execute_callback = (m) => {
    const client = m.client;
    const error = m.error;
    const result = m.result;

    const setting = m.setting;
    const data = m.data;

    const api = setting.api;
    const action = setting.action;

    const store = api + '/' + action;

    if (error) {
        console.log('ERROR: ' + store, data, error);

        if (client) {
            delete m['client'];
            m.ok = false;
            client.json(m);
        }

        return;
    }

    console.log('OK: ' + store, result);

    if (client) {
        delete m['client'];
        m.ok = true;
        client.json(m);
    }
};

const db___execute = (m) => {
    if (m) {
        const client = m.client;
        const setting = m.setting;
        const data = m.data;
        if (client && setting && data) {
            const api = setting.api;
            const action = setting.action;
            if (api && action) {
                if (___API[api] == null || ___API[api][action] == null) {
                    client.json({ ok: false, message: 'Cannot find file API: api/' + api + '/' + action });
                    return;
                }

                const sql_text = ___API[api][action];

                //const sql_text = " \
                //CREATE TABLE #___CHANGED(ID BIGINT, CACHE VARCHAR(255), DB_ACTION VARCHAR(255), SQL_CMD NVARCHAR(MAX), SORT INT DEFAULT(0)); \
                //DECLARE @OK BIT = 0; \
                //DECLARE @MESSAGE NVARCHAR(MAX) = ''; \
                ///*=====================================*/ \
                //declare @Name nvarchar(50) = '23123' \
                //declare @Location nvarchar(50) = '123213' \
                ///*=====================================*/ \
                ///*ROLLBACK: START*/ \
                //\
                //		INSERT INTO TESTSCHEMA.EMPLOYEES (Name, Location) \
                //		OUTPUT INSERTED.ID, 'POL_EMPLOYEES', 'DB_INSERT', 'SELECT * FROM TESTSCHEMA.EMPLOYEES WHERE ID = ' + CAST(INSERTED.ID AS VARCHAR(36)) \
                //	INTO #___CHANGED(ID, CACHE, DB_ACTION, SQL_CMD) \
                //		VALUES (@Name, @Location); \
                //\
                //		/*--SELECT * FROM #___CHANGED;*/ \
                //		EXEC ___CHANGED_JSON @OK OUTPUT, @MESSAGE OUTPUT; \
                //		DROP TABLE #___CHANGED; \
                //		/*-- CHECK TO ROLLBACK, THEN @OK = 0 -> FAIL*/ \
                //		/*--IF @OK = 0  BEGIN  PRINT 'CALL ROLLBACK'; END*/ \
                //\
                ///*ROLLBACK: END*/ \
                ///*=====================================*/ \
                ///*PRINT @OK;*/ \
                ///*PRINT @MESSAGE;*/"


                const _results = [];
                const request = new _DB_REQUEST(sql_text, function (err_, count_, rows_) {
                    m.error = err_;
                    m.result = _results;
                    //console.log('ROWS === ', _rows); 
                    db___execute_callback(m);
                });

                for (var col in data) {
                    if (typeof data[col] == 'string')
                        request.addParameter(col, _DB_TYPES.NVarChar, data[col]);
                    else
                        request.addParameter(col, _DB_TYPES.BigInt, data[col]);
                }

                //request.on('doneProc', function (rowCount, more, rows) {
                //    console.log(rowCount, more, rows);
                //});

                request.on('row', function (columns) {
                    const o = {};
                    columns.forEach(function (v_) {
                        const col = v_.metadata.colName;
                        const val = v_.value;
                        switch (col) {
                            case 'ID':
                                if (v_.value != null)
                                    o[col] = Number(val);
                                else
                                    o[col] = val;
                                break;
                            case 'VAL':
                                if (val != null && val.length > 1 && val[0] == '{')
                                    o[col] = JSON.parse(val);
                                else
                                    o[col] = val;
                                break;
                            default:
                                o[col] = val;
                                break;
                        }
                        //console.log('????????? = ' + v_.metadata.colName, v_.metadata.type.name);
                        //console.log('????????? = ' + v_.metadata.colName, v_.metadata.type.type);
                    });
                    //console.log('????????? = ', o);
                    _results.push(o);
                });

                _DB_CONN.execSql(request);
            }
        }
    }
};

//db___start();
___CONNECTED = true;

//#endregion

//#region [ DOWNLOAD IMAGES -> BASE64 ]

const _AXIOS = require('axios').default;
const _HTTPS = require('https');
const _HTTPS_AGENT = new _HTTPS.Agent({ rejectUnauthorized: false });

const _CLIENT = _AXIOS.create({
    baseURL: ___URL_BASE_STORE_IMG,
    responseType: 'json',
    withCredentials: true,
    httpsAgent: _HTTPS_AGENT
});

const img___download_base64 = async (url) => {
    try {
        const image = await _CLIENT.get(url, { responseType: 'arraybuffer' });
        const base64 = Buffer.from(image.data).toString('base64');
        //console.log(base64);
        return base64;
    } catch (e) {
        return '';
    }
};

//img___download_base64('url ...');

//#endregion

//#region [ OCR ]

const ___OCR_CONFIG = {
    id: { func: 'SO_CMT' },
    fullname: { func: 'HO_TEN' },
    birthday: { func: 'NGAY_SINH' },
    address: { func: 'THUONG_TRU' },
    expiry: { func: 'HIEU_LUC' },
    gender: { func: 'GIOI_TINH' },

    //address_born: { func: 'NGUYEN_QUAN' },
    //date_active: { func: 'NGAY_CAP' }
};

const ocr___actract_text = (m) => {
    const a = m.Request;
    const o = {
        id: 'N/A',
        address: 'N/A',
        fullname: 'N/A',
        gender: 'N/A',
        birthday: 'N/A',
        expiry: 'N/A',
        ok: false
    };

    let ok = true;

    if (a && Array.isArray(a)
        && a.length > 0
        && a[0].ok == true
        && a[0].text
        && a[0].text.length > 0) {
        const s0_ = a[0].text.trim();

        for (var col in ___OCR_CONFIG) {
            const cf = ___OCR_CONFIG[col];
            if (cf && cf.func) {
                if (___FN['_'] && ___FN['_'][cf.func]) {
                    o[col] = ___FN['_'][cf.func](s0_);
                    if (o[col] == 'N/A') ok = false;
                }
            } else ok = false;
        }
    }

    o.ok = ok;
    m.Result.Item = o;
    return m;
};

const ocr___response_json = (res, files, results_) => {
    let m = {
        Ok: true,
        ServiceState: 'GOO_AUTHEN_SUCCESS',
        State: 'OCR_SUCCESS',
        Request: [],
        Result: {
            Item: {
                id: null,
                address: 'N/A',
                fullname: 'N/A',
                birthday: 'N/A',
                expiry: 'N/A',
                gender: 'N/A',
                ok: false
            }
        },
        Error: '',
        TimeStart: 0,
        TimeComplete: 0
    };

    const a = [
        { ok: false, file: files[0], message: '' },
        { ok: false, file: files[1], message: '' }
    ];

    //console.log(files, results_);

    results_.forEach((data, index_) => {
        if (data.responses && data.responses.length > 0) {
            const o = data.responses[0];

            if (o.textAnnotations && o.textAnnotations.length > 0) {
                if (o.textAnnotations[0].description) {
                    //console.log(files[0], o.textAnnotations[0].description);
                    a[index_] = { ok: true, file: files[index_], text: o.textAnnotations[0].description };
                    m.Request = a;
                    m = ocr___actract_text(m);
                } else {
                    a[index_].message = 'The field responses.textAnnotations.description is null';
                }
            } else {
                a[index_].message = 'The field responses.textAnnotations is null';
            }
        } else {
            a[index_].message = 'The field responses is null';
        }
    })

    m.Request = a;
    res.json(m);
};

const ocr___process = async (m) => {
    if (m) {
        const client = m.client;
        const data = m.data;
        if (client) {
            if (data == null) {
                client.json({ ok: false, message: 'Data is null' });
            } else {
                let type = data.type;
                let file = data.file;
                let file2 = data.file2;
                if (file && file2) {
                    //file = 'https://f88.vn/uploads/test/17.jpg';
                    //file2 = 'https://f88.vn/uploads/test/17.jpg';

                    //////const f1 = _FETCH(___URL, {
                    //////    method: 'POST', headers: { "Content-Type": "application/json" }, body: JSON.stringify({
                    //////        requests: [{
                    //////            image: { source: { imageUri: file } },
                    //////            features: [{ type: 'DOCUMENT_TEXT_DETECTION', maxResults: 1 }]
                    //////        }]
                    //////    })
                    //////}).then(res => res.json()); //.catch(err_ => { return { ok: false, file: file, message: err_ } });

                    //////const f2 = _FETCH(___URL, {
                    //////    method: 'POST', headers: { "Content-Type": "application/json" }, body: JSON.stringify({
                    //////        requests: [{
                    //////            image: { source: { imageUri: file2 } },
                    //////            features: [{ type: 'DOCUMENT_TEXT_DETECTION', maxResults: 1 }]
                    //////        }]
                    //////    })
                    //////}).then(res => res.json()); //.catch(err_ => { return { ok: false, file: file2, message: err_ } });

                    const b1 = await img___download_base64(file);
                    const b2 = await img___download_base64(file2);

                    //console.log(file, b1);
                    //console.log(file2, b2);

                    if (b1 && b1.length > 0) {

                        const f1 = _FETCH(___URL, {
                            method: 'POST', headers: { "Content-Type": "application/json" }, body: JSON.stringify({
                                requests: [{
                                    image: { content: b1 },
                                    features: [{ type: 'DOCUMENT_TEXT_DETECTION', maxResults: 1 }]
                                }]
                            })
                        }).then(res => res.json()); //.catch(err_ => { return { ok: false, file: file, message: err_ } });

                        const f2 = _FETCH(___URL, {
                            method: 'POST', headers: { "Content-Type": "application/json" }, body: JSON.stringify({
                                requests: [{
                                    image: { content: b2 },
                                    features: [{ type: 'DOCUMENT_TEXT_DETECTION', maxResults: 1 }]
                                }]
                            })
                        }).then(res => res.json()); //.catch(err_ => { return { ok: false, file: file2, message: err_ } });

                        Promise.all([f1, f2]).then(results_ => ocr___response_json(client, [file, file2], results_));

                    }
                } else {
                    client.json({ ok: false, message: 'Data is null' });
                }
            }
        }
    }
};

//#endregion

const ___MSG = [];
const f___MSG_PUSH = (res, setting, data) => { ___MSG.push({ client: res, setting: setting, data: data }); };
const f___MSG_UPDATE = function () {
    if (___CONNECTED && ___MSG.length > 0) {
        const m = ___MSG.shift();
        ocr___process(m);
        //db___execute(m);
    }
    setTimeout(function () { f___MSG_UPDATE(); }, 1);
};
f___MSG_UPDATE();

const _READ_LINE = require("readline");
const _RL = _READ_LINE.createInterface({ input: process.stdin, output: process.stdout });
_RL.on("line", function (text) {
    switch (text) {
        case 'exit':
            process.exit();
            break;
        case 'cls':
            console.clear();
            break;
        case 'reload':
            console.clear();
            file___loadScript();
            break;
        default:
            break;
    }
});