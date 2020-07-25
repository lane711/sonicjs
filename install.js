var inquirer = require("inquirer");
// const { exec } = require("child_process");
var exec = require("child_process").exec;

inquirer
  .prompt([
    {
      type: "list",
      message:
        "\n\nLet's get SonicJs up and running!\n\nWhich database would you like to use?",
      name: "database",
      choices: [
        "Flat File",
        "MongoDB",
        "MySQL",
        { name: "SQL Server", value: "mssql" },
        "PostgreSQL",
        "Oracle",
        "Redis",
        "SQLite3",
        "In-Memory",
        "Cassandra",
        "Cloudant",
        "DashDB",
        "Db2",
        { name: "DB2 iSeries", value: "DB2iSeries" },
        { name: "DB2 for z/OS", value: "db2z" },
        "Informix",
        "OpenAPI",
      ],
    },
  ])
  .then((answers) => {
    console.log("Installing database drivers. This may take up to a minute...");
    let dbType = answers.database.replace(" ", "").toLower();

    var cmd = exec(`npm install loopback-connector-${dbType} --save`, function (
      err,
      stdout,
      stderr
    ) {
      if (err) {
        // handle error
      }
      console.log(stdout);
    });

    dir.on("exit", function (code) {
      // return value from "npm build"
    });
  })
  .catch((error) => {
    if (error.isTtyError) {
      // Prompt couldn't be rendered in the current environment
    } else {
      // Something else when wrong
    }
  });
