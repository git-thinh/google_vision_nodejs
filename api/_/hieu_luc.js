function (text) {
    let s = '';
    s = text;
    const scope_ = 'HIEU_LUC';
    //console.log(scope_ + '[0] = ', s);

    let v = 'N/A';
    try {
        if (s && s.length > 0) {
            const sl = s.toLowerCase();
            let t = '';
            let p = 'giá trị đến';
            let k = sl.indexOf(p);
            if (k != -1) {
                k = k + p.length;
                t = s.substr(k, s.length).trim();
                //console.log(scope_ + '[1] = ' + t);

                t = t.replace(/[^0-9]/g, ' ').trim();
                //console.log(scope_ + '[2] = ' + t);

                t = t.substr(0, 10).replace(/\s/g, '-');
                //console.log(scope_ + '[3] = ' + t);

                //success
                v = t;

                //k = t.indexOf('.');
                //if (k == -1) k = t.indexOf('\n');
                //if (k != -1) {
                //    t = t.substr(0, k).trim();
                //    t = t.replace(/:/g, ' ');
                //    t = t.replace(/\//g, '-');
                //    t = t.trim();
                //    console.log(scope_ + '[2] = ' + t);

                //    if (t.split(' ').length < 10) {
                //        //success
                //        v = t;
                //    } else {
                //        //do something ...
                //    }
                //}
            }
        }
    } catch (e) {
        console.log(scope_ + 'ERROR = ', e);
    }
    return v;
}