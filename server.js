var fs      = require('fs');
var cheerio = require('cheerio');
var request = require('request');
var uuid    = require('node-uuid');

var urls = [];

request('http://www.reddit.com/r/corgi', function(err, res) {
  if (!err && res.statusCode == 200) {
    var $ = cheerio.load(res.body);
    $('a.title', '#siteTable').each(function() {
      var url = this.attribs.href;

      // only looking at imgur for scrapes
      if (url.indexOf('imgur.com') !== -1) {

        // no .gifv support
        if (url.indexOf('.gifv') !== -1) {
          return;
        }

        // down the rabbit hole into the album
        if (url.indexOf('/a/') !== -1) {
          request(url, function(err, res) {
            if (!err && res.statusCode == 200) {
              var $ = cheerio.load(res.body);
              $('a.zoom', '#inside').each(function() {
                var url = 'http:' + this.attribs.href;
                urls.push(url);
              });
            }
          });
          return;
        }

        // and the gallery..
        if (url.indexOf('gallery') !== -1) {
        //   request(url, function(err, res) {
        //     if (!err && res.statusCode == 200) {
        //       var $ = cheerio.load(res.body);
        //       console.log('here')
        //
        //       // TODO: fix this selector 'div img'
        //       $('div img', '#inside').each(function() {

        //         var url = 'http:' + this.attribs.href;
        //         urls.push(url);
        //       });
        //     }
        //   });
          return;
        }

        // if not .jpg yet, make it so
        if (url.indexOf('.jpg') === -1) {
          url += '.jpg';
        }
        urls.push(url);
      }
    });

    console.log(urls.length + ' corgis found!');
    for (var i = 0; i < urls.length; i++) {
      request(urls[i]).pipe(fs.createWriteStream('img/' + uuid.v4() + '.jpg'));
    }
  }
});
