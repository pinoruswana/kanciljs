class KancilComponent {
    constructor({ target, template, events = {}, state = {}, onRendered, onMounted, onUpdate }) {
        this.targetName = target;
        this.target = document.querySelector(target);
        this.template = template;
        this.events = events;
        this.state = state;
        this.onRendered = onRendered;
        this.onMounted = onMounted;
        this.onUpdate = onUpdate;
        this._hasMounted = false;
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };

        if (typeof this.onUpdate === 'function') {
            this.onUpdate(this.state);
        }

        this.render();
    }

    // render() {
    //     if (!this.target) {
    //         console.warn(`KancilComponent: Target element "${this.targetName}" not found. Skipping render.`);
    //         return;
    //     }
    //     const compiled = this.compileTemplate(this.template, this.state);
    //     this.target.innerHTML = compiled;
    //     this.bindEvents();
    //     this.bindInputs();

    //     if (typeof this.onRendered === 'function') {
    //         this.onRendered();
    //     }

    //     if (!this._hasMounted && typeof this.onMounted === 'function') {
    //         this.onMounted();
    //         this._hasMounted = true;
    //     }
    // }

    render() {
        if (!this.target) {
            console.warn(`KancilComponent: Target element "${this.targetName}" not found. Skipping render.`);
            return;
        }

        const active = document.activeElement;
        const selectionStart = active?.selectionStart;
        const selectionEnd = active?.selectionEnd;
        //const activeAttr = active?.getAttribute?.('@input');
        const activeBind = this.getKancilBoundAttr(active); // ← support semua event!

        const compiled = this.compileTemplate(this.template, this.state);
        this.target.innerHTML = compiled;

        this.bindEvents();
        this.bindInputs();

        if (activeBind) {
            const selector = `[\\@${activeBind.event}="${activeBind.key}"]`;
            const newInput = this.target.querySelector(selector);
            if (newInput) {
                newInput.focus();
                try {
                    newInput.setSelectionRange(selectionStart, selectionEnd);
                } catch (e) {
                    console.warn('Gagal restore kursor:', e);
                }
            }
        }

        if (typeof this.onRendered === 'function') this.onRendered();
        if (!this._hasMounted && typeof this.onMounted === 'function') {
            this.onMounted();
            this._hasMounted = true;
        }
    }

    compileTemplate(template, data) {
        // IF
        template = template.replace(/\{\{#if (.+?)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, condition, content) => {
            return this.evalExpr(condition, data) ? content : '';
        });

        template = template.replace(/\{\{#for (\w+) in (\w+)\}\}([\s\S]*?)\{\{\/for\}\}/g, (_, item, list, content) => {
            const arr = data[list] || [];

            return arr
                .map(val => {
                    return content.replace(/\{\{(.*?)\}\}/g, (_, key) => {
                        try {
                            if (typeof val !== 'object' || val === null) {
                                // Kalau cuma {{todo}}, balikin val
                                return key.trim() === item ? val : '';
                            }
                            // Kalau object, evaluasi ekspresi seperti {{todo.name}}
                            const fn = new Function(item, `return ${key};`);
                            return fn(val);
                        } catch {
                            return '';
                        }
                    });
                })
                .join('');
        });

        // BASIC {{binding}}
        template = template.replace(/\{\{(.*?)\}\}/g, (_, key) => {
            return this.evalExpr(key.trim(), data);
        });

        return template;
    }

    evalExpr(expr, data) {
        try {
            const fn = new Function(...Object.keys(data), `return ${expr}`);
            return fn(...Object.values(data));
        } catch {
            return '';
        }
    }

    bindEvents() {
        for (const [key, handler] of Object.entries(this.events)) {
            const [event, selector] = key.split('@');
            this.target.addEventListener(event, e => {
                const el = e.target.closest(selector);
                if (el) handler.call(this, e, el);
            });
        }
    }

    // bindInputs() { // INI SUDAH OK
    //     const inputs = this.target.querySelectorAll('[\\@input]');
    //     inputs.forEach(input => {
    //         const key = input.getAttribute('@input');
    //         if (key && key in this.state) {
    //             input.value = this.state[key];
    //             input.addEventListener('input', e => {
    //                 this.setState({ [key]: e.target.value });
    //             });
    //         }
    //     });
    // }

    bindInputs() {
        const bindableEvents = ['input', 'change', 'keyup'];

        bindableEvents.forEach(eventName => {
            const selector = `[\\@${eventName}]`;
            const inputs = this.target.querySelectorAll(selector);

            inputs.forEach(input => {
                const key = input.getAttribute(`@${eventName}`);
                if (!key || !(key in this.state)) return;

                const isFocused = document.activeElement === input;

                // // HANYA set value kalau input tidak sedang difokusin
                // if (!isFocused && input.value !== this.state[key]) {
                //     input.value = this.state[key];
                // }

                const sensitive = ['input', 'keyup', 'keydown'];
                if ((!isFocused || !sensitive.includes(eventName)) && input.value !== this.state[key]) {
                    input.value = this.state[key];
                }

                if (key && key in this.state) {
                    input.value = this.state[key];
                    // input.addEventListener('input', e => {
                    //     this.setState({ [key]: e.target.value });
                    // });
                }

                // Jangan pasang listener dua kali
                if (!input._bosaiBound) {
                    input.addEventListener(eventName, e => {
                        const modifyingKeys = [
                            'Backspace',
                            'Delete',
                            'Enter',
                            ' ', // spasi
                            ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)), // A-Z
                            ...Array.from({ length: 10 }, (_, i) => String(i)), // 0-9
                        ];

                        // Jika event-nya keyup, pastikan key-nya memodifikasi input
                        if (eventName === 'keyup') {
                            const key = e.key;
                            if (!modifyingKeys.includes(key) && key.length === 1 && !e.ctrlKey && !e.metaKey) {
                                // Huruf non-latin (misalnya é, â, emoji) juga boleh lanjut
                                if (!/^\p{L}|\p{N}/u.test(key)) return;
                            } else if (key.length > 1) {
                                // Key seperti ArrowLeft, Home, dll: skip
                                return;
                            }
                        }

                        this.setState({ [key]: e.target.value });
                    });
                    input._bosaiBound = true;
                }
            });
        });
    }

    getKancilBoundAttr(el) {
        if (!el?.attributes) return null;

        for (let attr of el.attributes) {
            if (attr.name.startsWith('@')) {
                return {
                    event: attr.name.slice(1), // tanpa "@"
                    key: attr.value,
                };
            }
        }

        return null;
    }
}

