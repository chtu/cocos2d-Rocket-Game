/*
This is the callback function for the event of choosing a file.
When the file is chosen, it will read the maze from the text file
and automatically start the game.
*/

function loadGame() {
  var inputFile = document.getElementById("input").files[0];
  var reader = new FileReader();
  reader.onload = function(e) {
    var mazeStr = reader.result;
    runGame(mazeStr);
  }
  reader.readAsText(inputFile)
}
