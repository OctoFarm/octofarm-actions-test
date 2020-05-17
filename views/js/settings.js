import Client from "./lib/octofarm.js";
import UI from "./lib/functions/ui.js";
import Calc from "./lib/functions/calc.js";
import FileOperations from "./lib/functions/file.js";


//Add listeners to settings
document.getElementById("saveServerSettings").addEventListener("click", e => {
  //Validate Printer Form, then Add
  ServerSettings.update();
});
document.getElementById("saveSettings").addEventListener("click", e => {
  //Validate Printer Form, then Add
  ClientSettings.update();
});
let optionsMemory = {
    title: {
        text: "Memory",
        align: 'center',
        margin: 1,
        offsetX: 0,
        offsetY: 0,
        floating: false,
        style: {
            fontSize: '14px',
            fontWeight: 'bold',
            fontFamily: undefined,
            color: '#fff',
        },
    },
    chart: {
        type: 'donut',
        height: '150px',
        animations: {
            enabled: false,
        },
        background: '#303030'
    },
    theme: {
        mode: 'dark',
    },
    plotOptions: {
        pie: {
            expandOnClick: true,
            dataLabels: {
                offset: 10,
                minAngleToShowLabel: 15
            },
        }
    },
    stroke: {
        show: false,
    },
    tooltip: {
        y: {
            formatter: function(val) {
                return Calc.bytes(val)
            },
        }
    },
    noData: {
        text: 'Loading...'
    },
    dataLabels: {
        enabled: false,
    },
    series: [],
    labels: ['Other', 'OctoFarm', 'Free'],
    colors: ['#f39c12', '#3498db', '#00bc8c'],
    legend: {
        show: true,
        showForSingleSeries: false,
        showForNullSeries: true,
        showForZeroSeries: true,
        position: 'bottom',
        horizontalAlign: 'center',
        floating: false,
        fontSize: '11px',
        fontFamily: 'Helvetica, Arial',
        fontWeight: 400,
        formatter: undefined,
        inverseOrder: false,
        width: undefined,
        height: undefined,
        tooltipHoverFormatter: undefined,
        offsetX: -25,
        offsetY: 0,
        labels: {
            colors: undefined,
            useSeriesColors: false
        },
        markers: {
            width: 9,
            height: 9,
            strokeWidth: 0,
            strokeColor: '#fff',
            fillColors: undefined,
            radius: 1,
            customHTML: undefined,
            onClick: undefined,
            offsetX: 0,
            offsetY: 0
        },
        itemMargin: {
            horizontal: 1,
            vertical: 0
        },
        onItemClick: {
            toggleDataSeries: false
        },
        onItemHover: {
            highlightDataSeries: false
        },
    }
};
let optionsCPU = {
    title: {
        text: "CPU",
        align: 'center',
        margin: 1,
        offsetX: 0,
        offsetY: 0,
        floating: false,
        style: {
            fontSize: '14px',
            fontWeight: 'bold',
            fontFamily: undefined,
            color: '#fff'
        },
    },
    chart: {
        type: 'donut',
        height: '150px',
        animations: {
            enabled: true,
        },
        background: '#303030'
    },
    theme: {
        mode: 'dark',
    },
    plotOptions: {
        pie: {
            expandOnClick: false,
            dataLabels: {
                offset: 10,
                minAngleToShowLabel: 15
            },
        }
    },
    stroke: {
        show: false,
    },
    tooltip: {
        y: {
            formatter: function(val) {
                return Math.round(val * 10) / 10 + "%"
            },
        }
    },
    noData: {
        text: 'Loading...'
    },
    dataLabels: {
        enabled: false,
    },
    series: [],
    labels: ['System', 'OctoFarm', 'User', 'Free'],
    colors: ['#f39c12', '#3498db', '#375a7f', '#00bc8c'],
    legend: {
        show: true,
        showForSingleSeries: false,
        showForNullSeries: true,
        showForZeroSeries: true,
        position: 'bottom',
        horizontalAlign: 'center',
        floating: false,
        fontSize: '11px',
        fontFamily: 'Helvetica, Arial',
        fontWeight: 400,
        formatter: undefined,
        inverseOrder: false,
        width: undefined,
        height: undefined,
        tooltipHoverFormatter: undefined,
        offsetX: -25,
        offsetY: 0,
        labels: {
            colors: undefined,
            useSeriesColors: false
        },
        markers: {
            width: 9,
            height: 9,
            strokeWidth: 0,
            strokeColor: '#fff',
            fillColors: undefined,
            radius: 1,
            customHTML: undefined,
            onClick: undefined,
            offsetX: 0,
            offsetY: 0
        },
        itemMargin: {
            horizontal: 1,
            vertical: 0
        },
        onItemClick: {
            toggleDataSeries: false
        },
        onItemHover: {
            highlightDataSeries: false
        },
    }
};
let systemChartCPU = new ApexCharts(
    document.querySelector("#systemChartCPU"),
    optionsCPU
);
systemChartCPU.render();
let systemChartMemory = new ApexCharts(
    document.querySelector("#systemChartMemory"),
    optionsMemory
);
systemChartMemory.render();
setInterval(async function updateStatus() {
    if(document.getElementById("serverSettingsModal").classList.contains("show")){
        let systemInfo = await Client.get("settings/sysInfo");
        systemInfo = await systemInfo.json();
        if (Object.keys(systemInfo).length === 0 && systemInfo.constructor === Object) {

        } else {
            document.getElementById("systemUpdate").innerHTML = Calc.generateTime(
                systemInfo.sysUptime.uptime
            );
            //labels: ['System', 'OctoFarm', 'User', 'Free'],
            let cpuLoad = systemInfo.cpuLoad.currentload_system;
            let octoLoad = systemInfo.sysProcess.pcpu;
            let userLoad = systemInfo.cpuLoad.currentload_user;
            let remain = cpuLoad + octoLoad + userLoad;
            systemChartCPU.updateSeries([cpuLoad, octoLoad, userLoad, 100 - remain])

            let otherRAM = systemInfo.memoryInfo.total - systemInfo.memoryInfo.free
            let octoRAM = systemInfo.memoryInfo.total / 100 * systemInfo.sysProcess.pmem
            let freeRAM = systemInfo.memoryInfo.free

            systemChartMemory.updateSeries([otherRAM, octoRAM, freeRAM])

        }
    }
}, 5000)

