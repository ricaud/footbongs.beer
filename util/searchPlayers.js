let FlexSearch = require("flexsearch");
let index;

export function initializeSearchIndex(players) {
  index = new FlexSearch({
    doc: {
      id: "name",
      profile: "speed",
      field: {
        name: {},
      },
    },
  });

  index.add(players);
}

export function searchPlayers(searchString, applySearchCallback) {
  if (index) {
    let result = index.where(
      function (item) {
        return !!item.name.toLowerCase().includes(searchString.toLowerCase());
      },
      (result) => {
        applySearchCallback(result);
      }
    );
    applySearchCallback(result);
  }
}
