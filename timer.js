var ticketCount = {};

function createTimer(duration, row_index) {

    var timer = duration, minutes, seconds;
    var sec_num = parseInt(duration, 10);
    hours   = Math.floor(sec_num / 3600);
    minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    seconds = sec_num - (hours * 3600) - (minutes * 60);

    hours   = (hours < 10) ? ("0" + hours) : hours;
    minutes = (minutes < 10) ? ("0" + minutes) : minutes;
    seconds = (seconds < 10) ? ("0" + seconds) : seconds;

    $("#time" + row_index).html(hours + ":" + minutes + ":" + seconds);

    setInterval(function () {
        sec_num -= 1;
        if (sec_num <= 0)
            element.textContent = "BREACHED!!!"
        else
        {
            if (sec_num <= 1800) {
                if ($("#number" + row_index).css('color') == 'rgb(0, 0, 0)') {
                    $("#number" + row_index).css('background-color', 'red');
                    $("#time" + row_index).css('background-color', 'red');
                    $("#number" + row_index).css('color','white');
                    $("#time" + row_index).css('color','white');
                }
                else {
                    $("#number" + row_index).css('background-color', '#faffff');
                    $("#time" + row_index).css('background-color', '#faffff');
                    $("#number" + row_index).css('color','black');
                    $("#time" + row_index).css('color','black');
                }
            }
            hours   = Math.floor(sec_num / 3600);
            minutes = Math.floor((sec_num - (hours * 3600)) / 60);
            seconds = sec_num - (hours * 3600) - (minutes * 60);

            hours   = (hours < 10) ? ("0" + hours) : hours;
            minutes = (minutes < 10) ? ("0" + minutes) : minutes;
            seconds = (seconds < 10) ? ("0" + seconds) : seconds;

            $("#time" + row_index).html(hours + ":" + minutes + ":" + seconds);
        }
    }, 1000);
}

function writeTable(count) {
    table = document.querySelector('#tableprint');
    var myTable ="<table><tr><th>Ticket ID</th>";
    myTable+= "<th>Next SLA Breach</th>";
    myTable+="</tr>";

    for (i = 0; i < count; i++) {
        myTable+="<tr id='ticket_row'>";
        myTable+="<td id='number";
        myTable+=i;
        myTable+="'></td>";
        myTable+="<td id='time";
        myTable+=i;
        myTable+="'></td>";
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
        createTimer(formatDate(data[(i * 2) + 1]), i);
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