//=====================================

function KancilStore(initial, storeKey = 'bosai-store') {
    const saved = localStorage.getItem(storeKey);

    //const state = saved ? JSON.parse(saved) : { ...initial };
    // const state = saved
    //     ? { ...initial, ...JSON.parse(saved) } // ← ini solusinya
    //     : { ...initial };

    // const state = { ...initial }; // ⬅️ SELALU pakai initial
    // if (storeKey) {
    //     // ⬇️ Simpan langsung ke localStorage saat store dibuat
    //     localStorage.setItem(storeKey, JSON.stringify(state));
    // }

    let state;

    // Cek apakah initial kosong/null
    const isEmptyInitial = !initial || (typeof initial === 'object' && Object.keys(initial).length === 0);

    if (storeKey && isEmptyInitial) {
        // Ambil dari localStorage
        const saved = localStorage.getItem(storeKey);
        state = saved ? JSON.parse(saved) : {};
    } else {
        // Pakai initial dari parameter
        state = { ...initial };
        if (storeKey) {
            localStorage.setItem(storeKey, JSON.stringify(state));
        }
    }

    const listeners = {};
    const wildcardListeners = []; // ⬅️ Tambahan

    const save = () => {
        localStorage.setItem(storeKey, JSON.stringify(state));
    };

    return {
        state,

        // set(key, value) {
        //     state[key] = value;
        //     save();
        //     (listeners[key] || []).forEach(fn => fn(value));
        // },
        set(key, value) {
            state[key] = value;
            save();

            (listeners[key] || []).forEach(fn => fn(value));
            wildcardListeners.forEach(fn => fn({ ...state }));
        },

        subscribe(key, callback) {
            if (key === '*') {
                wildcardListeners.push(callback);
            } else {
                if (!listeners[key]) listeners[key] = [];
                listeners[key].push(callback);
            }
        },

        reset() {
            Object.keys(initial).forEach(key => {
                state[key] = initial[key];
                (listeners[key] || []).forEach(fn => fn(state[key]));
            });
            save();
        },

        export() {
            const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${storeKey}.json`;
            a.click();
            URL.revokeObjectURL(url);
        },

        import(jsonData) {
            try {
                const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
                Object.entries(data).forEach(([k, v]) => {
                    state[k] = v;
                    (listeners[k] || []).forEach(fn => fn(v));
                });
                save();
            } catch (e) {
                console.error('Gagal import:', e);
            }
        },
    };
}

//=====================================

function getLoaderStore() {
    if (!window._loaderStore) {
        window._loaderStore = KancilStore({ loading: false }, 'bosai-loader');
    }
    return window._loaderStore;
}
//const loaderStore = KancilStore({ loading: false }, 'bosai-loader');

const loader = getLoaderStore();

const LoaderComponent = new KancilComponent({
    target: '#loader-slot', // container loader
    state: { loading: loader.state.loading },
    template: `
    {{#if loading}}
     <div style="
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background-color: rgba(255,255,255,0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    ">
      <div style="
        width: 48px;
        height: 48px;
        border: 5px solid #ccc;
        border-top-color: #0074D9;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      "></div>
    </div>
    {{/if}}
  `,
});
LoaderComponent.render();

loader.subscribe('loading', val => {
    LoaderComponent.setState({ loading: val });
});

// Cara pakai:
// getLoaderStore().set("loading", true);

//=====================================

function fetchToCache(url, options = {}) {
    const {
        baseUrls = [], // array URL dasar
        force = false,
    } = options;

    const fullUrls = baseUrls.map(base => base.replace(/\/+$/, '') + '/' + url.replace(/^\/+/, ''));
    fullUrls.push(url); // coba juga langsung URL-nya, sebagai opsi terakhir

    let currentIndex = 0;

    function tryFetch() {
        if (currentIndex >= fullUrls.length) {
            return Promise.reject(new Error('Semua percobaan fetch gagal, bos 😢'));
        }

        const currentUrl = fullUrls[currentIndex];
        const key = 'cache_' + btoa(currentUrl);

        if (!force) {
            const existing = localStorage.getItem(key);
            if (existing) {
                const store = KancilStore({}, key);
                return Promise.resolve(store);
            }
        }

        getLoaderStore().set('loading', true);

        return fetch(currentUrl)
            .then(res => {
                if (!res.ok) throw new Error(`Gagal fetch ${currentUrl}`);
                return res.json();
            })
            .then(data => {
                const store = KancilStore({}, key);
                store.import(data);
                return store;
            })
            .catch(err => {
                console.warn(`Percobaan gagal: ${currentUrl}`, err.message);
                currentIndex++;
                return tryFetch(); // Coba URL berikutnya
            });
    }

    return tryFetch().finally(() => {
        getLoaderStore().set('loading', false);
    });
}

//=====================================

function KancilDevTool(target = 'body') {
    const container = document.createElement('div');
    container.style = `
        position: fixed;
        bottom: 0; right: 0;
        background: #222;
        color: #fff;
        font-family: monospace;
        font-size: 14px;
        max-height: 300px;
        overflow: auto;
        z-index: 99999;
        padding: 10px;
        border-top-left-radius: 8px;
        box-shadow: 0 0 10px rgba(0,0,0,0.6);
    `;

    container.innerHTML = `<strong style="color:#0ff">Kancil DevTool</strong><div id="devtool-content"></div>`;

    document.querySelector(target).appendChild(container);

    const content = container.querySelector('#devtool-content');

    function render() {
        content.innerHTML = '';
        const keys = Object.keys(localStorage).filter(k => k.startsWith('cache_') || k.startsWith('bosai-'));

        keys.forEach(k => {
            const raw = localStorage.getItem(k);
            let parsed;
            try {
                parsed = JSON.parse(raw);
            } catch {
                parsed = raw;
            }

            const wrapper = document.createElement('div');
            wrapper.style = 'margin-top:10px; border-top:1px solid #444; padding-top:5px';

            wrapper.innerHTML = `
                <div><span style="color:#0f0">${k}</span></div>
                <textarea style="width:100%;height:80px">${JSON.stringify(parsed, null, 2)}</textarea>
                <button data-key="${k}" style="margin-top:5px">Update</button>
                <button data-key="${k}" data-reset style="margin-left:5px">Reset</button>
            `;
            content.appendChild(wrapper);
        });

        content.querySelectorAll('button[data-key]').forEach(btn => {
            btn.onclick = () => {
                const key = btn.dataset.key;
                const isReset = btn.hasAttribute('data-reset');
                const textarea = btn.parentElement.querySelector('textarea');

                if (isReset) {
                    localStorage.removeItem(key);
                } else {
                    try {
                        const val = JSON.parse(textarea.value);
                        localStorage.setItem(key, JSON.stringify(val));
                    } catch (e) {
                        alert('JSON Invalid: ' + e.message);
                    }
                }
                render();
            };
        });
    }

    render();
}

//=====================================

function KancilApp({ stores = {}, components = [] }) {
    const app = {};
    app.stores = {};

    for (const [name, config] of Object.entries(stores)) {
        const store = KancilStore(config.state || {}, config.key || name);
        app[name] = store;
        app.stores[name] = store;
    }

    components.forEach(comp => {
        // const store = app[comp.store]?.state || {};
        // const instance = new KancilComponent({
        //     ...comp,
        //     state,
        // });
        const storeState = app[comp.store]?.state || {};
        const instance = new KancilComponent({
            ...comp,
            state: storeState,
        });

        instance.render();

        if (comp.store && app[comp.store]) {
            app[comp.store].subscribe('*', s => instance.setState(s));
        }
    });

    return app;
}

//=====================================

export { KancilApp, KancilComponent, KancilStore, KancilDevTool, getLoaderStore, fetchToCache };
