/* Glyph marks. Hand-made annotations drawn in real pixels (no SVG filters, so edges stay crisp).
   Plays when the word scrolls into view and on hover. Reduced motion: finished state, no animation. */
;(function () {
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches
  var NS = 'http://www.w3.org/2000/svg',
    TAU = Math.PI * 2
  function rng(s) {
    return function () {
      s |= 0
      s = (s + 0x6d2b79f5) | 0
      var t = Math.imul(s ^ (s >>> 15), 1 | s)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  }
  function noise(r) {
    var k = []
    for (var i = 0; i < 4; i++)
      k.push({ f: 1.2 + i * 1.6 + r() * 0.8, p: r() * TAU, a: 1 / (i + 1) })
    return function (u) {
      var s = 0
      k.forEach(function (q) {
        s += Math.sin(u * q.f * TAU + q.p) * q.a
      })
      return s / 2
    }
  }
  function P(a) {
    return (
      'M' +
      a
        .map(function (p) {
          return p[0].toFixed(1) + ' ' + p[1].toFixed(1)
        })
        .join('L')
    )
  }
  function line(x0, y0, x1, y1, n, j, N) {
    var o = [],
      i
    for (i = 0; i <= n; i++) {
      var u = i / n
      o.push([x0 + (x1 - x0) * u + N(u * 2) * j, y0 + (y1 - y0) * u + N(u * 2 + 5) * j])
    }
    return o
  }

  /* Where the type actually sits in the word's own box, so a mark lands on the
     letters at any size. y = 0 is the top of the box, the baseline is mt.base. */
  function metrics(el) {
    var cs = getComputedStyle(el),
      fs = parseFloat(cs.fontSize),
      lh = parseFloat(cs.lineHeight)
    if (!lh || isNaN(lh)) lh = fs * 1.2
    var c = document.createElement('canvas'),
      g = c.getContext('2d')
    g.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + fs + 'px ' + cs.fontFamily
    var m = g.measureText(el.textContent.trim()),
      fa = m.fontBoundingBoxAscent || m.actualBoundingBoxAscent,
      fd = m.fontBoundingBoxDescent || m.actualBoundingBoxDescent
    return {
      w: el.offsetWidth,
      h: el.offsetHeight,
      fs: fs,
      base: (lh - (fa + fd)) / 2 + fa,
      asc: m.actualBoundingBoxAscent,
      desc: m.actualBoundingBoxDescent,
      xh: g.measureText('x').actualBoundingBoxAscent,
    }
  }

  /* Each builder returns paths: d, w (stroke width), c (colour var), o (opacity), delay, dur. */
  var M = {
    /* Highlighter swipe across the x-height. A wide flat pass lays the colour
       down, then three short passes pool extra ink where a real pen pauses
       at the start, the middle and the lift-off. Flat (butt) ends, ragged
       edges, and the whole band rises slightly to the right. */
    marker: function (mt, r, N) {
      var w = mt.w,
        fs = mt.fs,
        top = mt.base - mt.xh * 1.02,
        bot = mt.base + Math.max(mt.desc * 0.85, fs * 0.05),
        band = bot - top,
        rise = band * 0.1
      function swipe(x0, x1, off, j, o, wgt, delay, dur) {
        return {
          d: P(line(x0, top + band * off, x1, top + band * off - rise, 18, j, N)),
          w: wgt,
          c: '--m-marker',
          o: o,
          delay: delay,
          dur: dur,
        }
      }
      return {
        cls: 'gm-marker',
        paths: [
          swipe(-0.04 * fs, w + 0.04 * fs, 0.46, fs * 0.055, 0.3, band * 0.86, 0, 620),
          swipe(-0.02 * fs, w * 0.42, 0.6, fs * 0.05, 0.18, band * 0.5, 90, 520),
          swipe(w * 0.34, w + 0.02 * fs, 0.36, fs * 0.05, 0.18, band * 0.46, 170, 520),
        ],
      }
    },
    circle: function (mt, r, N) {
      var w = mt.w,
        fs = mt.fs,
        top = mt.base - mt.asc,
        bot = mt.base + mt.desc,
        cx = w / 2,
        cy = (top + bot) / 2,
        rx = w / 2 + 0.15 * fs,
        ry = (bot - top) / 2 + 0.15 * fs
      function pass(a0, sw, sc, ph) {
        var o = [],
          n = 90
        for (var i = 0; i <= n; i++) {
          var u = i / n,
            ang = a0 + u * sw,
            k = sc * (1 + 0.03 * N(u * 3 + ph) - 0.06 * u)
          o.push([cx + rx * k * Math.cos(ang), cy + ry * k * Math.sin(ang)])
        }
        return P(o)
      }
      return {
        paths: [
          {
            d: pass(-2.3, TAU * 1.08, 1, 0),
            w: Math.max(1.8, 0.03 * fs),
            c: '--m-violet',
            o: 1,
            delay: 80,
            dur: 950,
          },
          {
            d: pass(-2.1, TAU * 0.9, 1.04, 4),
            w: Math.max(1.2, 0.02 * fs),
            c: '--m-violet',
            o: 0.55,
            delay: 480,
            dur: 800,
          },
        ],
      }
    },
    underline: function (mt, r, N) {
      var w = mt.w,
        fs = mt.fs,
        y = mt.base + Math.max(mt.desc + fs * 0.12, fs * 0.19)
      return {
        paths: [
          {
            d: P(line(-0.05 * fs, y, w + 0.08 * fs, y - 0.05 * fs, 22, fs * 0.012, N)),
            w: Math.max(2, 0.042 * fs),
            c: '--m-underline',
            o: 1,
            delay: 0,
            dur: 700,
          },
          {
            d: P(line(0.1 * w, y + 0.09 * fs, 0.82 * w, y + 0.06 * fs, 18, fs * 0.01, N)),
            w: Math.max(1.4, 0.026 * fs),
            c: '--m-underline',
            o: 0.55,
            delay: 420,
            dur: 450,
          },
        ],
      }
    },
    squiggle: function (mt, r, N) {
      var w = mt.w,
        fs = mt.fs,
        y = mt.base + Math.max(mt.desc + fs * 0.05, fs * 0.14),
        L = 0.4 * fs,
        n = Math.max(8, Math.round((w / L) * 8)),
        o = []
      for (var i = 0; i <= n; i++) {
        var u = i / n,
          x = -0.02 * fs + u * (w + 0.04 * fs)
        o.push([x, y + Math.sin((x / L) * TAU) * 0.055 * fs * (1 + 0.35 * N(u * 3))])
      }
      return {
        paths: [
          {
            d: P(o),
            w: Math.max(1.8, 0.035 * fs),
            c: '--m-violet',
            o: 1,
            delay: 0,
            dur: 900,
          },
        ],
      }
    },
    brackets: function (mt, r, N) {
      var w = mt.w,
        fs = mt.fs,
        t = mt.base - mt.asc - fs * 0.1,
        b = mt.base + Math.max(mt.desc, fs * 0.05) + fs * 0.08,
        e = 0.16 * fs,
        g = 0.16 * fs,
        j = 0.012 * fs
      function br(x, dir, delay) {
        var pts = line(x + dir * e, t, x, t, 3, j, N)
          .concat(line(x, t, x, b, 8, j, N).slice(1))
          .concat(line(x, b, x + dir * e, b, 3, j, N).slice(1))
        return {
          d: P(pts),
          w: Math.max(1.8, 0.034 * fs),
          c: '--m-ink',
          o: 0.85,
          delay: delay,
          dur: 520,
        }
      }
      return { paths: [br(-g, 1, 0), br(w + g, -1, 220)] }
    },
    star: function (mt, r, N) {
      var w = mt.w,
        fs = mt.fs,
        cx = w + 0.12 * fs,
        cy = mt.base - mt.asc + 0.14 * fs,
        rad = 0.21 * fs,
        out = []
      ;[-90, -30, 30].forEach(function (deg, i) {
        var a = (deg * Math.PI) / 180 + (r() - 0.5) * 0.18,
          dx = Math.cos(a) * rad,
          dy = Math.sin(a) * rad
        out.push({
          d: P(line(cx - dx, cy - dy, cx + dx, cy + dy, 2, 0.008 * fs, N)),
          w: Math.max(1.8, 0.036 * fs),
          c: '--m-apricot',
          o: 1,
          delay: i * 150,
          dur: 260,
        })
      })
      return { paths: out }
    },
  }

  function build(el) {
    var type = el.dataset.mark
    if (el._m || !M[type]) return
    /* auto   — draws on when it scrolls into view (and again on hover)
       manual — stays hidden until the page calls GlyphMarks.play(el)
       static — drawn once, never animated */
    var mode = el.dataset.markPlay || 'auto'
    var t = document.createElement('span')
    t.textContent = el.textContent
    el.textContent = ''
    el.appendChild(t)
    var svg = document.createElementNS(NS, 'svg'),
      g = document.createElementNS(NS, 'g')
    svg.setAttribute('aria-hidden', 'true')
    svg.appendChild(g)
    var seed = 7
    ;(type + el.textContent).split('').forEach(function (c) {
      seed = (seed * 31 + c.charCodeAt(0)) | 0
    })
    var els = [],
      spec
    function layout() {
      var mt = metrics(el),
        w = mt.w,
        h = mt.h,
        fs = mt.fs,
        pad = fs * 0.8,
        r = rng(seed),
        N = noise(r)
      spec = M[type](mt, r, N)
      svg.setAttribute('class', 'gm' + (spec.cls ? ' ' + spec.cls : ''))
      svg.setAttribute('viewBox', '0 0 ' + (w + 2 * pad) + ' ' + (h + 2 * pad))
      svg.style.cssText =
        'left:' +
        -pad +
        'px;top:' +
        -pad +
        'px;width:' +
        (w + 2 * pad) +
        'px;height:' +
        (h + 2 * pad) +
        'px'
      g.setAttribute('transform', 'translate(' + pad + ' ' + pad + ')')
      spec.paths.forEach(function (s, i) {
        var p = els[i]
        if (!p) {
          p = els[i] = document.createElementNS(NS, 'path')
          p.setAttribute('pathLength', '1')
          // Hold the stroke hidden until it is played, so the mark does not
          // flash fully drawn for a frame before the draw-on runs.
          if (!RM && mode !== 'static') p.style.strokeDashoffset = '1.05'
          g.appendChild(p)
        }
        p.setAttribute('d', s.d)
        p.style.strokeWidth = s.w + 'px'
        p.style.stroke = 'var(' + s.c + ')'
        p.style.opacity = s.o
      })
    }
    el.appendChild(svg)
    layout()
    if (window.ResizeObserver) new ResizeObserver(layout).observe(el)
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout)
    function go() {
      if (RM || el._busy) return
      el._busy = true
      var end = 0
      spec.paths.forEach(function (s, i) {
        end = Math.max(end, s.delay + s.dur)
        els[i].animate([{ strokeDashoffset: 1.05 }, { strokeDashoffset: 0 }], {
          duration: s.dur,
          delay: s.delay,
          easing: 'cubic-bezier(.45,0,.25,1)',
          fill: 'both',
        })
      })
      setTimeout(function () {
        el._busy = false
      }, end + 50)
    }
    el._m = true
    el._play = go
    if (mode === 'static') return
    el.addEventListener('mouseenter', go)
    if (mode === 'manual') return
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(
        function (es) {
          es.forEach(function (e) {
            if (e.isIntersecting) {
              go()
              io.disconnect()
            }
          })
        },
        { threshold: 0.9 },
      )
      io.observe(el)
    }
  }
  window.GlyphMarks = {
    init: function (root) {
      ;(root || document).querySelectorAll('[data-mark]').forEach(build)
    },
    play: function (el) {
      if (el._play) el._play()
    },
  }
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', function () {
      GlyphMarks.init()
    })
  else GlyphMarks.init()
})()
