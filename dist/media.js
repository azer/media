;(function(process){  require.m = { 0:[function(require,module,exports){ window.media = require('./');
 },{"./":9}],9:[function(require,module,exports){ module.exports = require('./lib/player');
module.exports.audio = media('audio');
module.exports.video = media('video');

function media (kind) {
  return function (urls, dom) {
    return module.exports(kind, urls, dom);
  };
}
 },{"./lib/player":10}],10:[function(require,module,exports){ var newChain  = require('new-chain'),
    src = require('./src'),
    render = require('./render');

module.exports = play;

function play(media, urls, dom){
  var el, chain, url;

  dom || ( dom = document.documentElement );
  el = render(media);
  dom.appendChild(el);

  chain = newChain({
    autoplay: bool('autoplay'),
    controls: bool('controls'),
    load: method('load'),
    loop: bool('loop'),
    muted: bool('muted'),
    on: on,
    pause: method('pause'),
    play: method('play'),
    preload: bool('preload')
  });

  chain.currentTime = attr('currentTime');
  chain.element = element;
  chain.src = src.attr(el);
  chain.volume = attr('volume');
  chain.remove = remove;

  chain.src(urls);

  return chain;

  function attr(name){
    return function(value){
      if ( arguments.length ) {
        el[name] = value;
        return chain;
      }

      return el[name];
    };
  }

  function bool(name){
    return function(value){
      if (value === false) {
        return el[name] = false;
      }

      return el[name] = true;
    };
  }

  function element(){
    return el;
  }

  function on(event, callback){
    el.addEventListener(event, callback, false);
  }

  function method(name){
    return function(){
      return el[name].apply(el, arguments);
    };
  }

  function remove(){
    return el.parentNode.removeChild(el);
  }

}
 },{"./src":11,"./render":13,"new-chain":16}],11:[function(require,module,exports){ var mimeOf = require("./mime");

module.exports = {
  attr: attr,
  pick: pick
};

function attr(el){
  var value;

  return function(urls){
    if (arguments.length) {
      value = urls;
      el.setAttribute('src', pick(el, value));
    }

    return value;
  };
}

function pick(el, urls){
  if(!urls) return;

  if(typeof urls == 'string'){
    return urls;
  }

  return urls.filter(function(url){
    return !!el.canPlayType(mimeOf(url));
  })[0];
}
 },{"./mime":12}],13:[function(require,module,exports){ var domify = require('domify'),
    templates = require("./templates");

module.exports = render;

function render(media){
  return domify(templates[media + '.html']);
}
 },{"./templates":14,"domify":15}],14:[function(require,module,exports){ exports["audio.html"] = "<audio preload=\"auto\" /></audio>"
exports["video.html"] = "<video preload=\"auto\" /></video>" },{}],12:[function(require,module,exports){ var table = {
  aif  : "audio/x-aiff",
  aiff : "audio/x-aiff",
  wav  : "audio/x-wav",
  mp3  : 'audio/mpeg',
  m3u  : "audio/x-mpegurl",
  mid  : "audio/midi",
  midi : "audio/midi",
  m4a  : 'audio/m4a',
  ogg  : 'audio/ogg',
  mp4  : 'video/mp4',
  ogv  : 'video/mp4',
  webm : 'video/webm',
  mkv  : 'video/x-matroska',
  mpg  : 'video/mpeg'
};

module.exports = mimeOf;

function mimeOf(url){
  return table[ url.split('.').slice(-1)[0] ];
}
 },{}],16:[function(require,module,exports){ module.exports = newChain;
module.exports.from = from;

function from(chain){

  return function(){
    var m, i;

    m = methods.apply(undefined, arguments);
    i   = m.length;

    while ( i -- ) {
      chain[ m[i].name ] = m[i].fn;
    }

    m.forEach(function(method){
      chain[ method.name ] = function(){
        method.fn.apply(this, arguments);
        return chain;
      };
    });

    return chain;
  };

}

function methods(){
  var all, el, i, len, result, key;

  all    = Array.prototype.slice.call(arguments);
  result = [];
  i      = all.length;

  while ( i -- ) {
    el = all[i];

    if ( typeof el == 'function' ) {
      result.push({ name: el.name, fn: el });
      continue;
    }

    if ( typeof el != 'object' ) continue;

    for ( key in el ) {
      result.push({ name: key, fn: el[key] });
    }
  }

  return result;
}

function newChain(){
  return from({}).apply(undefined, arguments);
}
 },{}],15:[function(require,module,exports){ 
/**
 * Expose `parse`.
 */

module.exports = parse;

/**
 * Wrap map from jquery.
 */

var map = {
  option: [1, '<select multiple="multiple">', '</select>'],
  optgroup: [1, '<select multiple="multiple">', '</select>'],
  legend: [1, '<fieldset>', '</fieldset>'],
  thead: [1, '<table>', '</table>'],
  tbody: [1, '<table>', '</table>'],
  tfoot: [1, '<table>', '</table>'],
  colgroup: [1, '<table>', '</table>'],
  caption: [1, '<table>', '</table>'],
  tr: [2, '<table><tbody>', '</tbody></table>'],
  td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
  th: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
  _default: [0, '', '']
};

/**
 * Parse `html` and return the children.
 *
 * @param {String} html
 * @return {Array}
 * @api private
 */

function parse(html) {
  if ('string' != typeof html) throw new TypeError('String expected');

  // tag name
  var m = /<([\w:]+)/.exec(html);
  if (!m) throw new Error('No elements were generated.');
  var tag = m[1];

  // body support
  if (tag == 'body') {
    var el = document.createElement('html');
    el.innerHTML = html;
    return el.removeChild(el.lastChild);
  }

  // wrap map
  var wrap = map[tag] || map._default;
  var depth = wrap[0];
  var prefix = wrap[1];
  var suffix = wrap[2];
  var el = document.createElement('div');
  el.innerHTML = prefix + html + suffix;
  while (depth--) el = el.lastChild;

  var els = el.children;
  if (1 == els.length) {
    return el.removeChild(els[0]);
  }

  var fragment = document.createDocumentFragment();
  while (els.length) {
    fragment.appendChild(el.removeChild(els[0]));
  }

  return fragment;
}
 },{}] }; function require(o){ if(o[2]) return o[2].exports; o[0](function(u){ if(!require.m[o[1][u]]) { throw new Error('Cannot find module "' + u + '"'); } return require(require.m[o[1][u]]); }, o[2] = { exports: {} }, o[2].exports); return o[2].exports; };  return require(require.m[0]); }({ env:{} }));