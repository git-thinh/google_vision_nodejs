function (text) {
    let s = '';
    s = text;
    const scope_ = 'THUONG_TRU';
    //console.log(scope_ + '[0] = ', s);

    let v = 'N/A';
    try {
        if (s && s.length > 0) {
            const sl = s.toLowerCase();
            let t = '';
            let p = 'thường trú';
            let k = sl.indexOf(p);
            let k2 = -1;
            if (k == -1) {
                p = 'nơi đkhk';
                k = sl.indexOf(p);
            }
            if (k != -1) {
                k = k + p.length;
                t = s.substr(k, s.length).trim();
                t = t.split('\\n').join('^');
                //console.log(scope_ + '[1] = ' + t);

                k = t.indexOf('.');
                k2 = t.indexOf('Có giá trị đến');
                //console.log(scope_ + '[2] = ', k, k2);
                if (k != -1 && k2 != -1) k = Math.max(k, k2);
                else if (k == -1 && k2 != -1) k = k2;
                //console.log(scope_ + '[3] k = ', k);

                if (k != -1) {
                    t = t.substr(0, k).trim();
                    t = t.replace(/:/g, ' ');
                    t = t.replace(/\^/g, ' ');
                    t = t.trim();
                    //console.log(scope_ + '[OK] = ' + t);

                    if (t.split(' ').length < 12) {
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