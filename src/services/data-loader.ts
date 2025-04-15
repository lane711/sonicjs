const { faker } = require("@faker-js/faker");
const baseUrl = "http://localhost:4321";

const adminCredentials = {
  email: "demo@demo.com",
  password: "sonicjs!",
};

(async () => {
  try {
    const request = new Request(baseUrl);
    const token = await loginAsAdmin(request);
    const employee = await createEmployee(request, token);
    const user = await createEmployee(request, token);
    console.log("Test user created:", user);
  } catch (error) {
    console.error("Error in self-executing function:", error);
  }
})();

const createEmployee = async (request, token) => {
  const response = await request.post(`/api/v1/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: {
      data: {
        email: "e2e!!@test.com",
        password: "newpassword123abc",
        firstName: "Demo",
        lastName: "User",
      },
    },
  });

  return response;
};

async function loginAsAdmin(request) {
  const response = await request.post(`/api/v1/auth/login`, {
    data: adminCredentials,
    headers: {
      "Content-Type": "application/json",
    },
  });
  const { bearer } = await response.json();
  return bearer;
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

function generateEmployee() {
  const gender = genders[randomIntFromInterval(0, 1)];
  const firstName = faker.person.firstName(
    gender.toLowerCase() as "female" | "male"
  );
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