class ClientSettings {
  static init() {
    if (
      !document.getElementById("systemDropDown").classList.contains("notyet")
    ) {
      Client.get("settings/client/get")
        .then(res => {
          return res.json();
        })
        .then(res => {
          //localStorage.setItem("clientSettings", JSON.stringify(res));
          if (res.settings.backgroundURL != null) {
            document.getElementById("clientBackground").value =
              res.settings.backgroundURL;

            document.body.style.backgroundImage =
              "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(" +
              res.settings.backgroundURL +
              ")";
          }
          document.getElementById("panelCurrentOpOn").checked =
            res.panelView.currentOp;
          document.getElementById("panelHideOffline").checked =
            res.panelView.hideOff;
          document.getElementById("panelHideClosed").checked =
            res.panelView.hideClosed;

          document.getElementById("cameraCurrentOpOn").checked =
            res.cameraView.currentOp;
          document.getElementById("selectCameraGrid").value =
            res.cameraView.cameraRows;
          document.getElementById("cameraHideClosed").checked =
            res.cameraView.hideClosed;

          document.getElementById("listCurrentOpOn").checked =
            res.listView.currentOp;
          document.getElementById("listHideOffline").checked =
            res.listView.hideOff;
          document.getElementById("listHideClosed").checked =
            res.listView.hideClosed;
        });
    }
  }
  static async update() {
    let bg = document.getElementById("clientBackground").value;
    let bgVal = null;
    if (bg != null && bg != "") {
      bgVal = bg;
    }
    let opts = {
      settings: {
        backgroundURL: bgVal
      },
      panelView: {
        currentOp: document.getElementById("panelCurrentOpOn").checked,
        hideOff: document.getElementById("panelHideOffline").checked,
        hideClosed: document.getElementById("panelHideClosed").checked
      },
      listView: {
        currentOp: document.getElementById("listCurrentOpOn").checked,
        hideOff: document.getElementById("listHideOffline").checked,
        hideClosed: document.getElementById("listHideClosed").checked
      },
      cameraView: {
        currentOp: document.getElementById("cameraCurrentOpOn").checked,
        cameraRows: document.getElementById("selectCameraGrid").value,
        hideClosed: document.getElementById("cameraHideClosed").checked
      }
    };

    let post = await Client.post("settings/client/update", opts);
    localStorage.setItem("clientSettings", JSON.stringify(opts));
    UI.createAlert("success", "Client settings updated", 3000, "clicked");
    location.reload();
  }
  static get() {
    //return JSON.parse(localStorage.getItem("clientSettings"));
  }
}
class ServerSettings {
  static async init() {
    if (
      !document.getElementById("systemDropDown").classList.contains("notyet")
    ) {
      Client.get("settings/server/get")
        .then(res => {
          return res.json();
        })
        .then(res => {
          document.getElementById("onlinePollRate").value =
            res.onlinePolling.seconds;

        });
        let logList = await Client.get("settings/server/get/logs")
        logList = await logList.json();
        let logTable = document.getElementById("serverLogs");
        logList.forEach(logs => {
            logTable.insertAdjacentHTML('beforeend', `
            <tr>
                <td>${logs.name}</td>
                <td>${new Date(logs.modified).toString().substring(0, 21)}</td>
                <td>${Calc.bytes(logs.size)}</td>
                <td><button id="${logs.name}" type="button" class="btn btn-sm btn-primary"><i class="fas fa-download"></i></button></td>
            </tr>
        `)
            document.getElementById(logs.name).addEventListener('click', async event => {
              let body = {
                  logName: logs.name
              }
              window.open('/settings/server/download/logs/'+logs.name)

            });
        })

    }
  }
  static update() {
    let onlinePoll = document.getElementById("onlinePollRate").value;
    let onlinePolling = {
      seconds: onlinePoll
    };
    document.getElementById("overlay").style.display = "block";
    UI.createAlert(
      "success",
      "Settings updated, please wait whilst the server restarts...<br> This may take some time...<br> The page will automatically refresh when complete.... ",
      10000,
      "clicked"
    );
    Client.post("settings/server/update", { onlinePolling })
      .then(res => {
        return res.json();
      })
      .then(res => {
        location.reload();
      });
  }
}

//Initialise Settings
ServerSettings.init();
ClientSettings.init();
