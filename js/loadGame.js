function loadGame() {
  var inputFile = document.getElementById("input").files[0];
  var reader = new FileReader();
  reader.onload = function(e) {
    var mapStr = reader.result;
    runGame(mapStr);
  }
  reader.readAsText(inputFile)
}
