var fs    = require("fs")

var WIDTH     = 7200,
    HEIGHT    = 3600,
    NULL_VAL  = -999,
    ELEV_FILE = __dirname+'/data/elev.bin'

// Returns elevation in meters if it's available, or null otherwise.
exports.at = function(lat, lon, callback) {
  fs.open(ELEV_FILE, "r", function(err, fd) {
    if(err)
      callback(err)
    
    else {
      var x = Math.round((180.0 + lon) * WIDTH / 360.0),
          y = Math.round((90.0 - lat) * HEIGHT / 180.0)

      // Wrap and cap
      x = x - Math.floor(x / WIDTH) * WIDTH
      y = y < 0 ? 0 : (y > HEIGHT - 1 ? HEIGHT - 1 : y)

      fs.read(
        fd,
        new Buffer(2),
        0,
        2,
        (y * WIDTH + x) * 2,
        function(err1, bytes, buf) {
          fs.close(fd, function(err2) {
            if(err1 || err2)
              callback(err1 || err2, null)

            else if(bytes !== 2)
              callback(new Error("unable to read elevation"), null)

            else {
              var v = buf.readInt16LE(0)

              callback(null, v !== NULL_VAL ? v : null)
            }
          })
        }
      )
    }
  })
}
