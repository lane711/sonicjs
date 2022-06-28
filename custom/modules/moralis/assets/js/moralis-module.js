// JS File for Module: moralis
/* Moralis init code */
const serverUrl = "https://5vuta7xfoe0n.usemoralis.com:2053/server";
const appId = "OvJO9vCe1pwwLSXDQFT4nf2oQgzZyiI9aOvaCBt0";
Moralis.start({ serverUrl, appId });

// !async function(){
//   const options = {
//     address: "0x772770fA1ce3196A1c895Fbe49a634dCe758D87d",
//     chain: "polygon",
//   };
//   const NFTs = await Moralis.Web3API.token.getAllTokenIds(options);
//   console.log(NFTs);
// }();


async function moralisLogin() {

  user = await Moralis.authenticate({
    signingMessage: "Log in using Moralis",
  })
    .then(async function (moralisUser) {
      await sonicRegister(moralisUser);
      const sonicUser = await sonicLogin({ username: moralisUser.id, password: moralisUser.id });
      await sonicRegisterFinalize({moralisUser, sonicUser});
      //TODO: this could be streamlined. needing to logout, then back in so that profile data tied to passport session
      await axios.get("/logout");
      await sonicLogin({ username: moralisUser.id, password: moralisUser.id });

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
  return axios.post("/api-admin/moralis-register", user);
}
async function sonicRegisterFinalize(user) {
  return axios.post("/api-admin/moralis-register-finalize", user);
}

async function sonicLogin(user) {
  return axios.post("/login-user", user);
}

$(document).ready(async function () {
  $(".moralis-metamask-login").on("click", function () {
    moralisLogin();
  });

  $(".moralis-metamask-logout").on("click", function () {
    moralisLogOut();
  });
});
