var ticketCount = {};

function createTimer(duration, row_index) {
    var eid = "time" + row_index;
    var sec_num = parseInt(duration, 10);
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    hours   = (hours < 10) ? ("0" + hours) : hours;
    minutes = (minutes < 10) ? ("0" + minutes) : minutes;
    seconds = (seconds < 10) ? ("0" + seconds) : seconds;

    document.getElementById(eid).textContent = hours + ":" + minutes + ":" + seconds;

    setTimeout(updateTimer(sec_num - 1, "#number" + row_index, "#assignee" + row_index, eid), 1000);
}

function updateTimer(sec_num, tic_num, asn_num, eid) {
    if (sec_num <= 0)
    {
        $(tic_num).css('background-color', 'red');
        $(asn_num).css('background-color', 'red');
        $("#" + eid).css('background-color', 'red');
        $(tic_num).css('color','white');
        $(asn_num).css('color', 'white');
        $("#" + eid).css('color','white');
        document.getElementById(eid).textContent = "BREACHED!!!"
    }
    else
    {
        if (sec_num <= 3600) {
            if ($(tic_num).css('color') == 'rgb(0, 0, 0)') {
                $(tic_num).css('background-color', 'red');
                $(asn_num).css('background-color', 'red');
                $("#" + eid).css('background-color', 'red');
                $(tic_num).css('color','white');
                $(asn_num).css('color', 'white');
                $("#" + eid).css('color','white');
            }
            else {
                $(tic_num).css('background-color', '#f8f8ff');
                $(asn_num).css('background-color', '#f8f8ff');
                $("#" + eid).css('background-color', '#f8f8ff');
                $(tic_num).css('color','black');
                $(asn_num).css('color','black');
                $("#" + eid).css('color','black');
            }
        }
        var hours   = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);

        hours   = (hours < 10) ? ("0" + hours) : hours;
        minutes = (minutes < 10) ? ("0" + minutes) : minutes;
        seconds = (seconds < 10) ? ("0" + seconds) : seconds;

        document.getElementById(eid).textContent = hours + ":" + minutes + ":" + seconds;
    }

    setTimeout(function() {
        updateTimer(sec_num - 1, tic_num, asn_num, eid);
    }, 1000);
}

function writeTable(count) {
    table = document.querySelector('#tablePrint');
    var myTable ="<table><tr><th>Ticket ID</th>";
    myTable+= "<th>Next SLA Breach</th>";
    myTable+= "<th>Assignee</th>";
    myTable+="</tr>";

    for (i = 0; i < count; i++) {
        myTable+="<tr>";
        myTable+="<td id='number";
        myTable+=i;
        myTable+="'></td>";
        myTable+="<td id='time";
        myTable+=i;
        myTable+="'>";
        myTable+="<td id='assignee";
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
    data2=$('#assignees').contents().text().split("\n");
    table=document.getElementById("tablePrint");

    for (i = 0; i < ticketCount.count; i++)
    {
        num="number" + i;
        asn="assignee" + i;
        document.getElementById(num).innerHTML = data[i * 2];
        document.getElementById(asn).innerHTML = data2[i].substr(data2[i].indexOf(" ") + 1);
        createTimer(formatDate(data[(i * 2) + 1]), i);
    }
}

function formatDate(time) {
    utime=Date.parse(time)/1000;
    ctime= + Date;
    ctime=Math.round((new Date()).getTime() / 1000);
    time=utime-ctime;
    time=(time-((new Date()).getTimezoneOffset() * 60));
    //time=time-25200; //HARDCODED TIMESHIFT FOR PDT
    return time;
}

function fullReload() {
    reloadIFrame();
    document.getElementById("SLAtimes").contentDocument.location.reload(true);
    document.getElementById("assignees").contentDocument.location.reload(true);
//    location.reload()
    ticketCount.count=readCount();
    writeTable(ticketCount.count);
    populateTable();
}

window.onload = function () {
    fullReload();
    window.setInterval("fullReload()", 180000);
};
