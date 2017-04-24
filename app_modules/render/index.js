
module.exports.newlineParse = function(text) {
  function replaceAll (string, search, replacement) {
      var target = string;
      return target.replace(new RegExp(search, 'g'), replacement);
  }

  var content = "<p>" + replaceAll(text, "\n", "</p><p>") + "</p>";
  return content;
}
