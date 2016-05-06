var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var urls = [];

request('http://www.reddit.com/r/corgi', function(err, res) {
  if (!err && res.statusCode == 200) {
    var $ = cheerio.load(res.body);
    $('a.title', '#siteTable').each(function() {
      var url = this.attribs.href;
      if (url.indexOf('imgur.com') !== -1) {
        if (url.indexOf('.gifv') !== -1 || url.indexOf('gallery') !== -1) {
          return;
        }

        if (url.indexOf('.jpg') === -1) {
          url += '.jpg';
        }
        urls.push(url);
      }
    });
    console.log(urls.length + ' corgis found!');
    for (var i = 0; i < urls.length; i++) {
      request(urls[i]).pipe(fs.createWriteStream('img/' + i + '.jpg'));
    }
  }
});
