const express = require("express");
const router = express.Router();
const Printers = require("../models/Printer.js");
const { ensureAuthenticated } = require("../config/auth");
// User Modal
const runner = require("../runners/state.js");
const Runner = runner.Runner;

/* //Login Page
router.get("/login", (req, res) => res.render("login"));
//Register Page
router.get("/register", (req, res) => res.render("register")); */

//Register Handle for Saving printers
router.post("/removefile", ensureAuthenticated, async (req, res) => {
  //Check required fields
  const file = req.body;
  Runner.removeFile(file.i, file.fullPath);
  res.send("success");
});
router.post("/removefolder", ensureAuthenticated, async (req, res) => {
  //Check required fields
  const folder = req.body;

  Runner.deleteFolder(folder.index, folder.fullPath);
  res.send("success");
});
router.post("/resyncFile", ensureAuthenticated, async (req, res) => {
  //Check required fields
  const file = req.body;
  let ret = null;
  if (file.fullPath != undefined) {
    ret = await Runner.reSyncFile(file.i, file.fullPath);
  } else {
    ret = await Runner.reSyncFile(file.i);
  }
  res.send(ret);
});
router.post("/stepChange", ensureAuthenticated, async (req, res) => {
  //Check required fields
  const step = req.body;
  Runner.stepRate(step.printer, step.newSteps);
  res.send("success");
});
router.post("/flowChange", ensureAuthenticated, async (req, res) => {
  //Check required fields
  const step = req.body;
  Runner.flowRate(step.printer, step.newSteps);
  res.send("success");
});
router.post("/feedChange", ensureAuthenticated, async (req, res) => {
  //Check required fields
  const step = req.body;
  Runner.feedRate(step.printer, step.newSteps);
  res.send("success");
});
router.post("/updateSettings", ensureAuthenticated, async (req, res) => {
  //Check required fields
  const settings = req.body;
  Runner.updateSettings(settings.index, settings.options);
  let printer = await Printers.findOne({ index: settings.index });
  if (typeof settings.options.camURL != "undefined")
    printer.camURL = settings.options.camURL;
  await printer.save();
  res.send("success");
});
//Register Handle for Saving printers
router.post("/save", ensureAuthenticated, async (req, res) => {
  //Check required fields
  const printers = req.body;
  Runner.stopAll();
  await Printers.deleteMany({}).catch(err => console.log(err));
  for (let i = 0; i < printers.length; i++) {
    let newPrinter = await new Printers(printers[i]);
    await newPrinter.save();
  }
  let run = await Runner.init();
  res.send(printers);
});

//Register handle for initialising runners
router.post("/runner/init", ensureAuthenticated, (req, res) => {
  res.send("Initialised Printers");
});
router.post("/delete", ensureAuthenticated, async (req, res) => {
  await Runner.stopAll();
  await Printers.deleteMany({}).catch(err => console.log(err));
  await Runner.init();
  res.send("Deleted Printers");
});
router.get("/printerInfo", ensureAuthenticated, async (req, res) => {
  let printers = await Runner.returnFarmPrinters();
  let printerInfo = [];
  for (let i = 0; i < printers.length; i++) {
    let printer = {
      state: printers[i].state,
      index: printers[i].index,
      ip: printers[i].ip,
      port: printers[i].port,
      camURL: printers[i].camURL,
      apikey: printers[i].apikey,
      flowRate: printers[i].flowRate,
      feedRate: printers[i].feedRate,
      stepRate: printers[i].stepRate,
      filesList: printers[i].fileList,
      stateColour: printers[i].stateColour
    };
    await printerInfo.push(printer);
  }

  res.send(printerInfo);
});
//Register handle for checking for offline printers
router.post("/runner/checkOffline", ensureAuthenticated, async (req, res) => {
  let checked = [];
  let farmPrinters = Runner.returnFarmPrinters();

  for (let i = 0; i < farmPrinters.length; i++) {
    if (farmPrinters[i].state === "Offline") {
      let client = {
        index: i
      };
      //Make sure runners are created ready for each printer to pass between...
      await Runner.setOffline(client);
      checked.push(i);
    }
  }
  res.send({
    printers: checked,
    msg: " If they were found they will appear online shortly."
  });
});
router.post("/fileList", ensureAuthenticated, async (req, res) => {
  let index = req.body.i;
  let files = await Runner.returnFileList(index);
  let storage = await Runner.returnStorage(index);
  if (typeof files != "undefined") {
    res.send({ files: files, storage: storage });
  } else {
    res.send({ files: "EMPTY", storage: storage });
  }
});
router.post("/moveFile", ensureAuthenticated, async (req, res) => {
  let data = req.body;
  if (data.newPath === "/") {
    data.newPath = "local";
    data.newFullPath = data.newFullPath.replace("//", "");
  }
  Runner.moveFile(data.index, data.newPath, data.newFullPath, data.fileName);
  res.send({ msg: "success" });
});
router.post("/moveFolder", ensureAuthenticated, async (req, res) => {
  let data = req.body;
  Runner.moveFolder(
    data.index,
    data.oldFolder,
    data.newFullPath,
    data.folderName
  );
  res.send({ msg: "success" });
});

router.post("/newFiles", ensureAuthenticated, async (req, res) => {
  let data = req.body;
  Runner.newFile(data);
  res.send({ msg: "success" });
});
module.exports = router;
