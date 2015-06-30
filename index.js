"use strict";
var ELEV_FILE, HEIGHT, NULL_VAL, WIDTH, cache, fs, open, path;

cache = require("cache-helpers").once;
fs    = require("fs");
path  = require("path");

WIDTH     = 7200;
HEIGHT    = 3600;
NULL_VAL  = -999;
ELEV_FILE = path.join(__dirname, "data/elev.bin");

open = cache(function(callback) {
  fs.open(ELEV_FILE, "r", callback);
});

// Returns elevation in meters if it's available, or null otherwise.
exports.at = function(lat, lon, callback) {
  open(function(err, fd) {
    var x, y;

    if(err)
      callback(err);
    
    else {
      x = Math.round((180.0 + lon) * ( WIDTH / 360.0));
      y = Math.round(( 90.0 - lat) * (HEIGHT / 180.0));

      // Wrap and cap
      x = x - Math.floor(x / WIDTH) * WIDTH;
      y = y < 0 ? 0 : (y > HEIGHT - 1 ? HEIGHT - 1 : y);

      fs.read(
        fd,
        new Buffer(2),
        0,
        2,
        (y * WIDTH + x) * 2,
        function(err, bytes, buf) {
          var v;

          if(err)
            callback(err, null);

          else if(bytes !== 2)
            callback(new Error("unable to read elevation"), null);

          else {
            v = buf.readInt16LE(0);
            callback(null, v !== NULL_VAL ? v : null);
          }
        }
      );
    }
  });
};
