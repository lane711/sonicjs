// JS File for Module: moralis
/* Moralis init code */
const serverUrl = "https://5vuta7xfoe0n.usemoralis.com:2053/server";
const appId = "OvJO9vCe1pwwLSXDQFT4nf2oQgzZyiI9aOvaCBt0";
Moralis.start({ serverUrl, appId });
console.log("moralis started");

async function moralisLogin() {

  debugger;
  user = await Moralis.authenticate({
    signingMessage: "Log in using Moralis",
  })
    .then(async function (moralisUser) {
      await sonicRegister(moralisUser);
      const sonicUser = await sonicLogin({ username: moralisUser.id, password: moralisUser.id });
      await sonicRegisterFinalize({moralisUser, sonicUser});
      location.reload();
    })
    .catch(function (error) {
      console.log("login error==>", error);
    });
  // }
}

async function moralisLogOut() {
  await Moralis.User.logOut();
  await axios.get("/logout");
  location.reload();
}

async function sonicRegister(user) {
  await axios.post("/api-admin/moralis-register", user);
}
async function sonicRegisterFinalize(user) {
  await axios.post("/api-admin/moralis-register-finalize", user);
}

async function sonicLogin(user) {
  return await axios.post("/login-user", user);
}

$(document).ready(async function () {
  $(".moralis-metamask-login").on("click", function () {
    moralisLogin();
  });

  $(".moralis-metamask-logout").on("click", function () {
    moralisLogOut();
  });
});
