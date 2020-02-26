﻿function (text) {
    let s = '';
    s = text;
    const scope_ = 'NGAY_SINH';
    //console.log(scope_ + '[0] = ', s);

    let v = 'N/A';
    try {
        if (s && s.length > 0) {
            const sl = s.toLowerCase();
            let t = '';
            let p = 'sinh ngày';
            let k = sl.indexOf(p);
            if (k == -1) {
                p = 'ngày, tháng, năm sinh';
                k = sl.indexOf(p);
            }
            if (k != -1) {
                k = k + p.length;
                t = s.substr(k, s.length).trim();
                //console.log(scope_ + '[1] = ' + t);

                p = '.';
                k = t.indexOf(p);
                if (k != -1) {
                    t = t.substr(0, k).trim();
                    t = t.replace(/:/g, ' ');
                    t = t.replace(/\//g, '-');
                    t = t.trim();
                    //console.log(scope_ + '[2] = ' + t);

                    if (t.split(' ').length < 10) {
                        //success
                        v = t;
                    } else {
                        //do something ...
                    }
                }
            }
        }
    } catch (e) {
        console.log(scope_ + 'ERROR = ', e);
    }
    return v;
}