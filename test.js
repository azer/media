var media = require("./");
var audio = media.audio;
var video = media.video;

var set1 = ['http://i.cloudup.com/vTka9yOizT.m4a', 'http://i.cloudup.com/4TnDj0v9GE.ogg'];
var set2 = ['http://i.cloudup.com/pwSS7RG3Sp.ogg', 'http://tayfabandista.org/player/maya.mp3'];
var set3 = ['https://dl.dropboxusercontent.com/u/52141482/totoro.mp4', 'https://dl.dropboxusercontent.com/u/52141482/totoro.webm'];

it('plays pop', function(done){
  audio('http://i.cloudup.com/4TnDj0v9GE.ogg').autoplay().on('ended', function () {
    done();
  });
});

it('initializes multiple sources', function(done){
  audio(set1).autoplay().on('ended', function () { done(); });
});

it('plays a song and pauses', function(done){
  var p = audio('http://i.cloudup.com/pwSS7RG3Sp.ogg')
        .autoplay().volume(0.3).on('pause', function (){ done(); });

  setTimeout(p.pause, 1000);
});

it('shows controls and observes time', function(done){
  var p = audio(set2);

  p.play()
    .controls()
    .volume(0.3)
    .on('pause', function(){
      p.remove();
      done();
    })
    .on('timeupdate', function(event){
      if ( p.currentTime() >= 1) {
        p.pause();
      }
    });
});

it('gets and sets src attr', function(done){

  var p = audio(set1).controls().autoplay();

  p.on('play', function(){
    expect(p.src()).to.equal(set2);
    p.remove();
    done();
  });

  setTimeout(function(){
    expect(p.src()).to.equal(set1);
    p.src(set2);
  }, 0);

});

it('removes the element', function(){
  var p = audio();
  p.element().setAttribute('id', 'to-remove');

  expect(document.querySelector('#to-remove')).to.exist;
  p.remove();
  expect(document.querySelector('#to-remove')).to.not.exist;
});

it('plays totoro video', function(done){
  var v = video(set3).controls().autoplay().on('ended', function () {
    done();
  });
});
