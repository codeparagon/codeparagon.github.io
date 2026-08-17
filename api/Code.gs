function doPost(e) {
  return handle_(e);
}

function doGet(e) {
  return handle_(e);
}

function handle_(e) {
  var data = {};
  if (e && e.postData && e.postData.contents) {
    try {
      data = JSON.parse(e.postData.contents);
    } catch (err) {
      data = {};
    }
  }
  if (e && e.parameter) {
    Object.keys(e.parameter).forEach(function (k) {
      data[k] = e.parameter[k];
    });
  }
  if (data.key !== "nayab-k7m2p9" || (data.event !== "yes" && data.event !== "no")) {
    return ContentService.createTextOutput("no");
  }
  MailApp.sendEmail(
    "mirzaahmar1@gmail.com",
    data.title || "Proposal update",
    (data.message || data.event) + "\n\n" + new Date()
  );
  return ContentService.createTextOutput("ok");
}
