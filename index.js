var inputElement = document.getElementById("input");
inputElement.addEventListener("change", handleFiles, false);
function handleFiles() {
  //Get the first file
  var file = this.files[0];
  //Read the content
  new Promise(function(resolve, reject) {
    var reader = new FileReader();
    reader.onload = function(content) {
      resolve(reader.result);
    };
    reader.onerror = reject;
    reader.readAsText(file, "ISO-8859-15");
  }).then(function(fileContent) {
    var result = Papa.parse(fileContent, {
      "delimiter": ";",
      "newLine": "\n",
      header: true
    });
    return result;
  }).then(function(result) {
    return result.data.reduce(function(acc, currentLine) {
      var emplacement = "emplacement usuel";
      //No emplacement, we let the element as is
      if (!currentLine[emplacement]) {
        acc.push(currentLine);
        return acc;
      }
      //Split emplacement
      var emplacement = currentLine[emplacement].split(") + ");
      emplacement.forEach(function(currentEmplacement) {
        if (!currentEmplacement) {
          return;
        }
        var newLine = JSON.parse(JSON.stringify(currentLine));
        newLine.emplacement = currentEmplacement;
        acc.push(newLine);
      });
      return acc;
    }, []);
  }).then(function(splittedList) {
    return splittedList.reduce(function(acc, currentLine) {
      var splitExp = /(FRAC-R\d*)-*([\d\w-]*)[ \(]*([^\/]*)\/*(.*)/;
      if (!currentLine.emplacement) {
        acc.push(currentLine);
        return acc;
      }
      //Split emplacement
      var result = splitExp.exec(currentLine.emplacement);
      if (result === null) {
        acc.push(currentLine);
        return acc;
      }
      currentLine.reserve = result[1] || "";
      currentLine.loc = result[2] || "";
      currentLine.priorite = result[3] || "";
      currentLine.conditionnement = result[4] || "";
      acc.push(currentLine);
      return acc;
    }, []);
  }).then(function(finalList) {
    var asHTML = finalList.reduce(function(acc, currentLine) {
      return acc +
      "\n"+
      "<tr>"+
        "<td>"+(currentLine["Auteur(s)"] || "")+"</td>"+
        "<td>"+(currentLine["Titre"] || "")+"</td>"+
        "<td>"+(currentLine["Date"] || "")+"</td>"+
        "<td>"+(currentLine["n° inv."] || "")+"</td>"+
        "<td>"+(currentLine["priorite"] || "")+"</td>"+
        "<td>"+(currentLine["reserve"] || "")+"</td>"+
        "<td>"+(currentLine["loc"] || "")+"</td>"+
        "<td>"+(currentLine["conditionnement"] || "")+"</td>"+
        //"<td>"+(currentLine["emplacement usuel"] || "")+"</td>"+
        //"<td class=\"noPrint\">"+(currentLine["loc actu"] || "")+"</td>"+
        "<td>"+(currentLine["statut dépôt actuel"] || "")+"</td>"+
        "<td>☐</td>"+
      "</tr>"
      ;
    }, "<tbody>");
    asHTML += "</tbody>";
    document.getElementById('tableData').innerHTML = asHTML;
  }).catch(function(error) {
    alert(JSON.stringify(error));
  });
}
