function (text) {
    let s = '';
    s = text;
    const scope_ = 'HO_TEN';
    //console.log(scope_ + '[0] = ', s);

    let v = 'N/A';
    try {
        if (s && s.length > 0) {
            const sl = s.toLowerCase();
            let t = '';
            let p = 'họ tên';
            let k = sl.indexOf(p);
            let k2 = -1;
            if (k == -1) {
                p = 'họ và tên';
                k = sl.indexOf(p);
            }
            if (k != -1) {
                k = k + p.length;
                t = s.substr(k, s.length).trim();
                t = t.split('\\n').join('^');

                if (t[0] == ':') t = t.substr(1).trim();
                if (t[0] == '^') t = t.substr(1).trim();

                //console.log(scope_ + '[1] = ' + t);
                 
                k = t.indexOf('.');
                k2 = t.indexOf('^');
                //console.log(scope_ + '[2] = ', k, k2);
                if (k != -1 && k2 != -1) k = Math.min(k, k2);
                else if (k == -1 && k2 != -1) k = k2;
                //console.log(scope_ + '[3] k = ', k);

                if (k != -1) {
                    t = t.substr(0, k).trim();

                    t = t.replace(/:/g, ' ');
                    if (t.indexOf('|') != -1) t = t.split('|').join(' ');

                    t = t.trim();
                    //console.log(scope_ + '[OK] = ' + t);

                    if (t.split(' ').length < 5) {
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