function createTimer(ticketnumber, duration, element) {
    var timer = duration, minutes, seconds;
    setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        element.textContent = ticketnumber + ":: " + minutes + ":" + seconds;

        if (--timer < 0) {
            timer = duration;
        }
    }, 1000);
}

function writeTable(count) {
    table = document.querySelector('#tableprint');
    var myTable="<table border='1'><tr><td style='width: 100px; color: red;'>TICKET NUMBER</td>";
    myTable+= "<td style='width: 100px; color: red; text-align: right;'>SLA TIME</td>";
    myTable+="</tr>";

    for (i = 0; i < count; i++) {
        myTable+="<tr>";
        myTable+="<td style='width: 100px;'><span id='number";
        myTable+=i;
        myTable+="'></span></td>";
        myTable+="<td style='width: 100px;'><span id='time";
        myTable+=i;
        myTable+="'></span></td>";
        myTable+="</tr>";
    }

    myTable+="</table>";

    table.innerHTML = myTable;
}

function readCount() {
    testc = document.getElementById('testlinecount');
    testc.innerText = window.location.href;

    file=window.location.href;
    file=file.substr(0, file.lastIndexOf("/"));
    file+="/";
    file+="SLAtimes";

    testc.innerText+=" ";
    testc.innerText+=file;

    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);

    testc.innerText=rawFile.responseText;

    rawFile.onreadystatechange = function ()
    {
//        if(rawFile.readyState === 4)
//        {
            testc.innerText="this far at least!";
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                testc.innerText = allText;
            }
//        }
    }
}

window.onload = function () {
    writeTable(3);
    readCount();
};
