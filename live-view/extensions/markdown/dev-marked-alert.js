(function(i, n) {
  typeof exports == "object" && typeof module < "u" ? module.exports = n() : typeof define == "function" && define.amd ? define(n) : (i = typeof globalThis < "u" ? globalThis : i || self, i.markedAlert = n())
})(this, function() {
  "use strict";
  const i = [{
    type: "note",
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M11 7H13V9H11V7ZM11 11H13V17H11V11ZM12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"></path> </svg>'
  }, {
    type: "tip",
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M9 21C9 21.55 9.45 22 10 22H14C14.55 22 15 21.55 15 21V20H9V21ZM12 2C8.14 2 5 5.14 5 9C5 11.38 6.19 13.47 8 14.74V17C8 17.55 8.45 18 9 18H15C15.55 18 16 17.55 16 17V14.74C17.81 13.47 19 11.38 19 9C19 5.14 15.86 2 12 2ZM14.85 13.1L14 13.7V16H10V13.7L9.15 13.1C7.8 12.16 7 10.63 7 9C7 6.24 9.24 4 12 4C14.76 4 17 6.24 17 9C17 10.63 16.2 12.16 14.85 13.1Z" fill="currentColor"></path> </svg>'
  }, {
    type: "important",
    icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="none"><path d="M10.01 21.01c0 1.1.89 1.99 1.99 1.99s1.99-.89 1.99-1.99h-3.98zM12 6c2.76 0 5 2.24 5 5v7H7v-7c0-2.76 2.24-5 5-5zm0-4.5c-.83 0-1.5.67-1.5 1.5v1.17C7.36 4.85 5 7.65 5 11v6l-2 2v1h18v-1l-2-2v-6c0-3.35-2.36-6.15-5.5-6.83V3c0-.83-.67-1.5-1.5-1.5zM11 8h2v4h-2zm0 6h2v2h-2z" fill="currentColor"/></svg>'
  }, {
    type: "warning",
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M11 18V16H13V18H11Z" fill="currentColor"></path> <path d="M11 10H13V14H11V10Z" fill="currentColor"></path> <path fill-rule="evenodd" clip-rule="evenodd" d="M21.26 21C22.03 21 22.51 20.17 22.13 19.5L12.86 3.5C12.4809 2.84872 11.5632 2.83052 11.1632 3.44539L1.80868 19.6032C1.5295 20.2522 1.9991 21 2.73 21H21.26ZM19.53 19L12 5.99L4.47 19H19.53Z" fill="currentColor"></path> </svg>'
  }, {
    type: "caution",
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M11 15H13V17H11V15ZM11 7H13V13H11V7ZM11.99 2C6.47 2 2 6.48 2 12C2 17.52 6.47 22 11.99 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 11.99 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20Z" fill="currentColor"></path> </svg>'
  }];

  function n(a) {
    return a.length ? Object.values([...i, ...a].reduce((s, c) => (s[c.type] = c, s), {})) : i
  }

  function d(a) {
    return `^(?:\\[!${a.toUpperCase()}])\\s*?
*`
  }

  function g(a) {
    return a.slice(0, 1).toUpperCase() + a.slice(1).toLowerCase()
  }

  function m(a = {}) {
    const {
      className: s = "markdown-alert",
      variants: c = []
    } = a, w = n(c);
    return {
      walkTokens(e) {
        var t, v, u, f;
        if (e.type !== "blockquote") return;
        const o = w.find(({
          type: r
        }) => new RegExp(d(r)).test(e.text));
        if (o) {
          const {
            type: r,
            icon: Z,
            title: x = g(r),
            titleClassName: y = `${s}-title`
          } = o, h = new RegExp(d(r));
          Object.assign(e, {
            type: "alert",
            meta: {
              className: s,
              variant: r,
              icon: Z,
              title: x,
              titleClassName: y
            }
          });
          const l = (t = e.tokens) == null ? void 0 : t[0];
          if ((v = l.raw) == null ? void 0 : v.replace(h, "").trim()) {
            const p = l.tokens[0];
            Object.assign(p, {
              raw: p.raw.replace(h, ""),
              text: p.text.replace(h, "")
            }), ((u = l.tokens[1]) == null ? void 0 : u.type) === "br" && l.tokens.splice(1, 1)
          } else(f = e.tokens) == null || f.shift()
        }
      },
      extensions: [{
        name: "alert",
        level: "block",
        renderer({
          meta: e,
          tokens: o = []
        }) {
          let t = `<div class="${e.className} ${e.className}-${e.variant}">
`;
          return t += `<p class="${e.titleClassName}">`, t += e.icon, t += e.title, t += `</p>
`, t += this.parser.parse(o), t += `</div>
`, t
        }
      }]
    }
  }
  return m
});
