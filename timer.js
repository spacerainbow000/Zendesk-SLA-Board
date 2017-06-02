var ticketCount = {};

function createTimer(duration, element) {

    var timer = duration, minutes, seconds;
        var sec_num = parseInt(duration, 10);
    hours   = Math.floor(sec_num / 3600);
    minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    seconds = sec_num - (hours * 3600) - (minutes * 60);

    element.textContent = hours + ":" + minutes + ":" + seconds;

    setInterval(function () {
                sec_num -= 1;
                if (sec_num <= 0)
                        element.textContent = "BREACHED!!!"
                else
                {
                        hours   = Math.floor(sec_num / 3600);
                        minutes = Math.floor((sec_num - (hours * 3600)) / 60);
                        seconds = sec_num - (hours * 3600) - (minutes * 60);
                        element.textContent = hours + ":" + minutes + ":" + seconds;
                }
    }, 1000);
}

function writeTable(count) {
    table = document.querySelector('#tableprint');
    var myTable="<table border='1'><tr><td style='margin: 0px; color: red;'>TICKET NUMBER</td>";
    myTable+= "<td style='margin: 0px; color: red; text-align: center;'>SLA TIME</td>";
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
    data=$('#SLAtimes').contents().text().split(" ").length - 1;
    return data;
}

function reloadIFrame() {
    document.getElementById("SLAtimes").src="SLAtimes.html";
}

function populateTable() {
    data=$('#SLAtimes').contents().text().split(/ |Z/);
    table=document.getElementById("tablePrint");

    for (i = 0; i < ticketCount.count; i++)
    {
        num="number" + i;
        time="time" + i;
        document.getElementById(num).innerHTML = data[i * 2];
        createTimer(formatDate(data[(i * 2) + 1]), document.getElementById(time));
    }
}

function formatDate(time) {
        utime=Date.parse(time)/1000;
        ctime= + Date;
        ctime=Math.round((new Date()).getTime() / 1000);
        time=utime-ctime;
        time=time-25200; //HARDCODED TIMESHIFT FOR PDT
        return time;
}

function fullReload() {
    reloadIFrame();
    ticketCount.count=readCount();
    writeTable(ticketCount.count);
        populateTable();
}

window.onload = function () {
    fullReload();
    window.setInterval("fullReload()", 180000);
};
