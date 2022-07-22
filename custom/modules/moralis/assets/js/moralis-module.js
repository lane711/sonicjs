// JS File for Module: moralis
const serverUrl = "https://5vuta7xfoe0n.usemoralis.com:2053/server";
const appId = "OvJO9vCe1pwwLSXDQFT4nf2oQgzZyiI9aOvaCBt0";
Moralis.start({ serverUrl, appId });


async function moralisLogin() {
  user = await Moralis.authenticate({
    signingMessage: "Log in using Moralis",
  })
    .then(async function (moralisUser) {
      await sonicRegister(moralisUser);
      const sonicUser = await sonicLogin({
        username: moralisUser.id,
        password: moralisUser.id,
      });
      await sonicRegisterFinalize({ moralisUser, sonicUser });
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
    $(".login-control .init").hide();
    $(".login-control .loading").show();
    moralisLogin();
  });

  $(".moralis-metamask-logout").on("click", function () {
    moralisLogOut();
  });


  lazyLoadNftImages($);
});

function lazyLoadNftImages($){
  const nftImagesToLoad = $("img[data-src]");

  if (nftImagesToLoad) {
    nftImagesToLoad.each(function () {
      let src = $(this).data("src");
      $( this ).attr( "src", src );
    });
  }
}
