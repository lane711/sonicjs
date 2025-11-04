// run this script with:
// node src/db/utils/bulk-data.ts > ./src/db/utils/output/inserts.sql
// then run the output.sql file to create the records in the database:
// npx wrangler d1 execute sonicjs --local --file=./src/db/utils/output/inserts.sql
// npx wrangler d1 execute sonicjs --remote --file=./src/db/utils/output/inserts.sql

import { faker } from "@faker-js/faker";
const recordCount = 100;

const main = async () => {
  for (let i = 0; i < recordCount; i++) {
    const employee = await generateEmployee();
    // console.log(employee);
    await createEmployeeViaSQL(employee);
  }
};

async function createEmployeeViaSQL(employee) {
  // console.log(employee);

  const sql = `insert into employees(id, firstName, lastName, fullName, email, phone, jobTitle, department, gender, region) values ("${employee.id}","${employee.firstName}","${employee.lastName}","${employee.fullName}","${employee.email}","${employee.phone}","${employee.jobTitle}","${employee.department}","${employee.gender}","${employee.region}");`;
  console.log(sql);
}

const genders = ["Male", "Female"];
const departments = [
  "Marketing",
  "Sales",
  "Engineering",
  "Human Resources",
  "Customer Service",
  "Finance",
  "Operations",
  "IT",
];
const regions = ["Northeast", "Southwest", "West", "Southeast", "Midwest"];

async function generateEmployee() {
  const id = faker.string.uuid();
  const gender = genders[randomIntFromInterval(0, 1)];
  const firstName = faker.person.firstName(gender.toLowerCase() as "female" | "male");
  const lastName = faker.person.lastName();
  const fullName = `${firstName} ${lastName}`;
  const department =
    departments[randomIntFromInterval(0, departments.length - 1)];
  const jobTitle = faker.person.jobTitle();
  const phone = `${randomIntFromInterval(100, 990)}-${randomIntFromInterval(
    100,
    990
  )}-${randomIntFromInterval(1000, 9999)}`;
  const region = regions[randomIntFromInterval(0, regions.length - 1)];
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@nowhere.com`;

  const employee = {
    id,
    firstName,
    lastName,
    fullName,
    email,
    phone,
    jobTitle,
    department,
    gender,
    region,
  };
  //   console.log(employee);
  return employee;
}

function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

main();
