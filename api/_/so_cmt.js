function (text) {
    let s = '';
    s = text;
    const scope_ = 'SO_CMT';
    // console.log(scope_ + '[0] = ', s);

    let v = 'N/A';
    try {
        if (s && s.length > 0) {
            const sl = s.toLowerCase();
            let t = '';

            let k = sl.indexOf('họ tên');
            if (k == -1) k = sl.indexOf('họ và tên');

            if (k != -1) {
                t = s.substr(0, k).trim();
                //console.log(scope_ + '[1] = ' + t);

                t = t.replace(/[^0-9]/g, ' ').trim();
                //console.log(scope_ + '[2] = ' + t);

                if (t.indexOf(' ') == -1 && t.length < 15) {
                    // success
                    v = t;
                } else {

                }
            }
        }
    } catch (e) {
        console.log(scope_ + 'ERROR = ', e);
    }
    return v;
}