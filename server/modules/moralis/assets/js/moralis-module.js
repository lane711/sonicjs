// JS File for Module: moralis
/* Moralis init code */
const serverUrl = "https://5vuta7xfoe0n.usemoralis.com:2053/server";
const appId = "OvJO9vCe1pwwLSXDQFT4nf2oQgzZyiI9aOvaCBt0";
Moralis.start({ serverUrl, appId });
console.log("moralis started");

/* Authentication code */
async function moralisLogin() {
  // debugger;
    // let user = Moralis.User.current();
    // if (user) {
    //   //user already logged into moralis, now login to sonic
    //   sonicLogin({username: user.id, password: user.id})
    // } else{
      user = await Moralis.authenticate({
        signingMessage: "Log in using Moralis",
      })
        .then(async function (user) {

          await sonicRegister(user);
          await sonicLogin({username: user.id, password: user.id});
          location.reload();

        })
        .catch(function (error) {
          console.log('login error==>', error);
        });
    // }
  }

  async function moralisLogOut() {
    await Moralis.User.logOut();
    console.log("logged out");
  }

  async function sonicRegister(user){
    await axios.post(
        '/api-admin/moralis-register',
        user
    )
  }

  async function sonicLogin(user){
    axios.post(
        '/login',
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
