// JS File for Module: moralis
/* Moralis init code */
const serverUrl = "https://5vuta7xfoe0n.usemoralis.com:2053/server";
const appId = "OvJO9vCe1pwwLSXDQFT4nf2oQgzZyiI9aOvaCBt0";
Moralis.start({ serverUrl, appId });
console.log("moralis started");

/* Authentication code */
async function moralisLogin() {
    let user = Moralis.User.current();
    if (!user) {
      user = await Moralis.authenticate({
        signingMessage: "Log in using Moralis",
      })
        .then(function (user) {
          console.log("logged in user:", user);
          console.log(user.get("ethAddress"));
          sonicLogic(user);
        })
        .catch(function (error) {
          console.log('login error==>', error);
        });
    }
  }

  async function moralisLogOut() {
    await Moralis.User.logOut();
    console.log("logged out");
  }

  async function sonicLogic(user){
    axios.post(
        '/api-admin/moralis-login',
        user
    )
  }


$(document).ready(async function () {
  $(".moralis-metamask-login").on("click", function () {
    moralisLogin();
  });

  $(".moralis-metamask-logout").on("click", function () {
    moralisLogOut();
  });
});
