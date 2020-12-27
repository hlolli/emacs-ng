(() => {
    let global = (1,eval)('this');
    let __weak = [];
    let finalize = global.finalize;
    delete global.finalize;
    let lisp_json = global.lisp_json;
    delete global.lisp_json;

    setInterval(() => {
        const nw = [];
        const args = [];
        __weak.forEach((e) => {
            let x = e.deref();
            if (x) {
                nw.push(e);
                args.push(x);
            }
            finalize.apply(this, args);
        });
        __weak = nw;
    }, 10000);

    global.lisp = new Proxy({}, {
        get: function(o, k) {
            return function() {
                const modargs = [k.replaceAll('-', '_')];
                for (let i = 0; i < arguments.length; ++i) {
                    if (is_proxy(arguments[i])) {
                        modargs.push(arguments[i]);
                    } else {
                        modargs.push(JSON.stringify(arguments[i]));
                    }
                }
                let result = lisp_invoke.apply(this, modargs);
                let retval = null;
                if (is_proxy(result)) {
                    result.json = () => {
                        return JSON.parse(lisp_json(result));
                    };

                    __weak.push(new WeakRef(result));
                    retval = result;
                } else {
                    retval = JSON.parse(result);
                }

                return retval;
            }

        }});
})();
