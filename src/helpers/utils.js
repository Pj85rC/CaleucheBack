function generateRandomString() {
    var length = Math.floor(Math.random() * (15 - 4 + 1)) + 4;  
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var result = '';
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }
  
module.exports = generateRandomString;
