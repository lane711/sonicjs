// this is a script to load data into the database for performance testing purposes

import { test, expect } from "@playwright/test";
import { faker } from '@faker-js/faker';

// Annotate entire file as serial.
test.describe.configure({ mode: 'serial' });

const baseUrl = 'https://demo.sonicjs.com';

const adminCredentials = {
  email: "demo@demo.com",
  password: "sonicjs!",
};
var token = "";

test.beforeAll(async ({ request }) => {
  token = await loginAsAdmin(request);
  console.log('token', token);
});

async function loginAsAdmin(request) {
  const response = await request.post(`${baseUrl}/api/v1/auth/login`, {
    data: adminCredentials,
    headers: {
      "Content-Type": "application/json",
    },
  });
  const { bearer } = await response.json();
  return bearer;
}

test("create 10 employees", async ({ request }) => {
  for (let i = 0; i < 10; i++) {
    const employee = generateEmployee();
    console.log('employee', employee);
    const response = await createEmployee(request, token, employee);
    expect(response.status()).toBe(201);
  }
});

const createEmployee = async (request, token, employee) => {
  const response = await request.post(`${baseUrl}/api/v1/employees`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: {data: employee},
  });

  return response;
};

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

function generateEmployee() {
  const gender = genders[randomIntFromInterval(0, 1)];
  const firstName = faker.person.firstName(gender.toLowerCase());
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
  // console.log(firstName, gender)
  return {
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
}


function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}