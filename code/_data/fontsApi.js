import Fetch from "@11ty/eleventy-fetch";

let url =
  "https://fonts.googleapis.com/css?family=Host+Grotesk:400&display=swap";
let fontCss = await Fetch(url, {
  duration: "1d",
  type: "text",
  fetchOptions: {
    headers: {
      // lol
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36",
    },
  },
});
