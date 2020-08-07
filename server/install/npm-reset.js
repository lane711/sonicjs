var inquirer = require("inquirer");
var ui = new inquirer.ui.BottomBar();
var exec = require("child_process").exec;
const fs = require("fs");
var path = require("path");
const { parse, stringify } = require("envfile");

var debug = false; //typeof v8debug === "object";

console.log(
  `WARNING: Running this reset will restore all data and configuration to \nits default state (to what they were right after you cloned the repo).\n\n`
);

console.log(`███████╗ ██████╗ ███╗   ██╗██╗ ██████╗     ██╗███████╗
██╔════╝██╔═══██╗████╗  ██║██║██╔════╝     ██║██╔════╝
███████╗██║   ██║██╔██╗ ██║██║██║          ██║███████╗
╚════██║██║   ██║██║╚██╗██║██║██║     ██   ██║╚════██║
███████║╚██████╔╝██║ ╚████║██║╚██████╗╚█████╔╝███████║
╚══════╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝ ╚═════╝ ╚════╝ ╚══════╝
                                                      `);

if (debug) {
  performReset();
} else {
  inquirer
    .prompt([
      {
        type: "list",
        message: "Reset All Data and Configuration?",
        name: "reset",
        choices: [
          { name: "No", value: "false" },
          { name: "Yes (ALL DATA WILL BE LOST!)", value: "true" },
        ],
      },
    ])
    .then((answers) => {
      let doReset = answers.reset;

      // console.log(doReset);

      if (doReset == "true") {
        performReset();
      } else {
        console.log("Reset canceled.");
      }

      // installDBDriver(dbType);
    })
    .catch((error) => {
      console.log(error);
      if (error.isTtyError) {
        // Prompt couldn't be rendered in the current environment
      } else {
        // Something else when wrong
      }
    });
}

function performReset() {
  reCopyDatasourcesJson();
  resetDataJson();
  setEnvVarToEnsureMigrationWillRunAgain();
  writeConfig();
  // deleteNodeModules();
  // showResetSuccessfulMessage();
}

function reCopyDatasourcesJson() {
  fs.createReadStream("server/datasources.original.json").pipe(
    fs.createWriteStream("server/datasources.json")
  );

  fs.createReadStream("server/datasources.original.json").pipe(
    fs.createWriteStream("server/datasources.local.json")
  );

  console.log(
    "\nSuccess!\n\nInfo: datasources.json and datasources.local.json reset to use flat file database."
  );
}

function deleteNodeModules() {
  let sourcePath = path.join(__dirname, "node_modules");

  fs.rmdirSync(sourcePath, { recursive: true });
}

function resetDataJson() {
  fs.createReadStream("server/data/data.original.json").pipe(
    fs.createWriteStream("server/data/data.json")
  );
}

// function showResetSuccessfulMessage() {
//   ui.log.write(`\nReset successful!\n\nNow run "npm run setup"`);
// }

async function writeConfig() {
  // console.log(config);
  let data = fs.readFileSync("server/datasources.original.json");
  let configFile = JSON.parse(data);
  // console.log(configFile);

  // //remove db and db-user
  // delete configFile.db;
  // delete configFile["db-user"];

  // //add new config
  // configFile.primary = config;
  // // console.log(configFile);

  //write new config
  let newConfigFile = JSON.stringify(configFile, null, 2);

  fs.writeFile("server/datasources.json", newConfigFile, (err) => {
    if (err) throw err;
    console.log("\nConfig file updated (server/datasources.json)");
  });

  fs.writeFile("server/datasources.local.json", newConfigFile, (err) => {
    if (err) throw err;
    console.log("\nConfig file updated (server/datasources.local.json)");
  });
}

async function setEnvVarToEnsureMigrationWillRunAgain() {
  let sourcePath = path.join(__dirname, "../..", ".env");

  fs.readFile(sourcePath, "utf8", function (err, data) {
    console.log(data);
    if (err) {
      return console.log(err);
    }
    let parsedFile = parse(data);
    parsedFile.RUN_NEW_SITE_MIGRATION = "TRUE";

    fs.writeFileSync(sourcePath, stringify(parsedFile));

    console.log(
      "INPORTANT: you must manually delete the node_module folder to fully reset the install."
    );
  });
}
