(() => {
  // src/popup/index.ts
  if (window?.navigator?.language.startsWith("de")) {
    const title = document.getElementById("title");
    if (title) {
      title.innerText = "Ups, diese Seite wird nicht unterst\xFCtzt!";
    }
    const description = document.getElementById("description");
    if (description) {
      description.innerText = "Keine Sorge! Klicke einfach auf unsere Empfehlung, und wir finden die perfekte Second-Hand-Alternative f\xFCr dich!";
    }
    const badgeText1 = document.getElementById("badge-text-1");
    if (badgeText1) {
      badgeText1.innerText = "Amazon";
    }
    const badgeLink1 = document.getElementById("badge-link-1");
    if (badgeLink1) {
      badgeLink1.href = "https://amazon.de";
    }
    const badgeText2 = document.getElementById("badge-text-2");
    if (badgeText2) {
      badgeText2.innerText = "Die Mitternachtsbibliothek";
    }
    const badgeLink2 = document.getElementById("badge-link-2");
    if (badgeLink2) {
      badgeLink2.href = "https://www.goodreads.com/book/show/55921837-die-mitternachtsbibliothek?from_search=true&from_srp=true&qid=UFFBR0mUQv&rank=1";
    }
    const badgeText3 = document.getElementById("badge-text-3");
    if (badgeText3) {
      badgeText3.innerText = "Harry Potter";
    }
    const badgeLink3 = document.getElementById("badge-link-3");
    if (badgeLink3) {
      badgeLink3.href = "https://www.goodreads.com/book/show/142293.Harry_Potter_und_der_Stein_der_Weisen?from_search=true&from_srp=true&qid=gd7epdkEWP&rank=1";
    }
  }
})();
