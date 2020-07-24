var inquirer = require("inquirer");
const { exec } = require("child_process");

inquirer
  .prompt([
    {
      type: "list",
      message:
        "\n\nLet's get SonicJs up and running!\n\nWhich database would you like to use?",
      name: "database",
      choices: [
        "Flat File",
        "Mongo",
        "MySQL",
        "SQL Server",
        "PostgreSQL",
        "Oracle",
        "Redis",
        "SQLite3",
        "In-Memory",
        "Other...",
      ],
    },
  ])
  .then((answers) => {
    console.log(answers);
    exec("npm --version");
  })
  .catch((error) => {
    if (error.isTtyError) {
      // Prompt couldn't be rendered in the current environment
    } else {
      // Something else when wrong
    }
  });
